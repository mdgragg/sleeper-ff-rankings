import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import { Sleeper } from "../features/league/api";
import { getJSON } from "../lib/fetcher";
import {
  gameKey,
  medianKey,
  remainingGames,
  scoringProfiles,
  simulateOdds,
  type TeamOdds,
} from "../lib/playoffOdds";
import {
  buildStandings,
  type PlayoffStatus,
  type ScheduleMatchup,
  type StandingRow,
  type StandingsData,
  type StandingsRoster,
} from "../lib/standings";
import logo from "/images/logo_with_text.png";

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;
const DEFAULT_PLAYOFF_TEAMS = 6;
const DEFAULT_PLAYOFF_START = 15;
const PICKER_WEEKS = 3; // how many upcoming weeks get what-if buttons

interface League {
  season?: string;
  settings?: {
    leg?: number;
    last_scored_leg?: number;
    league_average_match?: number;
    playoff_teams?: number;
    playoff_week_start?: number;
  };
}

interface LeagueUser {
  user_id: string;
  display_name?: string;
}

interface Loaded {
  data: StandingsData;
  schedule: ScheduleMatchup[][];
  weeksPlayed: number;
  resultsPerWeek: number;
}

const STATUS_LABEL: Record<PlayoffStatus, string> = {
  clinched: "Clinched",
  eliminated: "Eliminated",
  hunt: "In the hunt",
};

// Simulated odds at or above this, without a mathematical clinch, read "Near lock".
const NEAR_LOCK_PCT = 99.5;

const STATUS_CLASS: Record<PlayoffStatus, string> = {
  clinched: "draft-good",
  eliminated: "draft-bad",
  hunt: "draft-muted",
};

// Never show a simulated 0% or 100%: it's a probability, not a guarantee.
function fmtPct(p: number): string {
  if (p <= 0) return "0%";
  if (p < 0.5) return "<1%";
  if (p >= 100) return "100%";
  if (p >= 99.5) return ">99%";
  return `${Math.round(p)}%`;
}

function OddsCell({ odds, base }: { odds?: TeamOdds; base?: TeamOdds }) {
  if (!odds) return <>–</>;
  const delta = base ? Math.round(odds.makePct - base.makePct) : 0;
  return (
    <>
      {fmtPct(odds.makePct)}
      {delta !== 0 && (
        <span
          className={`standings-delta ${delta > 0 ? "draft-good" : "draft-bad"}`}
        >
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      )}
    </>
  );
}

export default function Standings() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState("");
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  // game key -> roster id of the team picked to win it
  const [picks, setPicks] = useState<Record<string, number>>({});
  // medianKey -> true for teams picked to beat the weekly median
  const [medianPicks, setMedianPicks] = useState<Record<string, true>>({});

  useEffect(() => {
    const run = async () => {
      try {
        const league = await getJSON<League>(Sleeper.league(LEAGUE_ID));
        setSeason(league.season ?? "");

        const playoffTeams =
          league.settings?.playoff_teams ?? DEFAULT_PLAYOFF_TEAMS;
        const regularSeasonWeeks =
          (league.settings?.playoff_week_start ?? DEFAULT_PLAYOFF_START) - 1;

        const weeksPlayed =
          league.settings?.last_scored_leg ?? league.settings?.leg ?? 0;
        const resultsPerWeek = league.settings?.league_average_match ? 2 : 1;

        const weekNumbers = Array.from(
          { length: regularSeasonWeeks },
          (_, i) => i + 1,
        );
        const [rosters, users, schedule] = await Promise.all([
          getJSON<StandingsRoster[]>(Sleeper.rosters(LEAGUE_ID)),
          getJSON<LeagueUser[]>(Sleeper.leagueUsers(LEAGUE_ID)),
          Promise.all(
            weekNumbers.map((w) =>
              getJSON<ScheduleMatchup[]>(Sleeper.matchups(LEAGUE_ID, w)),
            ),
          ),
        ]);

        const owners: Record<number, string> = {};
        for (const roster of rosters) {
          const user = users.find((u) => u.user_id === roster.owner_id);
          owners[roster.roster_id] = user?.display_name || "Unknown";
        }

        setLoaded({
          data: buildStandings(
            rosters,
            owners,
            schedule,
            playoffTeams,
            regularSeasonWeeks,
            weeksPlayed,
            resultsPerWeek,
          ),
          schedule,
          weeksPlayed,
          resultsPerWeek,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const games = useMemo(
    () =>
      loaded
        ? remainingGames(
            loaded.schedule,
            loaded.weeksPlayed,
            loaded.data.regularSeasonWeeks,
          )
        : [],
    [loaded],
  );

  // Odds with no picks, kept so the table can show how picks move them.
  const baseOdds = useMemo(
    () =>
      loaded
        ? simulateOdds({
            rows: loaded.data.rows,
            games,
            profiles: scoringProfiles(loaded.schedule, loaded.weeksPlayed),
            picks: {},
            medianPicks: {},
            resultsPerWeek: loaded.resultsPerWeek,
            playoffTeams: loaded.data.playoffTeams,
          })
        : null,
    [loaded, games],
  );

  const hasPicks =
    Object.keys(picks).length > 0 || Object.keys(medianPicks).length > 0;
  const odds = useMemo(
    () =>
      loaded && hasPicks
        ? simulateOdds({
            rows: loaded.data.rows,
            games,
            profiles: scoringProfiles(loaded.schedule, loaded.weeksPlayed),
            picks,
            medianPicks,
            resultsPerWeek: loaded.resultsPerWeek,
            playoffTeams: loaded.data.playoffTeams,
          })
        : baseOdds,
    [loaded, games, picks, medianPicks, hasPicks, baseOdds],
  );

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Checking the playoff picture...</p>
      </div>
    );

  const header = (
    <header>
      <Link to="/">
        <img alt="logo" className="sleeper-logo" src={logo} />
      </Link>
      <h1>Playoff Picture</h1>
      <h2>{season ? `${season} Season` : ""}</h2>
    </header>
  );

  if (error || !loaded || loaded.data.rows.length === 0) {
    return (
      <div className="body draft-page">
        <NavDrawer />
        {header}
        <p className="draft-muted">{error ?? "No standings found yet."}</p>
      </div>
    );
  }

  const { data } = loaded;
  const ownerOf = (rosterId: number) =>
    data.rows.find((r) => r.rosterId === rosterId)?.owner ?? "Unknown";

  // Based on the no-picks odds so the label doesn't flip while you play with picks.
  const nearLock = (r: StandingRow) =>
    r.status === "hunt" &&
    (baseOdds?.get(r.rosterId)?.makePct ?? 0) >= NEAR_LOCK_PCT;

  // Cut line under the last playoff spot, and everyone below it dimmed.
  const rowClass = (seed: number) =>
    seed === data.playoffTeams
      ? "standings-cutline"
      : seed > data.playoffTeams
        ? "standings-out"
        : "";

  const pickerWeeks = [...new Set(games.map((g) => g.week))].slice(
    0,
    PICKER_WEEKS,
  );

  // A week only has so many median wins to hand out (half the teams playing).
  const medianCap = (week: number) =>
    games.filter((g) => g.week === week).length;
  const medianPicksIn = (week: number) =>
    Object.keys(medianPicks).filter((k) => k.startsWith(`${week}:`)).length;

  const toggleMedian = (week: number, rosterId: number) =>
    setMedianPicks((prev) => {
      const key = medianKey(week, rosterId);
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });

  const togglePick = (key: string, rosterId: number) =>
    setPicks((prev) => {
      const next = { ...prev };
      if (next[key] === rosterId) delete next[key];
      else next[key] = rosterId;
      return next;
    });

  return (
    <div className="body draft-page">
      <NavDrawer />
      {header}

      <section className="panel">
        <h2>Standings</h2>
        <p className="panel-note">
          Top {data.playoffTeams} make the playoffs. Ranked by wins, then points
          for. Clinched and eliminated ignore tiebreakers and your picks, so a
          team that can only tie for the last spot stays in the hunt. Near lock
          means the team isn't mathematically in yet but makes it in over 99% of
          simulations. Odds come from simulating the rest of the season 10,000
          times.
        </p>
        <div className="draft-table-wrap">
          <table className="draft-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Manager</th>
                <th className="num">Record</th>
                <th className="num draft-hide-mobile">PF</th>
                <th className="num draft-hide-mobile">PA</th>
                <th className="num draft-hide-mobile">Left</th>
                <th className="num draft-hide-mobile">Left SOS</th>
                <th className="num">Odds</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.rosterId} className={rowClass(r.seed)}>
                  <td>{r.seed}</td>
                  <td>{r.owner}</td>
                  <td className="num">
                    {r.wins}-{r.losses}
                    {r.ties > 0 ? `-${r.ties}` : ""}
                  </td>
                  <td className="num draft-hide-mobile">
                    {r.pointsFor.toFixed(1)}
                  </td>
                  <td className="num draft-hide-mobile">
                    {r.pointsAgainst.toFixed(1)}
                  </td>
                  <td className="num draft-hide-mobile">{r.gamesLeft}</td>
                  <td className="num draft-hide-mobile">
                    {r.sosLeft == null ? "–" : r.sosLeft.toFixed(3)}
                  </td>
                  <td
                    className={`num ${r.seed <= data.playoffTeams ? "draft-good" : ""}`}
                  >
                    <OddsCell
                      odds={odds?.get(r.rosterId)}
                      base={hasPicks ? baseOdds?.get(r.rosterId) : undefined}
                    />
                  </td>
                  <td
                    className={
                      nearLock(r) ? "draft-good" : STATUS_CLASS[r.status]
                    }
                  >
                    {nearLock(r) ? "Near lock" : STATUS_LABEL[r.status]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {pickerWeeks.length > 0 && (
        <section className="panel">
          <h2>What-If Picker</h2>
          <p className="panel-note">
            Tap a team to add a win for that matchup.
            {loaded.resultsPerWeek === 2 &&
              " Use the Median button to give that team the median win."}{" "}
            Playoff teams are shown below depending on what you select. Anything
            you leave alone is still simulated.
          </p>
          <button
            className="standings-reset"
            disabled={!hasPicks}
            onClick={() => {
              setPicks({});
              setMedianPicks({});
            }}
          >
            Reset picks
          </button>
          {pickerWeeks.map((week) => (
            <div key={week} className="standings-week">
              <h3>Week {week}</h3>
              {games
                .filter((g) => g.week === week)
                .map((g) => {
                  const key = gameKey(g);
                  return (
                    <div key={key} className="standings-game">
                      {[g.a, g.b].map((id) => {
                        const picked = picks[key] === id;
                        // The other side of a picked game lost.
                        const lost = picks[key] != null && !picked;
                        const hasMedian = !!medianPicks[medianKey(week, id)];
                        const medianFull =
                          !hasMedian && medianPicksIn(week) >= medianCap(week);
                        return (
                          <div key={id} className="standings-side">
                            <button
                              className={`standings-pick ${picked ? "picked" : ""} ${lost ? "lost" : ""}`}
                              aria-pressed={picked}
                              onClick={() => togglePick(key, id)}
                            >
                              {ownerOf(id)}
                            </button>
                            {loaded.resultsPerWeek === 2 && (
                              <button
                                className={`standings-median ${hasMedian ? "picked" : ""}`}
                                aria-pressed={hasMedian}
                                title="Give this team the median win"
                                aria-label="Median win"
                                disabled={medianFull}
                                onClick={() => toggleMedian(week, id)}
                              >
                                <span className="standings-median-full">
                                  Median
                                </span>
                                <span className="standings-median-short">
                                  M
                                </span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          ))}
        </section>
      )}

      <section className="panel">
        <h2>Playoff Odds</h2>
        {/* <p className="panel-note">
          Chance of making the playoffs and of finishing as the top seed, from
          the same simulation as above. Teams in a playoff spot right now are in
          green, above the dashed line. Max wins is the best a team can finish
          if it wins every game, counting median wins (up to{" "}
          {loaded.resultsPerWeek} a week). Includes any picks above.
        </p> */}
        <div className="draft-table-wrap">
          <table className="draft-table">
            <thead>
              <tr>
                <th>Manager</th>
                <th className="num">Max wins</th>
                <th className="num">Playoffs</th>
                <th className="num">Top seed</th>
                <th className="draft-hide-mobile">Next up</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => {
                const teamOdds = odds?.get(r.rosterId);
                return (
                  <tr key={r.rosterId} className={rowClass(r.seed)}>
                    <td>{r.owner}</td>
                    <td className="num">{r.maxWins}</td>
                    <td
                      className={`num ${r.seed <= data.playoffTeams ? "draft-good" : ""}`}
                    >
                      {teamOdds ? fmtPct(teamOdds.makePct) : "–"}
                    </td>
                    <td className="num">
                      {teamOdds ? fmtPct(teamOdds.topSeedPct) : "–"}
                    </td>
                    <td className="draft-hide-mobile">
                      {r.nextOpponents.length ? (
                        r.nextOpponents.join(", ")
                      ) : (
                        <span className="draft-muted">Regular season done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
