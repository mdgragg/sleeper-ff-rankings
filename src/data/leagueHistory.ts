export interface SeasonLeague {
  season: string; // e.g. "2023"
  league_id: string;
}

// Fill this in with every past season's Sleeper league_id, oldest first.
// Find each one at: https://api.sleeper.app/v1/league/<CURRENT_LEAGUE_ID>
// -> look at "previous_league_id", then repeat on that league to walk
// further back.
//
// Whether to include the CURRENT season here depends on the page:
// - History.tsx and MarketShare.tsx both accept a `includeCurrent` flag
//   and will append VITE_LEAGUE_ID automatically when true, so don't
//   duplicate the current season in this list.
export const LEAGUE_HISTORY: SeasonLeague[] = [
  { season: "2022", league_id: "859880880154480640" },
  { season: "2023", league_id: "957497971501780992" },
  { season: "2024", league_id: "1062844227291373568" },
  { season: "2025", league_id: "1247579709596782592" },
];
