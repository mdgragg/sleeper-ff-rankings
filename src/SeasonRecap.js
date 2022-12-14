import React, { useState } from "react";
import Standings from "./components/Standings";
import PointsFor from "./components/PointsFor";
import PointsPossible from "./components/PointsPossible";
import PointsPossiblePerc from "./components/PointsPossiblePerc";
import PointsAgainst from "./components/PointsAgainst";
import TeamAvgScore from "./components/TeamAvgScore";
import FAABUsed from "./components/FAABUsed";
import logo from "./assets/images/logo_with_text.png";

function SeasonRecap(props) {
  const [leagueID, setLeagueID] = useState("");
  const [leagueData, setLeagueData] = useState("");
  const [appStatus, setAppStatus] = useState("loading");

  const ownerColors = [
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
  ];

  async function getLeagueData(e) {
    if (e) {
      e.preventDefault();
    }

    const apiBase = "https://api.sleeper.app/v1/";

    // get league data -- 1
    let leagueDataResp = await fetch(
      apiBase + "league/" + "859880880154480640"
    );
    const leagueDataJSON = await leagueDataResp.json();

    if (leagueDataJSON) {
      console.log(leagueDataJSON);

      let standings = [];

      // get rosters data -- 2
      let leagueRostersResp = await fetch(
        apiBase + "league/" + "859880880154480640" + "/rosters"
      );
      const leagueRostersJSON = await leagueRostersResp.json();
      console.log("league rosters");
      console.log(leagueRostersJSON);

      // get users data -- 3
      let leagueUsersResp = await fetch(
        apiBase + "league/" + "859880880154480640" + "/users"
      );
      const leagueUsersJSON = await leagueUsersResp.json();
      console.log("league users");
      console.log(leagueUsersJSON);

      // get matchup data -- 4
      const lastweek = leagueData.currentWeek - 1;

      let leagueMatchupsResp = await fetch(
        apiBase + "league/" + "859880880154480640" + "/matchups/14"
      );
      const leagueMatchupsJSON = await leagueMatchupsResp.json();
      console.log("league matchups");
      console.log(leagueMatchupsJSON);

      // pull out data we want from rosters -- 2
      let ownersData = [];
      leagueRostersJSON.map((owner, idx) =>
        ownersData.push({
          color: ownerColors[idx],
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
        })
      );

      // get additional user data that isn't provided in rosters endpoint
      for (var i = 0; i < ownersData.length; i++) {
        const userID = ownersData[i].ownerID;

        // search for corresponding owner
        const newOwnerData = leagueUsersJSON.filter((obj) => {
          return obj.user_id === userID;
        });

        const standingsData = standings.filter((obj) => {
          return obj.rosterID === ownersData[i].rosterID;
        });

        const userName = newOwnerData[0].display_name;
        const teamName = newOwnerData[0].metadata.team_name || userName;

        ownersData[i].avatar = newOwnerData[0].avatar;
        ownersData[i].userName = userName;
        ownersData[i].teamName = teamName;
        // ownersData[i].place = standingsData[0].position;
      }

      // pull out data we want from users -- 3
      let teamData = [];
      leagueUsersJSON.map((team) =>
        teamData.push({
          avatar: team.metadata.avatar,
          username: team.display_name,
        })
      );

      // pull out data we want from matchups -- 4
      let matchupData = [];
      leagueMatchupsJSON.map((matchup) =>
        matchupData.push({
          points: matchup.points,
          topScorer: matchup.starters_points[0],
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
        teams: teamData,
        matchup: matchupData,
      });

      setAppStatus("loaded");
    } else {
      setAppStatus("failed");
    }
  }

  if ("859880880154480640" && !leagueID) {
    setLeagueID("859880880154480640");
    getLeagueData(null, "859880880154480640");
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
              {leagueData ? (
                <>
                  <img className="sleeper-logo" src={logo} />
                  <h1>{leagueData.season} Power Rankings</h1>
                  <h3>
                    {" "}
                    {leagueData.name} - Week {leagueData.currentWeek}
                  </h3>
                  <p></p>
                </>
              ) : (
                ""
              )}
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
                {/* <PointsFor owners={leagueData.owners} />
                <PointsPossible owners={leagueData.owners} />
                <PointsPossiblePerc owners={leagueData.owners} />
                <PointsAgainst owners={leagueData.owners} />
                <TeamAvgScore leagueData={leagueData} /> */}
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
