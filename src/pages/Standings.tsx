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
  type ScheduleMatchup,
  type PlayoffStatus,
  type StandingRow,
  type StandingsData,
  type StandingsRoster,
} from "../lib/standings";
import logo from "/images/logo_with_text.png";

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;
const DEFAULT_PLAYOFF_TEAMS = 6;
const DEFAULT_PLAYOFF_START = 15;
const AVATAR_BASE = "https://sleepercdn.com/avatars/thumbs/";
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
  avatar?: string;
  metadata?: { avatar?: string; team_name?: string };
}

interface Loaded {
  data: StandingsData;
  schedule: ScheduleMatchup[][];
  weeksPlayed: number;
  resultsPerWeek: number;
  teams: Record<number, { avatar: string; teamName: string }>;
}

// Simulated odds at or above this, without a mathematical clinch, read "Near lock".
const NEAR_LOCK_PCT = 90.5;
// Teams outside the playoff line with odds under this "need a miracle".
const MIRACLE_PCT = 3;

// Odds come from the simulation, which already uses points for as the tiebreaker.
function statusFor(
  status: PlayoffStatus,
  rank: number,
  playoffTeams: number,
  makePct: number,
): { label: string; className: string } {
  // The simulation never lets these teams in / out, so call it.
  if (status === "hunt" && makePct >= 100) status = "clinched";
  if (status === "hunt" && makePct <= 0) status = "eliminated";
  if (status === "clinched")
    return { label: "Clinched", className: "draft-good" };
  if (status === "eliminated")
    return { label: "Eliminated", className: "draft-bad" };
  const inPosition = rank <= playoffTeams;
  if (inPosition) {
    return makePct >= NEAR_LOCK_PCT
      ? { label: "Near lock", className: "draft-good" }
      : { label: "In playoffs", className: "draft" };
  }
  return makePct < MIRACLE_PCT
    ? { label: "Needs a miracle", className: "draft-bad" }
    : { label: "In the hunt", className: "draft-muted" };
}

// Never show a simulated 0% or 100%: it's a probability, not a guarantee.
function fmtPct(p: number): string {
  if (p <= 0) return "0%";
  if (p < 0.5) return "<1%";
  if (p >= 100) return "100%";
  if (p >= 99.5) return ">99%";
  return `${Math.round(p)}%`;
}

function ordinal(n: number): string {
  const v = n % 100;
  const suffix =
    ["th", "st", "nd", "rd"][(v - 20) % 10] ??
    ["th", "st", "nd", "rd"][v] ??
    "th";
  return `${n}${suffix}`;
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
  // Team whose full stats are open in the modal
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
        const teams: Loaded["teams"] = {};
        for (const roster of rosters) {
          const user = users.find((u) => u.user_id === roster.owner_id);
          owners[roster.roster_id] = user?.display_name || "Unknown";
          teams[roster.roster_id] = {
            avatar:
              user?.metadata?.avatar ||
              (user?.avatar ? AVATAR_BASE + user.avatar : ""),
            teamName: user?.metadata?.team_name || user?.display_name || "",
          };
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
          teams,
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
  const selectedRow = data.rows.find((r) => r.rosterId === selectedId);
  const selectedTeam = selectedRow
    ? loaded.teams[selectedRow.rosterId]
    : undefined;
  const selectedOdds = selectedRow
    ? odds?.get(selectedRow.rosterId)
    : undefined;
  const ownerOf = (rosterId: number) =>
    data.rows.find((r) => r.rosterId === rosterId)?.owner ?? "Unknown";

  // Picks move teams: order by current wins plus the wins picked for them,
  // then points for. With no picks this is just the current standings.
  const pickedWins = new Map<number, number>();
  for (const id of Object.values(picks))
    pickedWins.set(id, (pickedWins.get(id) ?? 0) + 1);
  for (const key of Object.keys(medianPicks)) {
    const id = Number(key.split(":")[1]);
    pickedWins.set(id, (pickedWins.get(id) ?? 0) + 1);
  }
  const displayRows = hasPicks
    ? [...data.rows].sort(
        (a, b) =>
          b.winTotal +
            (pickedWins.get(b.rosterId) ?? 0) -
            (a.winTotal + (pickedWins.get(a.rosterId) ?? 0)) ||
          b.pointsFor - a.pointsFor,
      )
    : data.rows;

  // Teams below the line only dim once every remaining game has a pick.
  const allPicked = games.every((g) => picks[gameKey(g)] != null);

  // Clinched / eliminated, redone with the picks counted. A team picked to
  // lose a game loses a win from its ceiling. Once everything is picked the
  // table order decides it.
  const lostPicks = new Map<number, number>();
  for (const g of games) {
    const w = picks[gameKey(g)];
    if (w == null) continue;
    const loser = w === g.a ? g.b : g.a;
    lostPicks.set(loser, (lostPicks.get(loser) ?? 0) + 1);
  }
  const adj = data.rows.map((r) => ({
    id: r.rosterId,
    win: r.winTotal + (pickedWins.get(r.rosterId) ?? 0),
    max: r.maxWins - (lostPicks.get(r.rosterId) ?? 0),
  }));
  const statusMap = new Map<number, { label: string; className: string }>();
  displayRows.forEach((r, i) => {
    const rank = i + 1;
    let status: PlayoffStatus = r.status;
    if (hasPicks) {
      const me = adj.find((a) => a.id === r.rosterId)!;
      const ahead = adj.filter((o) => o.id !== me.id && o.win > me.max).length;
      const couldPass = adj.filter(
        (o) => o.id !== me.id && o.max >= me.win,
      ).length;
      status = "hunt";
      if (allPicked)
        status = rank <= data.playoffTeams ? "clinched" : "eliminated";
      else if (ahead >= data.playoffTeams) status = "eliminated";
      else if (couldPass < data.playoffTeams) status = "clinched";
    }
    statusMap.set(
      r.rosterId,
      statusFor(
        status,
        rank,
        data.playoffTeams,
        odds?.get(r.rosterId)?.makePct ?? 50,
      ),
    );
  });
  const statusOf = (r: StandingRow) => statusMap.get(r.rosterId)!;

  const resetPicks = () => {
    setPicks({});
    setMedianPicks({});
  };

  // Cut line under the last playoff spot.
  const rowClass = (rank: number) =>
    rank === data.playoffTeams
      ? "standings-cutline"
      : rank > data.playoffTeams && allPicked
        ? "standings-out"
        : "";

  const recordOf = (r: StandingRow) =>
    `${r.wins}-${r.losses}${r.ties > 0 ? `-${r.ties}` : ""}`;

  // Projected final record: simulated average wins over every result left.
  const projRecord = (r: StandingRow, o?: TeamOdds) => {
    if (!o) return "–";
    const total =
      r.wins + r.losses + r.ties + r.gamesLeft * loaded.resultsPerWeek;
    const w = Math.min(total, Math.round(o.projWins));
    return `${w}-${total - w}`;
  };

  // Strength of schedule: hardest remaining schedules go full red, easiest full
  // green, and the middle fades out, ranked among teams with games left.
  const sosRanked = data.rows
    .filter((r) => r.sosLeft != null)
    .sort((a, b) => (a.sosLeft as number) - (b.sosLeft as number));
  const sosRank = (rosterId: number) => {
    const i = sosRanked.findIndex((r) => r.rosterId === rosterId);
    return i < 0 ? null : i + 1;
  };
  const sosStyle = (rosterId: number) => {
    const i = sosRanked.findIndex((r) => r.rosterId === rosterId);
    if (i < 0) return undefined;
    const t = sosRanked.length > 1 ? i / (sosRanked.length - 1) : 0.5; // 0 easy, 1 hard
    const strength = Math.abs(t - 0.5) * 2; // 0 in the middle, 1 at the extremes
    const rgb = t < 0.5 ? "40, 231, 87" : "255, 0, 92";
    return { color: `rgba(${rgb}, ${(0.35 + 0.65 * strength).toFixed(2)})` };
  };

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
          Click on each row for all of that teams stats. Picking teams below (in
          Playoff Paths section) move teams up and down and update their status.
        </p>
        <div className="standings-whatif-bar">
          <button
            className="standings-reset"
            disabled={!hasPicks}
            onClick={resetPicks}
          >
            Back to current standings
          </button>
          {hasPicks && (
            <span className="standings-whatif-badge">
              Not current standings
            </span>
          )}
        </div>
        <div
          className={`draft-table-wrap ${hasPicks ? "standings-whatif" : ""}`}
        >
          <table className="draft-table">
            <thead>
              <tr>
                <th>Manager</th>
                <th className="num">Record</th>
                <th className="num">Proj.</th>
                <th className="num draft-hide-mobile">PF</th>
                <th className="num draft-hide-mobile">Max wins</th>
                <th className="num">Playoffs</th>
                <th className="num draft-hide-mobile">Bye</th>
                <th className="num">SOS</th>
                <th className="draft-hide-mobile">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r, i) => {
                const rank = i + 1;
                const teamOdds = odds?.get(r.rosterId);
                const status = statusOf(r);
                return (
                  <tr
                    key={r.rosterId}
                    className={`standings-row ${rowClass(rank)}`}
                    tabIndex={0}
                    onClick={() => setSelectedId(r.rosterId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSelectedId(r.rosterId);
                    }}
                  >
                    <td>{r.owner}</td>
                    <td className="num">{recordOf(r)}</td>
                    <td className="num">{projRecord(r, teamOdds)}</td>
                    <td className="num draft-hide-mobile">
                      {r.pointsFor.toFixed(1)}
                    </td>
                    <td className="num draft-hide-mobile">{r.maxWins}</td>
                    <td className="num">
                      <OddsCell
                        odds={teamOdds}
                        base={hasPicks ? baseOdds?.get(r.rosterId) : undefined}
                      />
                    </td>
                    <td className="num draft-hide-mobile">
                      {teamOdds ? fmtPct(teamOdds.byePct) : "–"}
                    </td>
                    <td className="num" style={sosStyle(r.rosterId)}>
                      {r.sosLeft == null ? "–" : r.sosLeft.toFixed(3)}
                    </td>
                    <td className={`draft-hide-mobile ${status.className}`}>
                      {status.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {pickerWeeks.length > 0 && (
        <section className="panel">
          <h2>Playoff Paths</h2>
          <p className="panel-note">
            Pick a team to add a win for that matchup.
            {loaded.resultsPerWeek === 2 &&
              " Use the Median button (M) to give that team the median win."}{" "}
            Anything you leave alone is still simulated.
          </p>
          <button
            className="standings-reset"
            disabled={!hasPicks}
            onClick={resetPicks}
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

      {selectedRow && (
        <div className="modal-overlay" onClick={() => setSelectedId(null)}>
          <div
            className="modal-content standings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              aria-label="Close"
              onClick={() => setSelectedId(null)}
            >
              ×
            </button>
            {selectedTeam?.avatar && (
              <img
                src={selectedTeam.avatar}
                alt="team avatar"
                className="modal-avatar"
              />
            )}
            <h2>
              {selectedTeam?.teamName || selectedRow.owner}{" "}
              <span className="owner-name">(@{selectedRow.owner})</span>
            </h2>
            <dl className="standings-stats">
              {[
                ["Record", recordOf(selectedRow)],
                ["Proj. record", projRecord(selectedRow, selectedOdds)],
                ["Points for", selectedRow.pointsFor.toFixed(1)],
                ["Points against", selectedRow.pointsAgainst.toFixed(1)],
                ["Games left", String(selectedRow.gamesLeft)],
                ["Max wins", String(selectedRow.maxWins)],
                [
                  "SOS",
                  selectedRow.sosLeft == null
                    ? "–"
                    : `${selectedRow.sosLeft.toFixed(3)} (${ordinal(sosRank(selectedRow.rosterId) ?? 0)})`,
                ],
                [
                  "Playoffs",
                  <OddsCell
                    key="p"
                    odds={selectedOdds}
                    base={
                      hasPicks ? baseOdds?.get(selectedRow.rosterId) : undefined
                    }
                  />,
                ],
                ["Bye", selectedOdds ? fmtPct(selectedOdds.byePct) : "–"],
                [
                  "Status",
                  <span key="s" className={statusOf(selectedRow).className}>
                    {statusOf(selectedRow).label}
                  </span>,
                ],
                [
                  "Next up",
                  selectedRow.nextOpponents.length
                    ? selectedRow.nextOpponents.join(", ")
                    : "Regular season done",
                ],
              ].map(([label, value]) => (
                <div key={label as string} className="standings-stat">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
