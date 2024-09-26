import React, { useEffect } from "react";
import $ from "jquery";
import config from "../config";

function Standings({ leagueData }) {
  const owners = leagueData.owners;
  const lastweek = leagueData.currentWeek - 1;
  const current = leagueData.currentWeek;
  const lastPos = leagueData.size - 1;
  const avatarUrlBase = "https://sleepercdn.com/avatars/thumbs/";

  // const customSorting = {
  //   michaelGragg: 9,
  //   bmullinger: 0,
  //   jonnychernek: 5,
  //   jcheech30: 6,
  //   jdasch1216: 10,
  //   bopaskar: 11,
  //   brianhavrilla: 4,
  //   TeddyBald: 8,
  //   kevmullinger: 3,
  //   AaronLam: 2,
  //   Teechen: 1,
  //   courtneychernek: 7,
  // };

  const ownersSorted = owners.slice(0).sort(function (a, b) {
    return (
      // customSorting[a.userName] - customSorting[b.userName] ||
      b.wins - a.wins || b.pointsFor - a.pointsFor
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

  const matchups = {};

  ownersSorted.forEach((owner) => {
    const matchupID = owner.matchupID;
    if (!matchups[matchupID]) {
      matchups[matchupID] = [];
    }
    matchups[matchupID].push(owner);
  });

  // const appendElements = (ids, tagName, values) => {
  //   ids.forEach((id, idx) => {
  //     const element = document.createElement(tagName);
  //     element.src = values[idx] || "";
  //     document.getElementById(id).appendChild(element);
  //     if (!element.src) element.style.display = "none";
  //   });
  // };

  useEffect(() => {
    const apiKey = config.apiKey;
    const sheetId = config.sheetId;
    const range = "Week " + current + "!B2:E13";

    async function fetchData() {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Fetched data:", data);
        console.log("Data values:", data.values);

        if (!data) return;
        const rosterIdToIndex = {
          10: 0,
          7: 1,
          2: 2,
          6: 3,
          12: 4,
          11: 5,
          3: 6,
          5: 7,
          4: 8,
          9: 9,
          1: 10,
          8: 11,
        };

        Object.entries(rosterIdToIndex).forEach(([rosterId, index]) => {
          console.log("Index:", index, "Value:", data.values[index]);
          console.log("Number of rows in data.values:", data.values.length);
          console.log("Roster ID to Index Mapping:", rosterIdToIndex);

          document.getElementById(`teamBlurb-${rosterId}`).innerText =
            data.values[index][0] || ""; // <-- use data.values here
          document.getElementById(`winningWeeks-${rosterId}`).innerText =
            data.values[index][1] || ""; // <-- use data.values here
        });

        Object.entries(rosterIdToIndex).forEach(([rosterId, index]) => {
          const imageId = `teamImage-${rosterId}`;
          const gifId = `teamGif-${rosterId}`;

          // Set the image
          const imageElement = document.getElementById(imageId);
          if (imageElement) {
            imageElement.src = data.values[index][2] || "";
            if (!imageElement.src) {
              imageElement.style.display = "none";
            }
          }

          // Set the gif (iframe)
          const iframeElement = document.getElementById(gifId);
          if (iframeElement) {
            iframeElement.src = data.values[index][3] || "";
            if (!iframeElement.src) {
              iframeElement.style.display = "none";
            }
          }
        });

        document.querySelectorAll("iframe").forEach((iframe) => {
          if (iframe.getAttribute("src") === "") {
            iframe.style.display = "none";
          }
        });

        document.querySelectorAll("img").forEach((img) => {
          if (img.getAttribute("src") === "") {
            img.style.display = "none";
          }
        });

        $("#previousChamp-3").html("2015, 2016, 2020 Champ");
        $("#previousChamp-2").html("2017, 2023 Champ");
        $("#previousChamp-10").html("2018 Champ");
        $("#previousChamp-9").html("2019 Champ");
        $("#previousChamp-4").html("2021 Champ");
        $("#previousChamp-11").html("2022 Champ");
        $("#previousChamp-2").addClass("current-champ");

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
          $(".weekly-winner")
            .children(".avatar")
            .addClass("weekly-winner-circle");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [current, owners]);

  return (
    <>
      <div className="avatar-buttons">
        {ownersSorted.map((owner, idx) => (
          <a key={owner.ownerID} href={`#${owner.userName}`}>
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
                <img
                  id={`teamImage-${owner.roster_id}`}
                  // alt="optional img"
                  src=""
                />
                <iframe
                  id={`teamGif-${owner.roster_id}`}
                  src=""
                  title="optional gif"
                ></iframe>
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
