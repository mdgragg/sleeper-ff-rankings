import React, { useEffect, useState } from "react";
import Standings from "../components/Standings";
import { supabase } from "../lib/supabase";

interface Owner {
  ownerID: string;
  wins: number;
  losses: number;
  ties: number;
  streak: string;
  roster_id: number;
  moves: number;
  waiverOrder: number;
  pointsFor: string;
  pointsAgainst: string;
  pointsPossible: string;
  pointsPossiblePerc: string;
  addDropCount: number;
  TradeCount: number;
  avatar?: string;
  teamAvatar?: string;
  userName?: string;
  teamName?: string;
  matchupPoints?: number;
  matchupID?: string;
}

interface LeagueData {
  season: string;
  name: string;
  owners: Owner[];
  currentWeek: number;
  size: number;
}

interface Config {
  teamExtras: Record<string, { blurb?: string; image?: string; gif?: string }>;
  previousChamps: Record<string, string>;
}

const DEFAULT_LEAGUE_ID = "1247579709596782592";

function SeasonRecap() {
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [config, setConfig] = useState<Config>({
    teamExtras: {},
    previousChamps: {},
  });
  const [appStatus, setAppStatus] = useState<"loading" | "loaded" | "failed">(
    "loading"
  );

  useEffect(() => {
    async function fetchLeagueData() {
      try {
        const leagueID = DEFAULT_LEAGUE_ID;
        const apiBase = "https://api.sleeper.app/v1/";

        const leagueResp = await fetch(`${apiBase}league/${leagueID}`);
        const leagueJSON = await leagueResp.json();

        const rostersResp = await fetch(`${apiBase}league/${leagueID}/rosters`);
        const rostersJSON = await rostersResp.json();
        const usersResp = await fetch(`${apiBase}league/${leagueID}/users`);
        const usersJSON = await usersResp.json();

        const currentWeek = leagueJSON.settings.leg;
        const lastWeek = currentWeek - 1;

        const lastWeekMatchupsResp = await fetch(
          `${apiBase}league/${leagueID}/matchups/${lastWeek}`
        );
        const lastWeekMatchupsJSON = await lastWeekMatchupsResp.json();

        const currentMatchupsResp = await fetch(
          `${apiBase}league/${leagueID}/matchups/${currentWeek}`
        );
        const currentMatchupsJSON = await currentMatchupsResp.json();

        const combinedTransactions: any[] = [];
        for (let w = 1; w <= currentWeek; w++) {
          const transactionsResp = await fetch(
            `${apiBase}league/${leagueID}/transactions/${w}`
          );
          const transactionsJSON = await transactionsResp.json();
          combinedTransactions.push(...transactionsJSON);
        }

        let owners: Owner[] = rostersJSON.map((r: any) => {
          const user = usersJSON.find((u: any) => u.user_id === r.owner_id);
          const pointsFor = r.settings.fpts + "." + r.settings.fpts_decimal;
          const pointsPossible =
            r.settings.ppts + "." + r.settings.ppts_decimal;

          return {
            ...r,
            ownerID: r.owner_id,
            teamName: user?.metadata?.team_name || user?.display_name,
            userName: user?.display_name || "",
            avatar: user?.avatar || "",
            teamAvatar: user?.metadata?.avatar || "",
            wins: r.settings.wins,
            losses: r.settings.losses,
            ties: r.settings.ties,
            waiverOrder: r.waiver_position,
            pointsFor,
            pointsPossible,
            pointsPossiblePerc:
              parseFloat(pointsPossible) > 0
                ? (
                    (parseFloat(pointsFor) / parseFloat(pointsPossible)) *
                    100
                  ).toFixed(2)
                : "0",
            pointsAgainst:
              r.settings.fpts_against + "." + r.settings.fpts_against_decimal,
            streak: r.metadata?.streak || "",
            addDropCount: 0,
            TradeCount: 0,
            matchupID: "",
            matchupPoints: 0,
          };
        });
        console.log(
          rostersJSON.map((r: any) => ({
            roster_id: r.roster_id,
            waiver: r.waiver_position,
          }))
        );

        // Count transactions
        owners.forEach((owner) => {
          const txs = combinedTransactions.filter((tx) =>
            tx.roster_ids.includes(owner.roster_id)
          );
          txs.forEach((tx) => {
            if (tx.type === "free_agent") owner.addDropCount++;
            if (tx.type === "trade") owner.TradeCount++;
          });
        });

        // Merge matchups and avatars
        owners = owners.map((owner) => {
          const lastMatchup = lastWeekMatchupsJSON.find(
            (m: any) => m.roster_id === owner.roster_id
          ) || { points: 0 };

          const currentMatchup = currentMatchupsJSON.find(
            (m: any) => m.roster_id === owner.roster_id
          ) || { matchup_id: "" };

          return {
            ...owner,
            matchupID: currentMatchup.matchup_id,
            matchupPoints: lastMatchup.points || 0,
          };
        });

        const { data: blurbs } = await supabase.from("weekly_data").select("*");
        const teamExtras: Config["teamExtras"] = {};
        blurbs?.forEach((b: any) => {
          teamExtras[b.team_id] = {
            blurb: b.blurb,
            image: b.image,
            gif: b.gif,
          };
        });

        const previousChamps: Config["previousChamps"] = {
          "1": "2023 Champ",
          "2": "2022 Champ",
        };

        setLeagueData({
          ...leagueJSON,
          owners,
          currentWeek,
          size: owners.length,
        });
        setConfig({ teamExtras, previousChamps });
        setAppStatus("loaded");
      } catch (error) {
        console.error("Error fetching league data:", error);
        setAppStatus("failed");
      }
    }

    fetchLeagueData();
  }, []);

  if (appStatus === "loading") {
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading league data...</p>
      </div>
    );
  }

  if (appStatus === "failed") {
    return (
      <div className="full-screen">
        <p>League ID not working!</p>
      </div>
    );
  }

  return (
    <>
      <header>
        <div className="inner">
          <h1>{leagueData!.season} Power Rankings</h1>
          <h3>
            {leagueData!.name} - Week {leagueData!.currentWeek}
          </h3>
        </div>
      </header>

      <main>
        {/* <Standings leagueData={leagueData!} config={config} /> */}
      </main>
    </>
  );
}

export default SeasonRecap;
