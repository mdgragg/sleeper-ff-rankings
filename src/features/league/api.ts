const API = "https://api.sleeper.app/v1";

export const Sleeper = {
  league: (leagueId: string) => `${API}/league/${leagueId}`,
  leagueUsers: (leagueId: string) => `${API}/league/${leagueId}/users`,
  rosters: (leagueId: string) => `${API}/league/${leagueId}/rosters`,
  matchups: (leagueId: string, week: number) =>
    `${API}/league/${leagueId}/matchups/${week}`,
  transactions: (leagueId: string, week: number) =>
    `${API}/league/${leagueId}/transactions/${week}`,
  draft: (draftId: string) => `${API}/draft/${draftId}`,
  draftPicks: (draftId: string) => `${API}/draft/${draftId}/picks`,
  nflState: () => `${API}/state/nfl`,
};
