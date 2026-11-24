// Pure calculations for the Draft Report page. No fetching happens here.

export interface DraftPick {
  round: number;
  pick_no: number;
  roster_id: number;
  player_id: string;
  is_keeper?: boolean | null;
}

export interface WeekMatchup {
  roster_id: number;
  players?: string[]; // everyone rostered that week, starters and bench
  players_points?: Record<string, number>;
}

export interface PlayerInfo {
  full_name?: string;
  position?: string;
  team?: string | null;
  injury_status?: string | null;
}

export interface PickGrade {
  pickNo: number;
  round: number;
  rosterId: number;
  playerId: string;
  name: string;
  position: string;
  injuryStatus: string | null;
  points: number; // season total, starter or bench
  gamesPlayed: number;
  gamesMissed: number; // team played, player rostered, player scored nothing
  vsRoundAvg: number; // points minus the average for this round
  pointsLost: number; // gamesMissed * round's average points per game
}

export interface ManagerGrade {
  rosterId: number;
  owner: string;
  picks: PickGrade[];
  totalPoints: number;
  vsRoundAvg: number;
  gamesMissed: number;
  pointsLost: number;
  worstInjury: PickGrade | null;
}

export interface DraftReportData {
  picks: PickGrade[];
  managers: ManagerGrade[];
}

function addToSet<K>(map: Map<K, Set<number>>, key: K, value: number) {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(value);
}

const average = (xs: number[]) =>
  xs.length ? xs.reduce((sum, x) => sum + x, 0) / xs.length : 0;

/**
 * weeks[0] is Week 1. owners maps roster_id -> display name.
 */
export function buildDraftReport(
  picks: DraftPick[],
  weeks: WeekMatchup[][],
  players: Record<string, PlayerInfo>,
  owners: Record<number, string>,
): DraftReportData {
  // Keeper picks were not drafted this year, so they would skew the baselines.
  const draftPicks = picks.filter((p) => !p.is_keeper && p.player_id);

  const pointsByPlayer = new Map<string, number>();
  const playedWeeks = new Map<string, Set<number>>(); // scored more than 0
  const rosteredWeeks = new Map<string, Set<number>>(); // on a roster that week
  const teamPlayedWeeks = new Map<string, Set<number>>(); // NFL team had a scorer

  weeks.forEach((matchups, index) => {
    const week = index + 1;
    for (const matchup of matchups) {
      for (const pid of matchup.players ?? []) {
        addToSet(rosteredWeeks, pid, week);
      }
      for (const [pid, raw] of Object.entries(matchup.players_points ?? {})) {
        const pts = Number(raw) || 0;
        if (pts === 0) continue;
        pointsByPlayer.set(pid, (pointsByPlayer.get(pid) ?? 0) + pts);
        addToSet(playedWeeks, pid, week);
        const team = players[pid]?.team;
        if (team) addToSet(teamPlayedWeeks, team, week);
      }
    }
  });

  const gamesPlayedOf = (pid: string) => playedWeeks.get(pid)?.size ?? 0;

  // A week only counts as missed if the player was rostered and his team played.
  // A team with no scorers that week is treated as on bye.
  const gamesMissedOf = (pid: string) => {
    const team = players[pid]?.team;
    const rostered = rosteredWeeks.get(pid);
    const teamWeeks = team ? teamPlayedWeeks.get(team) : undefined;
    if (!rostered || !teamWeeks) return 0;
    const played = playedWeeks.get(pid);
    let missed = 0;
    for (const week of rostered) {
      if (teamWeeks.has(week) && !played?.has(week)) missed++;
    }
    return missed;
  };

  // Baselines per round, the "draft slot" for this analysis.
  const roundAvgPoints = new Map<number, number>();
  const roundAvgPerGame = new Map<number, number>();
  const rounds = new Set(draftPicks.map((p) => p.round));
  for (const round of rounds) {
    const inRound = draftPicks.filter((p) => p.round === round);
    roundAvgPoints.set(
      round,
      average(inRound.map((p) => pointsByPlayer.get(p.player_id) ?? 0)),
    );
    const perGame = inRound
      .filter((p) => gamesPlayedOf(p.player_id) > 0)
      .map(
        (p) =>
          (pointsByPlayer.get(p.player_id) ?? 0) / gamesPlayedOf(p.player_id),
      );
    roundAvgPerGame.set(round, average(perGame));
  }

  const picksGraded: PickGrade[] = draftPicks.map((p) => {
    const info = players[p.player_id];
    const points = pointsByPlayer.get(p.player_id) ?? 0;
    const gamesMissed = gamesMissedOf(p.player_id);
    return {
      pickNo: p.pick_no,
      round: p.round,
      rosterId: p.roster_id,
      playerId: p.player_id,
      name: info?.full_name || `Player ${p.player_id}`,
      position: info?.position ?? "",
      injuryStatus: info?.injury_status ?? null,
      points,
      gamesPlayed: gamesPlayedOf(p.player_id),
      gamesMissed,
      vsRoundAvg: points - (roundAvgPoints.get(p.round) ?? 0),
      pointsLost: gamesMissed * (roundAvgPerGame.get(p.round) ?? 0),
    };
  });

  const byRoster = new Map<number, PickGrade[]>();
  for (const pick of picksGraded) {
    const list = byRoster.get(pick.rosterId) ?? [];
    list.push(pick);
    byRoster.set(pick.rosterId, list);
  }

  const managers: ManagerGrade[] = [...byRoster].map(([rosterId, list]) => {
    const sorted = [...list].sort((a, b) => a.pickNo - b.pickNo);
    const worst = sorted.reduce<PickGrade | null>(
      (best, p) =>
        p.gamesMissed > 0 && (!best || p.pointsLost > best.pointsLost)
          ? p
          : best,
      null,
    );
    return {
      rosterId,
      owner: owners[rosterId] ?? `Roster ${rosterId}`,
      picks: sorted,
      totalPoints: sorted.reduce((s, p) => s + p.points, 0),
      vsRoundAvg: sorted.reduce((s, p) => s + p.vsRoundAvg, 0),
      gamesMissed: sorted.reduce((s, p) => s + p.gamesMissed, 0),
      pointsLost: sorted.reduce((s, p) => s + p.pointsLost, 0),
      worstInjury: worst,
    };
  });

  return { picks: picksGraded, managers };
}
