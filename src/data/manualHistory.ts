// Results from seasons before the league moved to Sleeper.
// Sleeper only knows about the seasons listed in leagueHistory.ts (2022+),
// so anything older has to be typed in here by hand. These merge into the
// Hall of Fame / Hall of Shame tables on the History page.
//
// Rules:
// - owner_id ties the results to a manager's Sleeper row, so their old
//   trophies show up next to their Sleeper ones.
// - `name` is only needed for someone who never played on Sleeper (they'll
//   get their own row with 0-0 records).
// - Only list seasons that are NOT in leagueHistory.ts, or the placement
//   gets counted twice.
//
// Sleeper user ids for this league:
//   779230727840645120  michaelGragg
//   859887658577567744  bmullinger
//   859887925402386432  jonnychernek
//   859903842383425536  jcheech30
//   859978017550753792  jdasch1216
//   859978110567813120  bopaskar
//   860617571018338304  brianhavrilla
//   860698933880561664  TeddyBald
//   860701742805970944  kevmullinger
//   861681281560334336  ayayron101
//   862404399966818304  Teechen
//   862932491244253184  courtneychernek

export interface ManualHistoryEntry {
  owner_id: string;
  /** Only for managers who never played on Sleeper. */
  name?: string;
  championships?: string[];
  runnerUps?: string[];
  thirds?: string[];
  toiletBowls?: string[];
  /** Seasons they made the playoffs — feeds the Longest Playoff Streak list. */
  playoffSeasons?: string[];
}

// Corrections for the Sleeper seasons (2022+).
//
// The toilet bowl is worked out from the losers bracket, and Sleeper gets
// it wrong when the bracket wasn't played out properly. Anything listed
// here wins over whatever the bracket says:
//   "2023": "859887658577567744"  -> force bmullinger as the 2023 loser
//   "2024": null                  -> no toilet bowl recorded for 2024
//
// Use this for Sleeper seasons only — for older years put the season in
// that manager's `toiletBowls` list below instead, or it'll count twice.
export const TOILET_BOWL_OVERRIDES: Record<string, string | null> = {
  "2022": "859887925402386432",
  "2023": "859978110567813120",
  "2024": "859887658577567744",
  "2025": "861681281560334336",
};

// Champions below are carried over from the previous-champ list on the
// power rankings page.
export const MANUAL_HISTORY: ManualHistoryEntry[] = [
  {
    owner_id: "859887925402386432", // jonnychernek
    championships: ["2015", "2016", "2020"],
    runnerUps: ["2021"],
    thirds: [],
    toiletBowls: ["2018"],
  },
  {
    owner_id: "859887658577567744", // bmullinger
    championships: ["2017"],
    runnerUps: ["2016"],
    thirds: ["2018"],
    toiletBowls: ["2019", "2020"],
  },
  {
    owner_id: "861681281560334336", // ayayron101
    championships: ["2018"],
    runnerUps: [],
    thirds: ["2016", "2019"],
    toiletBowls: [],
  },
  {
    owner_id: "860701742805970944", // kevmullinger
    championships: ["2019"],
    runnerUps: [],
    thirds: [],
    toiletBowls: ["2021"],
  },
  {
    owner_id: "859903842383425536", // jcheech30
    championships: ["2021"],
    runnerUps: [],
    thirds: [],
    toiletBowls: [],
  },
  {
    owner_id: "860617571018338304", // brianhavrilla
    championships: [],
    runnerUps: ["2018", "2019"],
    thirds: ["2017", "2021"],
    toiletBowls: [],
  },
  {
    owner_id: "860698933880561664", //    TeddyBald
    championships: [],
    runnerUps: ["2017"],
    thirds: [],
    toiletBowls: ["2016"],
  },
  {
    owner_id: "859978110567813120", //   bopaskar
    championships: [],
    runnerUps: ["2020"],
    thirds: [],
    toiletBowls: [],
  },
  {
    owner_id: "779230727840645120", //     michaelGragg
    championships: [],
    runnerUps: [],
    thirds: ["2020"],
    toiletBowls: ["2017"],
  },
  {
    owner_id: "859978017550753792", //       jdasch1216
    championships: [],
    runnerUps: [],
    thirds: ["2020"],
    toiletBowls: ["2015"],
  },
];
