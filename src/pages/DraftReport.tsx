import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import { Sleeper } from "../features/league/api";
import { getJSON } from "../lib/fetcher";
import {
  buildDraftReport,
  type DraftPick,
  type DraftReportData,
  type PickGrade,
  type PlayerInfo,
  type WeekMatchup,
} from "../lib/draftReport";
import logo from "/images/logo_with_text.png";

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;

interface League {
  season?: string;
  draft_id?: string;
  settings?: { leg?: number };
}

interface Roster {
  roster_id: number;
  owner_id: string;
}

interface LeagueUser {
  user_id: string;
  display_name?: string;
}

const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}`;
const valueClass = (n: number) => (n >= 0 ? "draft-good" : "draft-bad");

// owner is only passed where the manager column is hidden on phones.
function PickCell({ pick, owner }: { pick: PickGrade; owner?: string }) {
  return (
    <>
      {pick.name}
      {pick.position && <span className="draft-muted"> {pick.position}</span>}
      {pick.injuryStatus && (
        <span className="draft-status">{pick.injuryStatus}</span>
      )}
      {owner && <span className="draft-mobile-only"> ({owner})</span>}
    </>
  );
}

// A manager's strongest pick, called out in the Best Drafts table.
function TopPickCell({ picks, owner }: { picks: PickGrade[]; owner: string }) {
  const top = picks.reduce((best, p) =>
    p.vsRoundAvg > best.vsRoundAvg ? p : best,
  );
  return (
    <>
      R{top.round} · <PickCell pick={top} owner={owner} />
    </>
  );
}

// One player per round, used for both the best and worst tables.
function RoundPickTable({
  title,
  note,
  picks,
  ownerOf,
}: {
  title: string;
  note: string;
  picks: PickGrade[];
  ownerOf: (rosterId: number) => string;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <p className="panel-note">{note}</p>
      <div className="draft-table-wrap">
        <table className="draft-table">
          <thead>
            <tr>
              <th>Round</th>
              <th>Player</th>
              <th className="draft-hide-mobile">Drafted by</th>
              <th className="num">Pick</th>
              <th className="num">Points</th>
              <th className="num">Vs. round avg</th>
            </tr>
          </thead>
          <tbody>
            {picks.map((p) => (
              <tr key={p.round}>
                <td>R{p.round}</td>
                <td>
                  <PickCell pick={p} owner={ownerOf(p.rosterId)} />
                </td>
                <td className="draft-hide-mobile">{ownerOf(p.rosterId)}</td>
                <td className="num">#{p.pickNo}</td>
                <td className="num">{p.points.toFixed(1)}</td>
                <td className={`num ${valueClass(p.vsRoundAvg)}`}>
                  {signed(p.vsRoundAvg)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DraftReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState("");
  const [weeksPlayed, setWeeksPlayed] = useState(0);
  const [report, setReport] = useState<DraftReportData | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const league = await getJSON<League>(Sleeper.league(LEAGUE_ID));
        const leg = Number(league.settings?.leg ?? 0);
        setSeason(league.season ?? "");
        setWeeksPlayed(leg);

        if (!league.draft_id) {
          throw new Error("No draft is linked to this league yet.");
        }

        const weekNumbers = Array.from({ length: leg }, (_, i) => i + 1);
        const [picks, rosters, users, players, weeks] = await Promise.all([
          getJSON<DraftPick[]>(Sleeper.draftPicks(league.draft_id)),
          getJSON<Roster[]>(Sleeper.rosters(LEAGUE_ID)),
          getJSON<LeagueUser[]>(Sleeper.leagueUsers(LEAGUE_ID)),
          getJSON<Record<string, PlayerInfo>>(Sleeper.players),
          Promise.all(
            weekNumbers.map((w) =>
              getJSON<WeekMatchup[]>(Sleeper.matchups(LEAGUE_ID, w)),
            ),
          ),
        ]);

        const owners: Record<number, string> = {};
        for (const roster of rosters) {
          const user = users.find((u) => u.user_id === roster.owner_id);
          owners[roster.roster_id] = user?.display_name || "Unknown";
        }

        setReport(buildDraftReport(picks, weeks, players, owners));
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Grading the draft...</p>
      </div>
    );

  const header = (
    <header>
      <Link to="/">
        <img alt="logo" className="sleeper-logo" src={logo} />
      </Link>
      <h1>Draft Report</h1>
      <h2>
        {season ? `${season} Season` : ""}
        {weeksPlayed ? ` · through Week ${weeksPlayed}` : ""}
      </h2>
    </header>
  );

  if (error || !report || report.picks.length === 0) {
    return (
      <div className="body draft-page">
        <NavDrawer />
        {header}
        <p className="draft-muted">
          {error ?? "No draft picks found for this season yet."}
        </p>
      </div>
    );
  }

  const ownerOf = (rosterId: number) =>
    report.managers.find((m) => m.rosterId === rosterId)?.owner ?? "";

  const bestDrafts = [...report.managers].sort(
    (a, b) => b.vsRoundAvg - a.vsRoundAvg,
  );
  // Within a round the baseline is the same, so best/worst is just the top/bottom points.
  const extremeByRound = (isBetter: (a: PickGrade, b: PickGrade) => boolean) =>
    [...new Set(report.picks.map((p) => p.round))]
      .sort((a, b) => a - b)
      .map((round) =>
        report.picks
          .filter((p) => p.round === round)
          .reduce((x, p) => (isBetter(p, x) ? p : x)),
      );
  const bestByRound = extremeByRound((a, b) => a.vsRoundAvg > b.vsRoundAvg);
  const worstByRound = extremeByRound((a, b) => a.vsRoundAvg < b.vsRoundAvg);
  const unluckiest = report.managers
    .filter((m) => m.gamesMissed > 0)
    .sort((a, b) => b.pointsLost - a.pointsLost);

  return (
    <div className="body draft-page">
      <NavDrawer />
      {header}

      <section className="panel">
        <h2>Best Drafts</h2>
        <p className="panel-note">
          Season points above or below the average for the same round. Includes
          bench points.
        </p>
        <div className="draft-table-wrap">
          <table className="draft-table">
            <thead>
              <tr>
                <th className="draft-hide-mobile">#</th>
                <th className="draft-hide-mobile">Manager</th>
                <th>Top pick</th>
                <th className="num">Picks</th>
                <th className="num">Points</th>
                <th className="num">Vs. round avg</th>
              </tr>
            </thead>
            <tbody>
              {bestDrafts.map((m, i) => (
                <tr key={m.rosterId}>
                  <td className="draft-hide-mobile">{i + 1}</td>
                  <td className="draft-hide-mobile">{m.owner}</td>
                  <td>
                    <TopPickCell picks={m.picks} owner={m.owner} />
                  </td>
                  <td className="num">{m.picks.length}</td>
                  <td className="num">{m.totalPoints.toFixed(1)}</td>
                  <td className={`num ${valueClass(m.vsRoundAvg)}`}>
                    {signed(m.vsRoundAvg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <RoundPickTable
        title="Best Pick Per Round"
        note="The strongest season from each round, and who drafted him."
        picks={bestByRound}
        ownerOf={ownerOf}
      />

      <RoundPickTable
        title="Worst Pick Per Round"
        note="The weakest season from each round, and who drafted him."
        picks={worstByRound}
        ownerOf={ownerOf}
      />

      <section className="panel">
        <h2>Unluckiest Drafts</h2>
        <p className="panel-note">
          Games missed by drafted players while their NFL team played. Points
          lost is estimated from each round's average points per game.
        </p>
        <div className="draft-table-wrap">
          <table className="draft-table">
            <thead>
              <tr>
                <th className="draft-hide-mobile">#</th>
                <th>Manager</th>
                <th className="num">Games missed</th>
                <th className="num">Est. points lost</th>
                <th>Worst injury</th>
              </tr>
            </thead>
            <tbody>
              {unluckiest.map((m, i) => (
                <tr key={m.rosterId}>
                  <td className="draft-hide-mobile">{i + 1}</td>
                  <td>{m.owner}</td>
                  <td className="num">{m.gamesMissed}</td>
                  <td className="num">{m.pointsLost.toFixed(1)}</td>
                  <td>
                    {m.worstInjury ? (
                      <>
                        <PickCell pick={m.worstInjury} />
                        <span className="draft-muted">
                          {" "}
                          · R{m.worstInjury.round} · {m.worstInjury.gamesMissed}{" "}
                          missed
                        </span>
                      </>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
