// Monte Carlo playoff odds for the Standings page. No fetching happens here.
import type { ScheduleMatchup, StandingRow } from "./standings";

export interface Game {
  week: number; // 1-based
  matchupId: number;
  a: number; // roster ids
  b: number;
}

export const gameKey = (g: Pick<Game, "week" | "matchupId">) =>
  `${g.week}:${g.matchupId}`;

// Key for a "this team gets the median win this week" pick.
export const medianKey = (week: number, rosterId: number) =>
  `${week}:${rosterId}`;

export interface Profile {
  mean: number;
  std: number;
}

export interface TeamOdds {
  makePct: number; // 0-100
  topSeedPct: number;
}

const SIMS = 10000;
const MIN_STD = 8;
const FALLBACK_MEAN = 100;
const FALLBACK_STD = 20;
const SHRINK_GAMES = 3; // pull small samples toward the league-wide spread

// Unplayed games, grouped by the pairs Sleeper has already scheduled.
export function remainingGames(
  schedule: ScheduleMatchup[][],
  weeksPlayed: number,
  regularSeasonWeeks: number,
): Game[] {
  const games: Game[] = [];
  for (let w = weeksPlayed; w < regularSeasonWeeks; w++) {
    const byMatchup = new Map<number, number[]>();
    for (const m of schedule[w] ?? []) {
      if (m.matchup_id == null) continue;
      byMatchup.set(m.matchup_id, [
        ...(byMatchup.get(m.matchup_id) ?? []),
        m.roster_id,
      ]);
    }
    for (const [matchupId, ids] of byMatchup) {
      if (ids.length === 2)
        games.push({ week: w + 1, matchupId, a: ids[0], b: ids[1] });
    }
  }
  return games;
}

// Season-average score and (shrunk) week-to-week spread for every roster.
export function scoringProfiles(
  schedule: ScheduleMatchup[][],
  weeksPlayed: number,
): Map<number, Profile> {
  const scores = new Map<number, number[]>();
  for (let w = 0; w < weeksPlayed; w++) {
    for (const m of schedule[w] ?? []) {
      if (!m.points) continue;
      scores.set(m.roster_id, [...(scores.get(m.roster_id) ?? []), m.points]);
    }
  }

  const variance = (xs: number[], mean: number) =>
    xs.length > 1
      ? xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1)
      : 0;
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

  const all = [...scores.values()].flat();
  const leagueMean = all.length ? avg(all) : FALLBACK_MEAN;
  const leagueStd =
    all.length > 1 ? Math.sqrt(variance(all, leagueMean)) : FALLBACK_STD;

  const profiles = new Map<number, Profile>();
  for (const [id, xs] of scores) {
    const mean = avg(xs);
    const v =
      (variance(xs, mean) * xs.length + leagueStd ** 2 * SHRINK_GAMES) /
      (xs.length + SHRINK_GAMES);
    profiles.set(id, { mean, std: Math.max(MIN_STD, Math.sqrt(v)) });
  }
  return profiles;
}

// Small seeded RNG so odds don't jitter between renders, and so toggling a
// pick only changes the sims that pick touches.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulateOdds(opts: {
  rows: StandingRow[];
  games: Game[];
  profiles: Map<number, Profile>;
  picks: Record<string, number>; // game key -> winning roster id
  medianPicks: Record<string, true>; // medianKey -> forced above the median
  resultsPerWeek: number;
  playoffTeams: number;
}): Map<number, TeamOdds> {
  const {
    rows,
    games,
    profiles,
    picks,
    medianPicks,
    resultsPerWeek,
    playoffTeams,
  } = opts;
  const rand = mulberry32(20260101);
  const normal = () =>
    Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

  const n = rows.length;
  const idxOf = new Map(rows.map((r, i) => [r.rosterId, i]));
  const startWins = rows.map((r) => r.winTotal);
  const startPF = rows.map((r) => r.pointsFor);
  const prof = rows.map(
    (r) =>
      profiles.get(r.rosterId) ?? { mean: FALLBACK_MEAN, std: FALLBACK_STD },
  );

  const weeks = new Map<number, { a: number; b: number; pick?: number }[]>();
  for (const g of games) {
    const a = idxOf.get(g.a);
    const b = idxOf.get(g.b);
    if (a == null || b == null) continue;
    const pickedId = picks[gameKey(g)];
    const pick = pickedId == null ? undefined : idxOf.get(pickedId);
    weeks.set(g.week, [...(weeks.get(g.week) ?? []), { a, b, pick }]);
  }
  const weekList = [...weeks.entries()]
    .sort((x, y) => x[0] - y[0])
    .map(([week, weekGames]) => ({
      games: weekGames,
      // Teams forced to take the median win this week.
      forced: new Set(
        rows
          .map((r, i) => (medianPicks[medianKey(week, r.rosterId)] ? i : -1))
          .filter((i) => i >= 0),
      ),
    }));

  const made = new Array(n).fill(0);
  const top = new Array(n).fill(0);

  const wins = new Array(n);
  const pf = new Array(n);
  const order = Array.from({ length: n }, (_, i) => i);

  for (let s = 0; s < SIMS; s++) {
    for (let i = 0; i < n; i++) {
      wins[i] = startWins[i];
      pf[i] = startPF[i];
    }

    for (const { games: weekGames, forced } of weekList) {
      const scored: { i: number; score: number }[] = [];
      for (const g of weekGames) {
        // Always draw both scores so the random stream doesn't depend on picks.
        let sa = Math.max(0, prof[g.a].mean + prof[g.a].std * normal());
        let sb = Math.max(0, prof[g.b].mean + prof[g.b].std * normal());
        // A picked winner has to outscore the opponent, which also feeds the median.
        if ((g.pick === g.a && sa < sb) || (g.pick === g.b && sb < sa)) {
          [sa, sb] = [sb, sa];
        }
        wins[g.a] += sa > sb ? 1 : sa < sb ? 0 : 0.5;
        wins[g.b] += sb > sa ? 1 : sb < sa ? 0 : 0.5;
        pf[g.a] += sa;
        pf[g.b] += sb;
        scored.push({ i: g.a, score: sa }, { i: g.b, score: sb });
      }
      if (resultsPerWeek === 2) {
        // Half the week's teams beat the median. Forced teams take their
        // slot first, and the top remaining scores fill the rest.
        const slots = Math.floor(scored.length / 2);
        const rest = scored.filter((t) => !forced.has(t.i));
        rest.sort((x, y) => y.score - x.score);
        const winners = [...forced].concat(
          rest.slice(0, Math.max(0, slots - forced.size)).map((t) => t.i),
        );
        for (const i of winners) wins[i] += 1;
      }
    }

    order.sort((x, y) => wins[y] - wins[x] || pf[y] - pf[x]);
    order.forEach((teamIdx, rank) => {
      const inPlayoffs = rank < playoffTeams;
      if (inPlayoffs) made[teamIdx]++;
      if (rank === 0) top[teamIdx]++;
    });
  }

  return new Map(
    rows.map((r, i) => [
      r.rosterId,
      {
        makePct: (made[i] / SIMS) * 100,
        topSeedPct: (top[i] / SIMS) * 100,
      },
    ]),
  );
}
