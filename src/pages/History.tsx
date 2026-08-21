import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import { LEAGUE_HISTORY, type SeasonLeague } from "../data/leagueHistory";
import { MANUAL_HISTORY, TOILET_BOWL_OVERRIDES } from "../data/manualHistory";
import logo from "/images/logo_with_text.png";

const CURRENT_LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;
const AVATAR_BASE = "https://sleepercdn.com/avatars/thumbs/";

interface BracketMatch {
  r: number; // round
  m: number; // match id
  t1?: number | null; // roster_id
  t2?: number | null;
  w?: number | null; // winner roster_id
  l?: number | null; // loser roster_id
  p?: number | null; // placement this match determines (winner gets p, loser gets p+1)
}

interface WeekScore {
  season: string;
  week: number;
  roster_id: number;
  managerName: string;
  managerAvatar: string;
  points: number;
}

interface ManagerAgg {
  owner_id: string;
  name: string;
  avatar: string;
  regularWins: number;
  regularLosses: number;
  regularTies: number;
  playoffWins: number;
  playoffLosses: number;
  championships: string[];
  runnerUps: string[];
  thirds: string[];
  toiletBowls: string[];
  playoffSeasons: string[]; // sorted seasons this manager made playoffs
}

function getPlacements(bracket: BracketMatch[]): Record<number, number> {
  const placements: Record<number, number> = {};
  bracket.forEach((m) => {
    if (m.p) {
      if (m.w != null) placements[m.w] = m.p;
      if (m.l != null) placements[m.l] = m.p + 1;
    }
  });
  return placements;
}

// Longest run of consecutive seasons (by season string sorted ascending)
function longestStreak(seasons: string[]): number {
  const sorted = [...new Set(seasons)].map(Number).sort((a, b) => a - b);
  let longest = 0;
  let current = 0;
  let prev: number | null = null;
  sorted.forEach((s) => {
    if (prev !== null && s === prev + 1) {
      current += 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prev = s;
  });
  return longest;
}

export default function History() {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<ManagerAgg[]>([]);
  const [highScores, setHighScores] = useState<WeekScore[]>([]);
  const [lowScores, setLowScores] = useState<WeekScore[]>([]);
  const [longestPlayoffStreak, setLongestPlayoffStreak] = useState<
    { name: string; avatar: string; streak: number }[]
  >([]);
  const [leagueName, setLeagueName] = useState("");

  // Still populated below, but the Lowest Scores and Longest Playoff
  // Streak sections are commented out in the markup.
  void lowScores;
  void longestPlayoffStreak;

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const seasons: SeasonLeague[] = [
        ...LEAGUE_HISTORY,
        { season: "current", league_id: CURRENT_LEAGUE_ID },
      ];

      const aggByOwner: Record<string, ManagerAgg> = {};
      const allWeekScores: WeekScore[] = [];
      const toiletBowlBySeason: Record<string, string> = {}; // season -> owner_id

      for (const { season, league_id } of seasons) {
        if (!league_id) continue;

        try {
          const [leagueRes, rostersRes, usersRes, winnersRes, losersRes] =
            await Promise.all([
              fetch(`https://api.sleeper.app/v1/league/${league_id}`).then(
                (r) => r.json(),
              ),
              fetch(
                `https://api.sleeper.app/v1/league/${league_id}/rosters`,
              ).then((r) => r.json()),
              fetch(
                `https://api.sleeper.app/v1/league/${league_id}/users`,
              ).then((r) => r.json()),
              fetch(
                `https://api.sleeper.app/v1/league/${league_id}/winners_bracket`,
              ).then((r) => r.json()),
              fetch(
                `https://api.sleeper.app/v1/league/${league_id}/losers_bracket`,
              ).then((r) => r.json()),
            ]);

          const seasonLabel = leagueRes?.season ?? season;
          if (league_id === CURRENT_LEAGUE_ID && leagueRes?.name) {
            setLeagueName(leagueRes.name);
          }

          const rosterToOwner: Record<number, string> = {};
          const ownerToName: Record<string, string> = {};

          rostersRes.forEach((roster: any) => {
            const user = usersRes.find(
              (u: any) => u.user_id === roster.owner_id,
            );
            const name = user?.display_name || "Unknown";
            const avatar =
              user?.metadata?.avatar ||
              (user?.avatar ? AVATAR_BASE + user.avatar : "");

            rosterToOwner[roster.roster_id] = roster.owner_id;
            ownerToName[roster.owner_id] = name;

            if (!aggByOwner[roster.owner_id]) {
              aggByOwner[roster.owner_id] = {
                owner_id: roster.owner_id,
                name,
                avatar,
                regularWins: 0,
                regularLosses: 0,
                regularTies: 0,
                playoffWins: 0,
                playoffLosses: 0,
                championships: [],
                runnerUps: [],
                thirds: [],
                toiletBowls: [],
                playoffSeasons: [],
              };
            } else {
              // Keep the most recent display name / avatar
              aggByOwner[roster.owner_id].name = name;
              if (avatar) aggByOwner[roster.owner_id].avatar = avatar;
            }

            const agg = aggByOwner[roster.owner_id];
            agg.regularWins += roster.settings?.wins ?? 0;
            agg.regularLosses += roster.settings?.losses ?? 0;
            agg.regularTies += roster.settings?.ties ?? 0;
          });

          // Playoff W/L from both brackets - every match with two real
          // teams is one win + one loss.
          const allPlayoffMatches: BracketMatch[] = [
            ...(Array.isArray(winnersRes) ? winnersRes : []),
            ...(Array.isArray(losersRes) ? losersRes : []),
          ];

          allPlayoffMatches.forEach((m) => {
            if (m.w != null) {
              const ownerId = rosterToOwner[m.w];
              if (ownerId) aggByOwner[ownerId].playoffWins += 1;
            }
            if (m.l != null) {
              const ownerId = rosterToOwner[m.l];
              if (ownerId) aggByOwner[ownerId].playoffLosses += 1;
            }
          });

          // Made playoffs = appears anywhere in winners_bracket
          const playoffRosterIds = new Set<number>();
          (Array.isArray(winnersRes) ? winnersRes : []).forEach((m: any) => {
            if (m.t1 != null) playoffRosterIds.add(m.t1);
            if (m.t2 != null) playoffRosterIds.add(m.t2);
          });
          playoffRosterIds.forEach((rid) => {
            const ownerId = rosterToOwner[rid];
            if (ownerId) aggByOwner[ownerId].playoffSeasons.push(seasonLabel);
          });

          // Placements from winners bracket: 1 = champ, 2 = runner-up,
          // 3 = third place (if a 3rd place game exists, p:3 on that match)
          const winnerPlacements = getPlacements(
            Array.isArray(winnersRes) ? winnersRes : [],
          );
          Object.entries(winnerPlacements).forEach(([rosterIdStr, place]) => {
            const rosterId = Number(rosterIdStr);
            const ownerId = rosterToOwner[rosterId];
            if (!ownerId) return;
            if (place === 1)
              aggByOwner[ownerId].championships.push(seasonLabel);
            if (place === 2) aggByOwner[ownerId].runnerUps.push(seasonLabel);
            if (place === 3) aggByOwner[ownerId].thirds.push(seasonLabel);
          });

          // Toilet bowl: worst placement number in the losers bracket.
          // Recorded per season so TOILET_BOWL_OVERRIDES can correct it
          // once every season has been read.
          const loserPlacements = getPlacements(
            Array.isArray(losersRes) ? losersRes : [],
          );
          const placementEntries = Object.entries(loserPlacements);
          if (placementEntries.length > 0) {
            const [worstRosterIdStr] = placementEntries.reduce((worst, cur) =>
              cur[1] > worst[1] ? cur : worst,
            );
            const ownerId = rosterToOwner[Number(worstRosterIdStr)];
            if (ownerId) toiletBowlBySeason[seasonLabel] = ownerId;
          }

          // Weekly scores - loop until we hit a week with no data
          for (let week = 1; week <= 18; week++) {
            const matchupsRes = await fetch(
              `https://api.sleeper.app/v1/league/${league_id}/matchups/${week}`,
            ).then((r) => r.json());

            if (!Array.isArray(matchupsRes) || matchupsRes.length === 0) {
              break;
            }

            matchupsRes.forEach((m: any) => {
              if (typeof m.points !== "number") return;
              const ownerId = rosterToOwner[m.roster_id];
              allWeekScores.push({
                season: seasonLabel,
                week,
                roster_id: m.roster_id,
                managerName: ownerId ? ownerToName[ownerId] : "Unknown",
                managerAvatar: ownerId
                  ? (aggByOwner[ownerId]?.avatar ?? "")
                  : "",
                points: m.points,
              });
            });
          }
        } catch (err) {
          console.error(`Failed to load season ${season} (${league_id}):`, err);
        }
      }

      // ------------------
      // Fold in the hand-entered pre-Sleeper results
      // ------------------
      MANUAL_HISTORY.forEach((entry) => {
        let agg = aggByOwner[entry.owner_id];

        if (!agg) {
          // Manager who never played on Sleeper — give them their own row
          agg = aggByOwner[entry.owner_id] = {
            owner_id: entry.owner_id,
            name: entry.name || "Unknown",
            avatar: "",
            regularWins: 0,
            regularLosses: 0,
            regularTies: 0,
            playoffWins: 0,
            playoffLosses: 0,
            championships: [],
            runnerUps: [],
            thirds: [],
            toiletBowls: [],
            playoffSeasons: [],
          };
        }

        agg.championships.push(...(entry.championships ?? []));
        agg.runnerUps.push(...(entry.runnerUps ?? []));
        agg.thirds.push(...(entry.thirds ?? []));
        agg.toiletBowls.push(...(entry.toiletBowls ?? []));
        agg.playoffSeasons.push(...(entry.playoffSeasons ?? []));
      });

      // ------------------
      // Toilet bowl: apply hand-entered corrections, then record them.
      // Runs last so an override can name someone who only exists in
      // MANUAL_HISTORY.
      // ------------------
      Object.entries(TOILET_BOWL_OVERRIDES).forEach(([season, ownerId]) => {
        if (ownerId) {
          toiletBowlBySeason[season] = ownerId;
        } else {
          delete toiletBowlBySeason[season]; // no toilet bowl that season
        }
      });

      Object.entries(toiletBowlBySeason).forEach(([season, ownerId]) => {
        aggByOwner[ownerId]?.toiletBowls.push(season);
      });

      const managerList = Object.values(aggByOwner);

      // Manual seasons get appended after the Sleeper ones, so re-sort
      managerList.forEach((m) => {
        m.championships.sort();
        m.runnerUps.sort();
        m.thirds.sort();
        m.toiletBowls.sort();
      });

      // Longest playoff streak per manager
      const streaks = managerList
        .map((m) => ({
          name: m.name,
          avatar: m.avatar,
          streak: longestStreak(m.playoffSeasons),
        }))
        .sort((a, b) => b.streak - a.streak);

      const sortedHigh = [...allWeekScores]
        .sort((a, b) => b.points - a.points)
        .slice(0, 10);
      const sortedLow = [...allWeekScores]
        .filter((s) => s.points > 0) // filter out obvious no-shows/byes at 0
        .sort((a, b) => a.points - b.points)
        .slice(0, 10);

      setManagers(
        managerList.sort(
          (a, b) =>
            b.championships.length - a.championships.length ||
            b.regularWins - a.regularWins,
        ),
      );
      setHighScores(sortedHigh);
      setLowScores(sortedLow);
      setLongestPlayoffStreak(streaks);
      setLoading(false);
    };

    run();
  }, []);

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading league history...</p>
      </div>
    );

  return (
    <div className="body history-page">
      <NavDrawer />
      <header>
        <Link to="/">
          <img alt="logo" className="sleeper-logo" src={logo} />
        </Link>
        <h1>History / Record Book</h1>
        <h2>{leagueName || "All-Time League Records"}</h2>
      </header>

      <section className="panel blue-panel">
        <span className="emoji">📊</span>
        <h2>All-Time Win/Loss Records</h2>
        <p className="panel-note">Sleeper seasons only (2022-present)</p>
        <ul className="record-list">
          {managers
            .filter((m) => m.regularWins + m.regularLosses + m.regularTies > 0)
            .sort((a, b) => b.regularWins - a.regularWins)
            .map((m) => (
              <li key={m.owner_id} className="record-row">
                {m.avatar && (
                  <img className="score-avatar" src={m.avatar} alt="" />
                )}
                <span className="record-name">{m.name}</span>
                <span className="record-stats">
                  <span className="record-chip">
                    <span className="chip-label">Regular</span>
                    {m.regularWins}-{m.regularLosses}
                    {m.regularTies ? `-${m.regularTies}` : ""}
                  </span>
                  <span className="record-chip">
                    <span className="chip-label">Playoffs</span>
                    {m.playoffWins}-{m.playoffLosses}
                  </span>
                </span>
              </li>
            ))}
        </ul>
      </section>

      <section className="panel good-panel">
        <span className="emoji">📈</span>
        <h2>Highest Single-Week Scores</h2>
        <ol className="score-list">
          {highScores.map((s, i) => (
            <li key={i}>
              {s.managerAvatar && (
                <img className="score-avatar" src={s.managerAvatar} alt="" />
              )}
              <span className="score-name">{s.managerName}</span>
              <span className="score-meta">
                {s.season} · Week {s.week}
              </span>
              <span className="score-value">{s.points.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* <section className="panel bad-panel">
        <span className="emoji">💩</span>
        <h2>Lowest Single-Week Scores</h2>
        <ol className="score-list bad-list">
          {lowScores.map((s, i) => (
            <li key={i}>
              {s.managerAvatar && (
                <img className="score-avatar" src={s.managerAvatar} alt="" />
              )}
              <span className="score-name">{s.managerName}</span>
              <span className="score-meta">
                {s.season} · Week {s.week}
              </span>
              <span className="score-value">{s.points.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </section> */}

      <section className="panel champ-panel">
        <span className="emoji">🏆</span>
        <h2>Hall of Fame</h2>
        <ul className="record-list">
          {managers
            .filter(
              (m) =>
                m.championships.length || m.runnerUps.length || m.thirds.length,
            )
            .map((m) => (
              <li key={m.owner_id} className="record-row">
                {m.avatar && (
                  <img className="score-avatar" src={m.avatar} alt="" />
                )}
                <span className="record-name">{m.name}</span>
                <span className="record-stats">
                  {[
                    { icon: "🥇", label: "Champ", seasons: m.championships },
                    { icon: "🥈", label: "Runner-up", seasons: m.runnerUps },
                    { icon: "🥉", label: "3rd", seasons: m.thirds },
                  ]
                    .filter((place) => place.seasons.length)
                    .map((place) => (
                      <span key={place.label} className="record-chip">
                        <span className="chip-icon">{place.icon}</span>
                        <strong>{place.seasons.length}</strong>
                        <span className="chip-years">
                          {place.seasons.join(", ")}
                        </span>
                      </span>
                    ))}
                </span>
              </li>
            ))}
        </ul>
      </section>

      <section className="panel bad-panel">
        <span className="emoji">💩</span>
        <h2>Hall of Shame - Toilet Bowl Losers</h2>
        <ul className="record-list">
          {managers
            .filter((m) => m.toiletBowls.length)
            .sort((a, b) => b.toiletBowls.length - a.toiletBowls.length)
            .map((m) => (
              <li key={m.owner_id} className="record-row">
                {m.avatar && (
                  <img className="score-avatar" src={m.avatar} alt="" />
                )}
                <span className="record-name">{m.name}</span>
                <span className="record-stats">
                  <span className="record-chip">
                    <span className="chip-icon">🚽</span>
                    <strong className="bad">{m.toiletBowls.length}</strong>
                    <span className="chip-years">
                      {m.toiletBowls.join(", ")}
                    </span>
                  </span>
                </span>
              </li>
            ))}
        </ul>
      </section>

      {/* <section className="panel">
        <span className="emoji">📈</span>
        <h2>Longest Playoff Streak</h2>
        <ol className="score-list">
          {longestPlayoffStreak
            .filter((s) => s.streak > 0)
            .map((s, i) => (
              <li key={i}>
                {s.avatar && (
                  <img className="score-avatar" src={s.avatar} alt="" />
                )}
                <span className="score-name">{s.name}</span>
                <span className="score-value">
                  {s.streak} season{s.streak !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
        </ol>
      </section> */}
    </div>
  );
}
