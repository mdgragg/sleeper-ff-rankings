import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Standings from "../components/Standings";
import type { OwnerWithRanks } from "../types";
import logo from "/images/logo_with_text.png";

interface Config {
  teamExtras: Record<number, { blurb?: string; image?: string; gif?: string }>;
}

const LEAGUE_ID = "1247579709596782592";

const previousChampsByOwner: Record<string, string> = {
  "779230727840645120": "🏆 2024 Champ",
  "859887658577567744": "2017, 2023 Champ",
  "862404399966818304": "2022 Champ",
  "859903842383425536": "2021 Champ",
  "859887925402386432": "2015, 2016, 2020 Champ",
  "860701742805970944": "2019 Champ",
  "861681281560334336": "2018 Champ",
};
const currentChampRosterId = 1;

export default function Week() {
  const { week } = useParams<{ week: string }>();
  const [owners, setOwners] = useState<OwnerWithRanks[]>([]);
  const [weeklyExtras, setWeeklyExtras] = useState<Config["teamExtras"]>({});
  const [loading, setLoading] = useState(true);
  const [matchups, setMatchups] = useState<Record<string, OwnerWithRanks[]>>(
    {}
  );
  const [nextMatchups, setNextMatchups] = useState<
    Record<string, OwnerWithRanks[]>
  >({});
  const [leagueData, setLeagueData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data for week:", week);

      const [
        leagueRes,
        rostersRes,
        usersRes,
        matchupsRes,
        nextMatchupsRes,
        txRes,
        playersRes,
      ] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}`).then((r) =>
          r.json()
        ),
        fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`).then(
          (r) => r.json()
        ),
        fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`).then(
          (r) => r.json()
        ),
        fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${week}`
        ).then((r) => r.json()),
        fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${Number(week) + 1}`
        ).then((r) => r.json()),
        fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/transactions/${week}`
        ).then((r) => r.json()),
        fetch(`https://api.sleeper.app/v1/players/nfl`).then((r) => r.json()),
      ]);

      setLeagueData(leagueRes);

      const avatarUrlBase = "https://sleepercdn.com/avatars/thumbs/";

      // Build owners
      const ownersData: OwnerWithRanks[] = rostersRes.map((roster: any) => {
        const user = usersRes.find((u: any) => u.user_id === roster.owner_id);

        const pointsFor = parseFloat(
          `${roster.settings.fpts}.${roster.settings.fpts_decimal ?? 0}`
        );
        const pointsAgainst = parseFloat(
          `${roster.settings.fpts_against}.${roster.settings.fpts_against_decimal ?? 0}`
        );
        const pointsPossible = parseFloat(
          `${roster.settings.ppts}.${roster.settings.ppts_decimal ?? 0}`
        );
        const pointsPossiblePerc =
          pointsPossible > 0 ? (pointsFor / pointsPossible) * 100 : 0;

        return {
          ownerID: roster.owner_id,
          roster_id: roster.roster_id,
          userName: user?.display_name || "Unknown",
          teamName: user?.metadata?.team_name || user?.display_name || "",
          wins: roster.settings?.wins ?? 0,
          losses: roster.settings?.losses ?? 0,
          ties: roster.settings?.ties ?? 0,
          streak: roster.metadata?.streak || "",
          matchupPoints: 0,
          waiverOrder: roster.settings?.waiver_position ?? 0,
          pointsFor,
          pointsAgainst,
          pointsPossible,
          pointsPossiblePerc,
          addDropCount: 0,
          TradeCount: 0,
          teamAvatar: user?.metadata?.avatar || avatarUrlBase + user?.avatar,
          topScorerWeek: "",
          topScorerWeekPoints: 0,
          topScorerSeason: "",
          topScorerSeasonPoints: 0,
        };
      });

      // Count adds/drops and trades
      txRes.forEach((tx: any) => {
        tx.roster_ids.forEach((rid: number) => {
          const owner = ownersData.find((o) => o.roster_id === rid);
          if (!owner) return;
          if (tx.type === "free_agent") owner.addDropCount++;
          if (tx.type === "trade") owner.TradeCount++;
        });
      });

      // Assign matchup IDs
      const matchupsMap: Record<string, OwnerWithRanks[]> = {};
      matchupsRes.forEach((m: any) => {
        const owner = ownersData.find((o) => o.roster_id === m.roster_id);
        if (owner) {
          const matchupID = m.matchup_id?.toString() || "";
          owner.matchupID = matchupID;
          owner.matchupPoints = m.points ?? 0;
          if (!matchupsMap[matchupID]) matchupsMap[matchupID] = [];
          matchupsMap[matchupID].push(owner);
        }
      });

      const nextMatchupsMap: Record<string, OwnerWithRanks[]> = {};
      nextMatchupsRes.forEach((m: any) => {
        const owner = ownersData.find((o) => o.roster_id === m.roster_id);
        if (owner) {
          const matchupID = m.matchup_id?.toString() || "";
          owner.nextMatchupID = matchupID;
          if (!nextMatchupsMap[matchupID]) nextMatchupsMap[matchupID] = [];
          nextMatchupsMap[matchupID].push(owner);
        }
      });

      // --------------------
      // Top Scorer This Week
      // --------------------
      ownersData.forEach((owner) => {
        const matchup = matchupsRes.find(
          (m: any) => m.roster_id === owner.roster_id
        );
        if (!matchup?.players_points) return;

        let topWeek = { player_id: "", points: 0 };
        Object.entries(matchup.players_points).forEach(([pid, pts]) => {
          const points = Number(pts ?? 0);
          if (points > topWeek.points) {
            topWeek = { player_id: pid, points };
          }
        });

        owner.topScorerWeek =
          playersRes[topWeek.player_id]?.full_name || topWeek.player_id;
        owner.topScorerWeekPoints = topWeek.points;
      });

      // --------------------
      // Top Scorer Season
      // --------------------
      const totalWeeks = Number(week);
      const seasonPlayerPoints: Record<number, Record<string, number>> = {}; // { roster_id: { player_id: totalPoints } }

      for (let w = 1; w <= totalWeeks; w++) {
        const matchupsWeekRes = await fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/matchups/${w}`
        );
        const matchupsWeek: any[] = await matchupsWeekRes.json();

        matchupsWeek.forEach((matchup) => {
          const rosterId = matchup.roster_id;
          if (!seasonPlayerPoints[rosterId]) {
            seasonPlayerPoints[rosterId] = {};
          }
          if (matchup.players_points) {
            Object.entries(matchup.players_points).forEach(([pid, pts]) => {
              const points = Number(pts ?? 0);
              if (!seasonPlayerPoints[rosterId][pid]) {
                seasonPlayerPoints[rosterId][pid] = 0;
              }
              seasonPlayerPoints[rosterId][pid] += points;
            });
          }
        });
      }

      ownersData.forEach((owner) => {
        const seasonPlayers = seasonPlayerPoints[owner.roster_id];
        if (!seasonPlayers) return;

        let topSeason = { player_id: "", points: 0 };
        Object.entries(seasonPlayers).forEach(([pid, pts]) => {
          const points = Number(pts ?? 0);
          if (points > topSeason.points) {
            topSeason = { player_id: pid, points };
          }
        });

        owner.topScorerSeason =
          playersRes[topSeason.player_id]?.full_name || topSeason.player_id;
        owner.topScorerSeasonPoints = topSeason.points;
      });

      // --------------------
      // Fetch weekly extras
      // --------------------
      const { data, error } = await supabase
        .from("weekly_data")
        .select("*")
        .eq("week", Number(week));

      if (!error && data) {
        const extras: Config["teamExtras"] = {};
        data.forEach((row: any) => {
          extras[row.team_id] = {
            blurb: row.blurb,
            image: row.gifs?.[0] || "",
            gif: row.gifs?.[1] || "",
          };
        });
        setWeeklyExtras(extras);
      }

      setOwners(ownersData);
      setMatchups(matchupsMap);
      setNextMatchups(nextMatchupsMap);
      setLoading(false);
    };

    fetchData();
  }, [week]);

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading league data...</p>
      </div>
    );

  return (
    <>
      <div className="body">
        {leagueData && (
          <>
            <header>
              <img alt="logo" className="sleeper-logo" src={logo} />
              <h1>{leagueData.season} Power Rankings</h1>
              <h2>
                {leagueData.name} - Week {week}
              </h2>
            </header>
          </>
        )}
        <Standings
          owners={owners}
          weeklyExtras={weeklyExtras}
          currentWeek={Number(week)}
          previousChampsByOwner={previousChampsByOwner}
          currentChampRosterId={currentChampRosterId}
          matchups={matchups}
          nextMatchups={nextMatchups}
        />
      </div>
    </>
  );
}
