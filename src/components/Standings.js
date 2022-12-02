import React from "react";

function Standings({ leagueData }) {
  const owners = leagueData.owners;
  const teams = leagueData.teams;
  const matchup = leagueData.matchup;
  const lastweek = leagueData.currentWeek - 1;
  const lastPos = leagueData.size - 1;
  const avatarUrlBase = "https://sleepercdn.com/avatars/thumbs/";

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

  return (
    <>
      <div id="awards">
        <h2>Season Awards</h2>

        <div className="awards">
          <div className="box weekly-winner">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#128176;
              </span>{" "}
              Highest Scorer{" "}
              <span className="username good"> @{highPF.userName}</span>
            </h3>

            {/* <img
                src={avatarUrlBase + highPF.avatar}
                alt=""
                className="award-avatar"
              />{" "} */}

            <div className="owner-block">
              <span className="stat">{highPF.pointsFor} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                &#128169;
              </span>
              Lowest Scorer{" "}
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

      {/* 
    0 -- michaelGragg
    1 -- bmullinger
    2 -- jonnychernek
    3 -- jcheech30
    4 -- jdasch1216
    5 -- bopaskar
    6 -- brianhavrilla
    7 -- TeddyBald
    8 -- kevmullinger
    9 -- AaronLam
   10 -- Teechen
   11 -- courtneyressa
     */}

      <div className="standings">
        {/* 1 */}
        <li
          className={`container-${owners[3].roster_id} container weekly-winner`}
          key={owners[3].ownerID}
        >
          <span className="ranking first">1</span>
          {/* start here */}
          {/* brianhavrilla */}
          <img
            src={teams[6].avatar || avatarUrlBase + owners[6].avatar}
            className="avatar weekly-winner-circle"
          />

          <div className="name-desc">
            <span className="clinched-playoffs">Clinched Playoffs</span>
            <span className="clinched-playoffs">Clinched Round 1 Bye</span>
            <h3>
              {owners[6].teamName} ({owners[6].wins}-{owners[6].losses}
              {owners[6].ties ? "-" + owners[6].ties : ""})
              <span className="wins"> {owners[6].streak}</span>
            </h3>
            <span className="owner-name">@{teams[6].username}</span>

            <p>Called out team in the chat and team responded mid-week.</p>
            <span className="winning-weeks">
              Highest Scorer: Week 1, Week 5, Week 6, Week 12
            </span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[6].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[6].points}
              </span>
              <span> Possible Points: {owners[6].pointsPossible}</span>
              <span> Points Against: {owners[6].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[6].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 2 */}
        <li
          className={`container-${owners[1].roster_id} container playoffs`}
          key={owners[1].ownerID}
        >
          <span className="ranking clinched">2</span>
          {/* start here */}
          {/* jcheech30 */}
          <img
            src={teams[3].avatar || avatarUrlBase + owners[3].avatar}
            className="avatar playoffs-circle"
          />
          <div className="name-desc">
            <span className="clinched-playoffs">Clinched Playoffs</span>

            <h3>
              {owners[3].teamName} ({owners[3].wins}-{owners[3].losses}
              {owners[3].ties ? "-" + owners[3].ties : ""}){" "}
              <span className="wins"> {owners[3].streak}</span>
            </h3>
            <span className="owner-name">@{teams[3].username}</span>

            <p>
              I lied about clinching a first-round bye last week. But only way
              it's not clinched is if you lose next two and Brien wins out while
              outscoring you by 150.
            </p>
            <span className="winning-weeks">
              Highest Scorer: Week 3, Week 4, Week 9
            </span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[3].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[3].points}
              </span>
              <span> Possible Points: {owners[3].pointsPossible}</span>
              <span> Points Against: {owners[3].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[3].waiverOrder}
              </span>
            </p>
          </div>

          {/* end here */}
        </li>
        {/* 3 */}
        <li
          className={`container-${owners[2].roster_id} container `}
          key={owners[2].ownerID}
        >
          {" "}
          <span className="ranking ">3</span>
          {/* start here */}
          {/* bmullinger */}
          <img
            src={teams[1].avatar || avatarUrlBase + owners[1].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[1].teamName} ({owners[1].wins}-{owners[1].losses}
              {owners[1].ties ? "-" + owners[1].ties : ""})
              <span className="losses"> {owners[1].streak}</span>
            </h3>
            <span className="owner-name">@{teams[1].username}</span>

            <p>So you're tell me there's a chance...</p>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[1].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[1].points}
              </span>
              <span> Possible Points: {owners[1].pointsPossible}</span>
              <span> Points Against: {owners[1].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[1].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 4 */}
        <li
          className={`container-${owners[0].roster_id} container  `}
          key={owners[0].ownerID}
        >
          {" "}
          <span className="ranking">4</span>
          {/* start here */}
          {/* TeddyBald */}
          <img
            src={teams[7].avatar || avatarUrlBase + owners[7].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[7].teamName} ({owners[7].wins}-{owners[7].losses}
              {owners[7].ties ? "-" + owners[7].ties : ""})
              <span className="wins"> {owners[7].streak}</span>
            </h3>
            <span className="owner-name">@{teams[7].username}</span>

            <p>Has yet to win or lose more than 2 games in a row.</p>
            <span className="winning-weeks">Highest Scorer: Week 11</span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[7].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[7].points}
              </span>
              <span> Possible Points: {owners[7].pointsPossible}</span>
              <span> Points Against: {owners[7].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[7].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 5 */}
        <li
          className={`container-${owners[4].roster_id} container `}
          key={owners[4].ownerID}
        >
          {" "}
          <span className="ranking">5</span>
          {/* start here */}
          {/* michaelGragg */}
          <img
            src={teams[0].avatar || avatarUrlBase + owners[0].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[0].teamName} ({owners[0].wins}-{owners[0].losses}
              {owners[0].ties ? "-" + owners[0].ties : ""})
              <span className="losses"> {owners[0].streak}</span>
            </h3>
            <span className="owner-name">@{teams[0].username}</span>

            <p>
              Did not think I would have to make a decison between Goff or
              Garoppolo in week 12.{" "}
            </p>
            <span className="winning-weeks">Highest Scorer: Week 10</span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[0].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[0].points}
              </span>
              <span> Possible Points: {owners[0].pointsPossible}</span>
              <span> Points Against: {owners[0].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[0].waiverOrder}
              </span>
              {/* <br></br>Roster Moves: {owners[0].moves} */}
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 6 */}
        <li
          className={`container-${owners[5].roster_id} container `}
          key={owners[5].ownerID}
        >
          {" "}
          <span className="ranking">6</span>
          {/* start here */}
          {/* jdasch1216 */}
          <img
            src={teams[4].avatar || avatarUrlBase + owners[4].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[4].teamName} ({owners[4].wins}-{owners[4].losses}
              {owners[4].ties ? "-" + owners[4].ties : ""})
              <span className="wins"> {owners[4].streak}</span>
            </h3>
            <span className="owner-name">@{teams[4].username}</span>

            <p>
              7 points away from the 5 seed but 1 loss or 100 points away for
              out of the playoffs.
            </p>

            <span className="winning-weeks">Highest Scorer: Week 7</span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[4].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[4].points}
              </span>
              <span> Possible Points: {owners[4].pointsPossible}</span>
              <span> Points Against: {owners[4].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[4].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 7 */}
        <li
          className={`container-${owners[6].roster_id} container `}
          key={owners[6].ownerID}
        >
          {" "}
          <span className="ranking ">7</span>
          {/* start here */}
          {/* jonnychernek */}
          <img
            src={teams[2].avatar || avatarUrlBase + owners[2].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[2].teamName} ({owners[2].wins}-{owners[2].losses}
              {owners[2].ties ? "-" + owners[2].ties : ""})
              <span className="wins"> {owners[2].streak}</span>
            </h3>
            <span className="owner-name">@{teams[2].username}</span>
            <p>Was a selling team just last week but keeps winning.</p>
            <span className="winning-weeks">Highest Scorer: Week 2</span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[2].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[2].points}
              </span>
              <span> Possible Points: {owners[2].pointsPossible}</span>
              <span> Points Against: {owners[2].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[2].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 8 */}

        <li
          className={`container-${owners[7].roster_id} container `}
          key={owners[7].ownerID}
        >
          {" "}
          <span className="ranking ">8</span>
          {/* start here */}
          {/* Teechen */}
          <img
            src={teams[10].avatar || avatarUrlBase + owners[10].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[10].teamName} ({owners[10].wins}-{owners[10].losses}
              {owners[10].ties ? "-" + owners[10].ties : ""})
              <span className="wins"> {owners[10].streak}</span>
            </h3>
            <span className="owner-name">@{teams[10].username}</span>

            <p>
              5-7 isnt great but points scored keeps you in the playoff
              conversation.
            </p>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[10].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[10].points}
              </span>
              <span> Possible Points: {owners[10].pointsPossible}</span>
              <span> Points Against: {owners[10].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[10].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 9 */}
        <li
          className={`container-${owners[8].roster_id} container `}
          key={owners[8].ownerID}
        >
          {" "}
          <span className="ranking">9</span>
          {/* start here */}
          {/* bopaskar */}
          <img
            src={teams[5].avatar || avatarUrlBase + owners[5].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[5].teamName} ({owners[5].wins}-{owners[5].losses}
              {owners[5].ties ? "-" + owners[5].ties : ""})
              <span className="losses"> {owners[5].streak}</span>
            </h3>
            <span className="owner-name">@{teams[5].username}</span>

            <p>
              Josh Jacobs trying to get to the playoffs or at least away from
              least points scored.
            </p>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[5].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[5].points}
              </span>
              <span> Possible Points: {owners[5].pointsPossible}</span>
              <span> Points Against: {owners[5].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[5].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 10 */}
        <li
          className={`container-${owners[9].roster_id} container `}
          key={owners[9].ownerID}
        >
          {" "}
          <span className="ranking">10</span>
          {/* start here */}
          {/* AaronLam */}
          <img
            src={teams[9].avatar || avatarUrlBase + owners[9].avatar}
            className="avatar "
          />
          <div className="name-desc">
            <h3>
              {owners[9].teamName} ({owners[9].wins}-{owners[9].losses}
              {owners[9].ties ? "-" + owners[9].ties : ""})
              <span className="losses"> {owners[9].streak}</span>
            </h3>
            <span className="owner-name">@{teams[9].username}</span>
            <p>
              Went from 1-5 to 4-5 to 4-8. The Cinderella Story might be over.
            </p>

            <span className="winning-weeks">Highest Scorer: Week 8</span>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[9].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[9].points}
              </span>
              <span> Possible Points: {owners[9].pointsPossible}</span>
              <span> Points Against: {owners[9].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[9].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 11 */}
        <li
          className={`container-${owners[10].roster_id} container last-place`}
          key={owners[10].ownerID}
        >
          {" "}
          <span className="ranking last">11</span>
          {/* start here */}
          {/* courtneyressa */}
          <img
            src={teams[11].avatar || avatarUrlBase + owners[11].avatar}
            className="avatar last-place-circle"
          />
          <div className="name-desc">
            <span className="eliminated">Eliminated from Playoffs</span>
            <h3>
              {owners[11].teamName} ({owners[11].wins}-{owners[11].losses}
              {owners[11].ties ? "-" + owners[11].ties : ""})
              <span className="losses"> {owners[11].streak}</span>
            </h3>
            <span className="owner-name">@{teams[11].username}</span>

            <p>
              Needs a new defensive coordinator as it's only the 3rd time
              someone has scored under 135 points against you.. It's week 12.{" "}
            </p>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[11].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[11].points}
              </span>
              <span> Possible Points: {owners[11].pointsPossible}</span>
              <span> Points Against: {owners[11].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[11].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
        {/* 12 */}
        <li
          className={`container-${owners[11].roster_id} container last-place`}
          key={owners[11].ownerID}
        >
          {" "}
          <span className="ranking last">12</span>
          {/* start here */}
          {/* kevmullinger */}
          <img
            src={teams[8].avatar || avatarUrlBase + owners[8].avatar}
            className="avatar last-place-circle"
          />
          <div className="name-desc">
            <span className="eliminated">Eliminated from Playoffs</span>
            <h3>
              {owners[8].teamName} ({owners[8].wins}-{owners[8].losses}
              {owners[8].ties ? "-" + owners[8].ties : ""})
              <span className="losses"> {owners[8].streak}</span>
            </h3>
            <span className="owner-name">@{teams[8].username}</span>

            <p>
              Still holding off Opaskar for least points scored (9 point
              difference though).
            </p>
          </div>
          <div className="stats">
            <h4>Team Stats</h4>
            <p>
              <span>Total points: {owners[8].pointsFor}</span>
              <span>
                {" "}
                Week {lastweek} Points: {matchup[8].points}
              </span>
              <span> Possible Points: {owners[8].pointsPossible}</span>
              <span> Points Against: {owners[8].pointsAgainst}</span>
              <span className="priority">
                {" "}
                Waiver Priority: {owners[8].waiverOrder}
              </span>
            </p>
          </div>
          {/* end here */}
        </li>
      </div>
    </>
  );
}

export default Standings;
