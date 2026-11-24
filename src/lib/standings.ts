// Pure calculations for the Standings / Playoff Picture page. No fetching here.

export interface StandingsRoster {
  roster_id: number;
  owner_id: string;
  settings?: {
    wins?: number;
    losses?: number;
    ties?: number;
    fpts?: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
  };
}

export interface ScheduleMatchup {
  roster_id: number;
  matchup_id: number | null;
  points?: number; // 0 for weeks not yet played
}

export type PlayoffStatus = "clinched" | "eliminated" | "hunt";

export interface StandingRow {
  rosterId: number;
  owner: string;
  seed: number;
  wins: number;
  losses: number;
  ties: number;
  winTotal: number; // wins plus half of ties
  pointsFor: number;
  pointsAgainst: number;
  gamesLeft: number;
  maxWins: number; // wins if they win out (ties count half)
  sosLeft: number | null; // avg win % of remaining opponents, null if none left
  nextOpponents: string[];
  status: PlayoffStatus;
}

export interface StandingsData {
  rows: StandingRow[];
  playoffTeams: number;
  regularSeasonWeeks: number;
}

const half = (n: number) => n / 2;

export function buildStandings(
  rosters: StandingsRoster[],
  owners: Record<number, string>,
  // schedule[0] is week 1. Future weeks are present with matchup ids but no points.
  schedule: ScheduleMatchup[][],
  playoffTeams: number,
  regularSeasonWeeks: number,
  // Weeks already scored. Can't come from the records: with a median game a
  // team racks up two results per week.
  weeksPlayed: number,
  // 2 when the league also scores a win/loss against the weekly median.
  resultsPerWeek: number,
): StandingsData {
  const base = rosters.map((r) => {
    const s = r.settings ?? {};
    const wins = s.wins ?? 0;
    const losses = s.losses ?? 0;
    const ties = s.ties ?? 0;
    return {
      rosterId: r.roster_id,
      owner: owners[r.roster_id] ?? "Unknown",
      wins,
      losses,
      ties,
      winTotal: wins + half(ties),
      gamesPlayed: wins + losses + ties, // results, not weeks
      pointsFor: (s.fpts ?? 0) + (s.fpts_decimal ?? 0) / 100,
      pointsAgainst:
        (s.fpts_against ?? 0) + (s.fpts_against_decimal ?? 0) / 100,
    };
  });

  const winPct = (rosterId: number) => {
    const t = base.find((b) => b.rosterId === rosterId);
    return t && t.gamesPlayed > 0 ? t.winTotal / t.gamesPlayed : 0.5;
  };

  // Opponents each roster still has to face in the regular season.
  const remaining = (rosterId: number, weeksDone: number): number[] => {
    const opponents: number[] = [];
    for (let week = weeksDone; week < regularSeasonWeeks; week++) {
      const games = schedule[week] ?? [];
      const mine = games.find((g) => g.roster_id === rosterId);
      if (!mine || mine.matchup_id == null) continue; // bye / not scheduled
      const opp = games.find(
        (g) => g.matchup_id === mine.matchup_id && g.roster_id !== rosterId,
      );
      if (opp) opponents.push(opp.roster_id);
    }
    return opponents;
  };

  const sorted = base
    .map((b) => {
      const opps = remaining(b.rosterId, weeksPlayed);
      return {
        ...b,
        opps,
        maxWins: b.winTotal + opps.length * resultsPerWeek,
      };
    })
    .sort((a, b) => b.winTotal - a.winTotal || b.pointsFor - a.pointsFor);

  const seasonOver = sorted.every((t) => t.opps.length === 0);

  const rows: StandingRow[] = sorted.map((t, i) => {
    // Eliminated: enough teams are already guaranteed to finish above their ceiling.
    const guaranteedAhead = sorted.filter(
      (o) => o.rosterId !== t.rosterId && o.winTotal > t.maxWins,
    ).length;
    // Clinched: even if every team that could catch them does, they are still in.
    // Teams that can only tie are counted, since tiebreakers aren't known yet.
    const couldFinishAhead = sorted.filter(
      (o) => o.rosterId !== t.rosterId && o.maxWins >= t.winTotal,
    ).length;

    let status: PlayoffStatus = "hunt";
    if (seasonOver) status = i < playoffTeams ? "clinched" : "eliminated";
    else if (guaranteedAhead >= playoffTeams) status = "eliminated";
    else if (couldFinishAhead < playoffTeams) status = "clinched";

    return {
      rosterId: t.rosterId,
      owner: t.owner,
      seed: i + 1,
      wins: t.wins,
      losses: t.losses,
      ties: t.ties,
      winTotal: t.winTotal,
      pointsFor: t.pointsFor,
      pointsAgainst: t.pointsAgainst,
      gamesLeft: t.opps.length,
      maxWins: t.maxWins,
      sosLeft: t.opps.length
        ? t.opps.reduce((sum, id) => sum + winPct(id), 0) / t.opps.length
        : null,
      nextOpponents: t.opps.slice(0, 3).map((id) => owners[id] ?? "Unknown"),
      status,
    };
  });

  return { rows, playoffTeams, regularSeasonWeeks };
}
