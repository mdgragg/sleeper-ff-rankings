import React, { useEffect } from "react";
import $ from "jquery";
import config from "../config";

function Standings({ leagueData }) {
  const owners = leagueData.owners;
  const lastweek = leagueData.currentWeek - 1;
  const current = leagueData.currentWeek;
  const lastPos = leagueData.size - 1;
  const avatarUrlBase = "https://sleepercdn.com/avatars/thumbs/";

  const customSorting = {
    michaelGragg: 0,
    bmullinger: 0,
    jonnychernek: 0,
    jcheech30: 0,
    jdasch1216: 0,
    bopaskar: 0,
    brianhavrilla: 0,
    TeddyBald: 0,
    kevmullinger: 0,
    AaronLam: 0,
    Teechen: 0,
    courtneychernek: 0,
  };

  const ownersSorted = owners.slice(0).sort(function (a, b) {
    return (
      customSorting[a.userName] - customSorting[b.userName] ||
      b.wins - a.wins ||
      b.pointsFor - a.pointsFor
    );
  });

  const ownersSortedPF = owners.slice(0).sort(function (a, b) {
    return a.pointsFor - b.pointsFor;
  });
  const ownersSortedPA = owners.slice(0).sort(function (a, b) {
    return a.pointsAgainst - b.pointsAgainst;
  });
  const ownersSortedPPP = owners.slice(0).sort(function (a, b) {
    return a.pointsPossiblePerc - b.pointsPossiblePerc;
  });
  const highPF = ownersSortedPF[lastPos];
  const lowPF = ownersSortedPF[0];
  const highPA = ownersSortedPA[lastPos];
  const lowPA = ownersSortedPA[0];
  const highPPP = ownersSortedPPP[lastPos];
  const lowPPP = ownersSortedPPP[0];

  const winORloss = document.querySelectorAll(".streak");
  for (var i = 0; i < winORloss.length; i++) {
    var winORlossText = winORloss[i].textContent.trim();
    if (winORlossText.endsWith("W")) {
      winORloss[i].classList.add("wins");
    }
    if (winORlossText.endsWith("L")) {
      winORloss[i].classList.add("losses");
    }
  }

  let containers = document.querySelectorAll(".container");
  let maxPoints = -Infinity;
  let containerWithMaxPoints = null;
  containers.forEach((container) => {
    let pointsElement = container.querySelector(".matchup-points");
    let points = parseInt(pointsElement.textContent);
    if (points > maxPoints) {
      maxPoints = points;
      containerWithMaxPoints = container;
    }
  });
  if (containerWithMaxPoints) {
    containerWithMaxPoints.classList.add("weekly-winner");
    $(".weekly-winner").children(".ranking").addClass("first");
    $(".weekly-winner").children(".avatar").addClass("weekly-winner-circle");
  }

  const matchups = {};

  // Group teams by matchupID
  ownersSorted.forEach((owner) => {
    const matchupID = owner.matchupID;
    if (!matchups[matchupID]) {
      matchups[matchupID] = [];
    }
    matchups[matchupID].push(owner);
  });

  useEffect(() => {
    const apiKey = config.apiKey;
    const sheetId = config.sheetId;
    const range = "Week " + current + "!B2:C13";

    async function fetchData() {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        //   0 -- michaelGragg
        //   1 -- bmullinger
        //   2 -- jonnychernek
        //   3 -- jcheech30
        //   4 -- jdasch1216
        //   5 -- bopaskar
        //   6 -- brianhavrilla
        //   7 -- TeddyBald
        //   8 -- kevmullinger
        //   9 -- AaronLam
        //  10 -- Teechen
        //  11 -- courtneyressa

        // For Gif weeks
        // var iframe1 = document.createElement("iframe");
        // iframe1.src = data.values[10][0] || "";
        // var iframe2 = document.createElement("iframe");
        // iframe2.src = data.values[2][0] || "";
        // var iframe3 = document.createElement("iframe");
        // iframe3.src = data.values[6][0] || "";
        // var iframe4 = document.createElement("iframe");
        // iframe4.src = data.values[8][0] || "";
        // var iframe5 = document.createElement("iframe");
        // iframe5.src = data.values[7][0] || "";
        // var iframe6 = document.createElement("iframe");
        // iframe6.src = data.values[3][0] || "";
        // var iframe7 = document.createElement("iframe");
        // iframe7.src = data.values[1][0] || "";
        // var iframe8 = document.createElement("iframe");
        // iframe8.src = data.values[11][0] || "";
        // var iframe9 = document.createElement("iframe");
        // iframe9.src = data.values[9][0] || "";
        // var iframe10 = document.createElement("iframe");
        // iframe10.src = data.values[0][0] || "";
        // var iframe11 = document.createElement("iframe");
        // iframe11.src = data.values[5][0] || "";
        // var iframe12 = document.createElement("iframe");
        // iframe12.src = data.values[4][0] || "";

        // document.getElementById("teamBlurb-1").appendChild(iframe1);
        // document.getElementById("teamBlurb-2").appendChild(iframe2);
        // document.getElementById("teamBlurb-3").appendChild(iframe3);
        // document.getElementById("teamBlurb-4").appendChild(iframe4);
        // document.getElementById("teamBlurb-5").appendChild(iframe5);
        // document.getElementById("teamBlurb-6").appendChild(iframe6);
        // document.getElementById("teamBlurb-7").appendChild(iframe7);
        // document.getElementById("teamBlurb-8").appendChild(iframe8);
        // document.getElementById("teamBlurb-9").appendChild(iframe9);
        // document.getElementById("teamBlurb-10").appendChild(iframe10);
        // document.getElementById("teamBlurb-11").appendChild(iframe11);
        // document.getElementById("teamBlurb-12").appendChild(iframe12);

        // document.getElementById("winningWeeks-10").innerText =
        //   data.values[0][1] || "";
        // document.getElementById("winningWeeks-7").innerText =
        //   data.values[1][1] || "";
        // document.getElementById("winningWeeks-2").innerText =
        //   data.values[2][1] || "";
        // document.getElementById("winningWeeks-6").innerText =
        //   data.values[3][1] || "";
        // document.getElementById("winningWeeks-12").innerText =
        //   data.values[4][1] || "";
        // document.getElementById("winningWeeks-11").innerText =
        //   data.values[5][1] || "";
        // document.getElementById("winningWeeks-3").innerText =
        //   data.values[6][1] || "";
        // document.getElementById("winningWeeks-5").innerText =
        //   data.values[7][1] || "";
        // document.getElementById("winningWeeks-4").innerText =
        //   data.values[8][1] || "";
        // document.getElementById("winningWeeks-9").innerText =
        //   data.values[9][1] || "";
        // document.getElementById("winningWeeks-1").innerText =
        //   data.values[10][1] || "";
        // document.getElementById("winningWeeks-8").innerText =
        //   data.values[11][1] || "";

        document.getElementById("teamBlurb-10").innerText =
          data.values[0][0] || "";
        document.getElementById("winningWeeks-10").innerText =
          data.values[0][1] || "";
        document.getElementById("teamBlurb-7").innerText =
          data.values[1][0] || "";
        document.getElementById("winningWeeks-7").innerText =
          data.values[1][1] || "";
        document.getElementById("teamBlurb-2").innerText =
          data.values[2][0] || "";
        document.getElementById("winningWeeks-2").innerText =
          data.values[2][1] || "";
        document.getElementById("teamBlurb-6").innerText =
          data.values[3][0] || "";
        document.getElementById("winningWeeks-6").innerText =
          data.values[3][1] || "";
        document.getElementById("teamBlurb-12").innerText =
          data.values[4][0] || "";
        document.getElementById("winningWeeks-12").innerText =
          data.values[4][1] || "";
        document.getElementById("teamBlurb-11").innerText =
          data.values[5][0] || "";
        document.getElementById("winningWeeks-11").innerText =
          data.values[5][1] || "";
        document.getElementById("teamBlurb-3").innerText =
          data.values[6][0] || "";
        document.getElementById("winningWeeks-3").innerText =
          data.values[6][1] || "";
        document.getElementById("teamBlurb-5").innerText =
          data.values[7][0] || "";
        document.getElementById("winningWeeks-5").innerText =
          data.values[7][1] || "";
        document.getElementById("teamBlurb-4").innerText =
          data.values[8][0] || "";
        document.getElementById("winningWeeks-4").innerText =
          data.values[8][1] || "";
        document.getElementById("teamBlurb-9").innerText =
          data.values[9][0] || "";
        document.getElementById("winningWeeks-9").innerText =
          data.values[9][1] || "";
        document.getElementById("teamBlurb-1").innerText =
          data.values[10][0] || "";
        document.getElementById("winningWeeks-1").innerText =
          data.values[10][1] || "";
        document.getElementById("teamBlurb-8").innerText =
          data.values[11][0] || "";
        document.getElementById("winningWeeks-8").innerText =
          data.values[11][1] || "";
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();

    $("#previousChamp-3").html("2015, 2016, 2020 Champ");
    $("#previousChamp-2").html("2017 Champ");
    $("#previousChamp-10").html("2018 Champ");
    $("#previousChamp-9").html("2019 Champ");
    $("#previousChamp-4").html("2021 Champ");
    $("#previousChamp-11").html("2022 Champ");
    $("#previousChamp-11").addClass("current-champ");
  }, []);

  return (
    <>
      <div className="avatar-buttons">
        {ownersSorted.map((owner, idx) => (
          <a href={`#${owner.userName}`}>
            <img
              alt="team avatar"
              src={owner.teamAvatar || avatarUrlBase + owner.avatar}
              className="avatar-link"
            />
          </a>
        ))}
      </div>

      <div id="awards">
        <h2>Season Awards</h2>
        <div className="awards">
          <div className="box weekly-winner">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#128176;
              </span>{" "}
              Most Points{" "}
              <span className="username good"> @{highPF.userName}</span>
            </h3>

            <div className="owner-block">
              <span className="stat">{highPF.pointsFor} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#128169;
              </span>
              Least Points{" "}
              <span className="username bad">@{lowPF.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{lowPF.pointsFor} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#127808;
              </span>
              Best Luck <span className="username good">@{lowPA.userName}</span>
            </h3>
            <div className="desc">(least points against)</div>

            <div className="owner-block">
              <span className="stat">{lowPA.pointsAgainst} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#129324;
              </span>
              Worst Luck{" "}
              <span className="username bad">@{highPA.userName}</span>
            </h3>
            <div className="desc">(most points against)</div>
            <div className="owner-block">
              <span className="stat">{highPA.pointsAgainst} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#128293;
              </span>
              Best Manager{" "}
              <span className="username good"> @{highPPP.userName}</span>
            </h3>
            <div className="desc">
              (highest percentage of possible points scored)
            </div>
            <div className="owner-block">
              <span className="stat">{highPPP.pointsPossiblePerc}%</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#129300;
              </span>
              Worst Manager
              <span className="username bad"> @{lowPPP.userName}</span>
            </h3>
            <div className="desc">
              (lowest percentage of possible points scored)
            </div>
            <div className="owner-block">
              <span className="stat">{lowPPP.pointsPossiblePerc}%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="standings">
        {ownersSorted.map((owner, idx) => (
          <>
            <li
              data-place={idx + 1}
              id={owner.userName}
              key={owner.ownerID}
              className={`container-${idx}  container`}
            >
              <span className="ranking"> {idx + 1}</span>
              <img
                alt="team avatar"
                src={owner.teamAvatar || avatarUrlBase + owner.avatar}
                className="avatar"
              />
              <div className="name-desc">
                <h3>
                  {owner.teamName} ({owner.wins}&#8209;{owner.losses}
                  {owner.ties ? "-" + owner.ties : ""})
                  <span className="streak"> {owner.streak} </span>
                </h3>
                <span className="owner-name">@{owner.userName}</span>
                <p
                  id={`teamBlurb-${owner.roster_id}`}
                  className="team-blurb"
                ></p>
                <span
                  id={`winningWeeks-${owner.roster_id}`}
                  className="winning-weeks"
                ></span>{" "}
              </div>
              <div className="matchup">
                {" "}
                {matchups[owner.matchupID]
                  .filter((opponent) => opponent !== owner)
                  .map((opponent, oppIdx) => (
                    <span key={oppIdx}>
                      Week {current} Opponent:{" "}
                      <span className="team-name">{opponent.teamName} </span> (
                      {opponent.userName})
                      <span className="priority">
                        {" "}
                        Waiver Priority: {owner.waiverOrder}{" "}
                      </span>
                    </span>
                  ))}
              </div>
              <div className="stats">
                <h4>Team Stats</h4>
                <p className="stats-points">
                  <span>
                    Week {lastweek} Points:{" "}
                    <span className="matchup-points">
                      {" "}
                      {owner.matchupPoints}
                    </span>
                  </span>

                  <span>Total points: {owner.pointsFor}</span>

                  <span> Possible Points: {owner.pointsPossible}</span>
                  <span> Points Against: {owner.pointsAgainst}</span>
                </p>
                <p className="stats-other">
                  <span>Adds/Drops: {owner.addDropCount}</span>
                  <span>Trades: {owner.TradeCount}</span>
                  <span
                    className={`stat-matchup-${owner.roster_id}  stat-matchup`}
                  >
                    {matchups[owner.matchupID]
                      .filter((opponent) => opponent !== owner)
                      .map((opponent, oppIdx) => (
                        <span key={oppIdx}>
                          Week {current} Opponent:{" "}
                          <span className="team-name">{opponent.teamName}</span>{" "}
                          <span className="priority">
                            {" "}
                            Waiver Priority: {owner.waiverOrder}{" "}
                          </span>
                        </span>
                      ))}
                  </span>
                  <span
                    id={`previousChamp-${owner.roster_id}`}
                    className="previous-champ"
                  ></span>
                </p>
              </div>
            </li>
          </>
        ))}
      </div>
    </>
  );
}

export default Standings;
