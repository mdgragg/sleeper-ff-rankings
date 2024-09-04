import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Standings from "./components/Standings";
import logo from "./assets/images/logo_with_text.png";

// 2022
// const league_ID = "859880880154480640";

// 2023
// const league_ID = "957497971501780992";

// 2024
const league_ID = "1062844227291373568";

function SeasonRecap() {
  const { id } = useParams();
  const [leagueID, setLeagueID] = useState(league_ID);
  const [leagueData, setLeagueData] = useState(null);
  const [appStatus, setAppStatus] = useState("loading");

  useEffect(() => {
    if (id) {
      setLeagueID(id);
    }

    async function getLeagueData() {
      try {
        const apiBase = "https://api.sleeper.app/v1/";

        // Fetch NFL week data
        const NFLweekResponse = await fetch(apiBase + "state/nfl");
        const NFLDataJSON = await NFLweekResponse.json();
        console.log("NFL Data:", NFLDataJSON);

        // Fetch league data
        const leagueDataResp = await fetch(apiBase + "league/" + leagueID);
        const leagueDataJSON = await leagueDataResp.json();
        // console.log("league Data:", leagueDataJSON);

        if (!leagueDataJSON) throw new Error("League data not found");

        const lastWeek = leagueDataJSON.settings.leg - 1;
        const currentWeek = leagueDataJSON.settings.leg;

        // Fetch rosters data
        const leagueRostersResp = await fetch(
          apiBase + "league/" + leagueID + "/rosters"
        );
        const leagueRostersJSON = await leagueRostersResp.json();
        // console.log("league rosters:", leagueRostersJSON);

        // Fetch users data
        const leagueUsersResp = await fetch(
          apiBase + "league/" + leagueID + "/users"
        );
        const leagueUsersJSON = await leagueUsersResp.json();
        // console.log("league users:", leagueUsersJSON);

        // Fetch transactions data for each week and combine them
        const combinedTransactions = [];
        for (let week = 1; week <= currentWeek; week++) {
          const transactionsResp = await fetch(
            apiBase + "league/" + leagueID + "/transactions/" + week
          );
          const transactionsJSON = await transactionsResp.json();
          combinedTransactions.push(...transactionsJSON);
          // console.log("league transactions:", transactionsJSON);
        }

        // Fetch matchups data
        const lastWeekMatchupsResp = await fetch(
          apiBase + "league/" + leagueID + "/matchups/" + lastWeek
        );

        const currentMatchupsResp = await fetch(
          apiBase + "league/" + leagueID + "/matchups/" + currentWeek
        );
        const lastWeekMatchupsJSON = await lastWeekMatchupsResp.json();
        // console.log("last week matchups:", lastWeekMatchupsJSON);

        const currentMatchupsJSON = await currentMatchupsResp.json();
        // console.log("current matchups:", currentMatchupsJSON);

        // Process rosters data
        let ownersData = leagueRostersJSON.map((owner) => {
          const pointsFor = `${owner.settings.fpts}.${owner.settings.fpts_decimal}`;
          const pointsPossible = `${owner.settings.ppts}.${owner.settings.ppts_decimal}`;
          const pointsPossiblePerc = (
            (parseInt(pointsFor) / parseInt(pointsPossible)) *
            100
          ).toFixed(2);

          return {
            ownerID: owner.owner_id,
            // streak: owner.metadata.streak,
            wins: owner.settings.wins,
            losses: owner.settings.losses,
            ties: owner.settings.ties,
            roster_id: owner.roster_id,
            moves: owner.settings.total_moves,
            waiverOrder: owner.settings.waiver_position,
            pointsFor,
            pointsAgainst: `${owner.settings.fpts_against}.${owner.settings.fpts_against_decimal}`,
            pointsPossible,
            pointsPossiblePerc,
            addDropCount: 0,
            TradeCount: 0,
          };
        });

        // Calculate transaction counts for each owner
        ownersData.forEach((owner, idx) => {
          const transactionData = combinedTransactions.filter((transaction) =>
            transaction.roster_ids.includes(owner.roster_id)
          );
          transactionData.forEach((transaction) => {
            if (transaction.type === "free_agent") owner.addDropCount++;
            if (transaction.type === "trade") owner.TradeCount++;
          });
        });

        // Add additional user data
        ownersData = await Promise.all(
          ownersData.map(async (owner) => {
            const userID = owner.ownerID;
            const user =
              leagueUsersJSON.find((user) => user.user_id === userID) || {};
            const standingsData =
              lastWeekMatchupsJSON.find(
                (matchup) => matchup.roster_id === owner.roster_id
              ) || {};
            const currentMatchupData =
              currentMatchupsJSON.find(
                (matchup) => matchup.roster_id === owner.roster_id
              ) || {};

            return {
              ...owner,
              avatar: user.avatar,
              teamAvatar: user.metadata?.avatar || "",
              userName: user.display_name || "",
              teamName: user.metadata?.team_name || user.display_name || "",
              matchupPoints: standingsData.points || 0,
              matchupID: currentMatchupData.matchup_id || "",
            };
          })
        );

        setLeagueData({
          name: leagueDataJSON.name,
          season: leagueDataJSON.season,
          avatar: leagueDataJSON.avatar,
          size: leagueDataJSON.total_rosters,
          currentWeek: leagueDataJSON.settings.leg,
          waiverType: leagueDataJSON.settings.waiver_type,
          waiverBudget: leagueDataJSON.settings.waiver_budget,
          owners: ownersData,
        });

        setAppStatus("loaded");
      } catch (error) {
        console.error("Error fetching league data:", error);
        setAppStatus("failed");
      }
    }

    getLeagueData();
  }, [id, leagueID]);

  return (
    <>
      {appStatus === "loading" && (
        <div id="loading" className="full-screen">
          <div className="inner">
            <div className="loader"></div>
          </div>
        </div>
      )}

      {appStatus === "failed" && (
        <div id="failed" className="full-screen">
          <div className="inner">
            <span role="img" aria-label="" className="emoji">
              &#129300;
            </span>
            <p>League ID not working!</p>
            <p>
              Your league ID: <span className="highlight">{leagueID}</span>
            </p>
          </div>
        </div>
      )}

      {appStatus === "loaded" && leagueData && (
        <>
          <header>
            <div className="inner">
              <div className="top">
                <div className="site-title">
                  <img alt="logo" className="sleeper-logo" src={logo} />
                  <h1>{leagueData.season} Power Rankings</h1>
                  <h3>
                    {leagueData.name} - Week {leagueData.currentWeek}
                  </h3>
                </div>
              </div>
            </div>
          </header>

          <main>
            <div className="row">
              <div className="inner">
                <Standings leagueData={leagueData} />
              </div>
            </div>
          </main>
        </>
      )}
    </>
  );
}

export default SeasonRecap;
