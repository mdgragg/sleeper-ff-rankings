const API_BASE = "https://api.sleeper.app/v1/";

export async function fetchLeagueData(leagueID: string) {
  const leagueResp = await fetch(`${API_BASE}league/${leagueID}`);
  const league = await leagueResp.json();
  return league;
}

export async function fetchRosters(leagueID: string) {
  const resp = await fetch(`${API_BASE}league/${leagueID}/rosters`);
  return resp.json();
}

export async function fetchUsers(leagueID: string) {
  const resp = await fetch(`${API_BASE}league/${leagueID}/users`);
  return resp.json();
}

export async function fetchMatchups(leagueID: string, week: number) {
  const resp = await fetch(`${API_BASE}league/${leagueID}/matchups/${week}`);
  return resp.json();
}

export async function fetchTransactions(leagueID: string, week: number) {
  const resp = await fetch(
    `${API_BASE}league/${leagueID}/transactions/${week}`
  );
  return resp.json();
}

export async function fetchNFLState() {
  const resp = await fetch(`${API_BASE}state/nfl`);
  return resp.json();
}
