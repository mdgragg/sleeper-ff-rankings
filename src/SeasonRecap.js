import React, { useState } from "react";
import Standings from "./components/Standings";
import logo from "./assets/images/logo_with_text.png";

// 2022
// const league_ID = "859880880154480640";

// 2023
const league_ID = "957497971501780992";

function SeasonRecap() {
  const [leagueID, setLeagueID] = useState("");
  const [leagueData, setLeagueData] = useState("");
  const [appStatus, setAppStatus] = useState("loading");

  async function getLeagueData(e) {
    if (e) {
      e.preventDefault();
    }

    const apiBase = "https://api.sleeper.app/v1/";

    let NFLweek = await fetch(apiBase + "state/nfl");

    const NFLDataJSON = await NFLweek.json();
    console.log(NFLDataJSON);

    // get league data
    let leagueDataResp = await fetch(apiBase + "league/" + league_ID);
    const leagueDataJSON = await leagueDataResp.json();

    if (leagueDataJSON) {
      console.log(leagueDataJSON);

      const lastWeek = leagueDataJSON.settings.leg - 1;
      const currentWeek = leagueDataJSON.settings.leg;

      // get rosters data
      let leagueRostersResp = await fetch(
        apiBase + "league/" + league_ID + "/rosters"
      );
      const leagueRostersJSON = await leagueRostersResp.json();
      console.log("league rosters");
      console.log(leagueRostersJSON);

      // get users data
      let leagueUsersResp = await fetch(
        apiBase + "league/" + league_ID + "/users"
      );
      const leagueUsersJSON = await leagueUsersResp.json();
      console.log("league users");
      console.log(leagueUsersJSON);

      // Fetch transactions data for each week and combine them
      const combinedTransactions = [];

      for (let week = 1; week <= currentWeek; week++) {
        const transactionsResp = await fetch(
          apiBase + "league/" + league_ID + "/transactions/" + week
        );
        const transactionsJSON = await transactionsResp.json();
        combinedTransactions.push(...transactionsJSON);
        console.log("league transactions");
        console.log(transactionsJSON);
      }

      // get draft data
      // let leagueDraftResp = await fetch(apiBase + "draft/859880880934612992");
      // const leagueDraftJSON = await leagueDraftResp.json();
      // console.log("league draft");
      // console.log(leagueDraftJSON);

      // get matchup data

      // console.log(leagueDataJSON.settings.leg);

      let lastWeekMatchupsResp = await fetch(
        apiBase + "league/" + league_ID + "/matchups/" + lastWeek
      );

      let currentMatchupsResp = await fetch(
        apiBase + "league/" + league_ID + "/matchups/" + currentWeek
      );

      const lastWeekMatchupsJSON = await lastWeekMatchupsResp.json();
      console.log("last week matchups");
      console.log(lastWeekMatchupsJSON);

      const currentMatchupsJSON = await currentMatchupsResp.json();
      console.log("current matchups");
      console.log(currentMatchupsJSON);

      // pull out data we want from rosters -- 2
      let ownersData = [];
      leagueRostersJSON.forEach((owner, idx) => {
        ownersData.push({
          ownerID: owner.owner_id,
          streak: owner.metadata.streak,
          wins: owner.settings.wins,
          losses: owner.settings.losses,
          ties: owner.settings.ties,
          roster_id: owner.roster_id,
          moves: owner.settings.total_moves,
          waiverOrder: owner.settings.waiver_position,
          pointsFor: owner.settings.fpts + "." + owner.settings.fpts_decimal,
          pointsAgainst:
            owner.settings.fpts_against +
            "." +
            owner.settings.fpts_against_decimal,
          pointsPossible:
            owner.settings.ppts + "." + owner.settings.ppts_decimal,
          pointsPossiblePerc: (
            (parseInt(owner.settings.fpts + "." + owner.settings.fpts_decimal) /
              parseInt(
                owner.settings.ppts + "." + owner.settings.ppts_decimal
              )) *
            100
          ).toFixed(2),
        });

        const transactionData = combinedTransactions.filter((transaction) => {
          return transaction.roster_ids.includes(ownersData[idx].roster_id);
        });
        let addDropCount = 0;
        let TradeCount = 0;
        transactionData.forEach((transaction) => {
          if (transaction.type === "free_agent") {
            addDropCount++;
          } else if (transaction.type === "trade") {
            TradeCount++;
          }
        });
        ownersData[idx].addDropCount = addDropCount;
        ownersData[idx].TradeCount = TradeCount;
      });

      // get additional user data that isn't provided in rosters endpoint
      for (var i = 0; i < ownersData.length; i++) {
        const userID = ownersData[i].ownerID;

        // search for corresponding owner
        const newOwnerData = leagueUsersJSON.filter((obj) => {
          return obj.user_id === userID;
        });

        const standingsData = lastWeekMatchupsJSON.filter((obj) => {
          return obj.roster_id === ownersData[i].roster_id;
        });

        // eslint-disable-next-line
        const CurrentMatchupData = currentMatchupsJSON.filter((obj) => {
          return obj.roster_id === ownersData[i].roster_id;
        });

        const userName = newOwnerData[0].display_name;
        const teamAvatar = newOwnerData[0].metadata.avatar;
        const matchupPoints = standingsData[0].points;
        const matchupID = CurrentMatchupData[0].matchup_id;
        const teamName = newOwnerData[0].metadata.team_name || userName;

        ownersData[i].avatar = newOwnerData[0].avatar;
        ownersData[i].teamAvatar = teamAvatar;
        ownersData[i].userName = userName;
        ownersData[i].teamName = teamName;
        ownersData[i].matchupPoints = matchupPoints;
        ownersData[i].matchupID = matchupID;
      }

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
    } else {
      setAppStatus("failed");
    }
  }

  if (league_ID && !leagueID) {
    setLeagueID(league_ID);
    getLeagueData(null, league_ID);
  }

  return (
    <>
      {appStatus === "loading" ? (
        <div id="loading" className="full-screen">
          <div className="inner">
            <div className="loader"></div>
          </div>
        </div>
      ) : (
        ""
      )}

      {appStatus === "failed" ? (
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
      ) : (
        ""
      )}

      <header>
        <div className="inner">
          <div className="top">
            <div className="site-title">
              <img alt="logo" className="sleeper-logo" src={logo} />
              <h1>{leagueData.season} Power Rankings</h1>
              <h3>
                {" "}
                {leagueData.name} - Week {leagueData.currentWeek}
              </h3>
              <p></p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="row">
          <div className="inner">
            {leagueData ? (
              <>
                <Standings leagueData={leagueData} />
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default SeasonRecap;
