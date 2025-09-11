export interface Owner {
  ownerID: string;
  roster_id: number;
  userName?: string;
  teamName?: string;
  wins: number;
  losses: number;
  ties: number;
  streak: string;
  matchupPoints?: number;
  addDropCount: number;
  TradeCount: number;
  avatar?: string;
  teamAvatar?: string;
  waiverOrder: number;
  pointsFor: number;
  pointsAgainst: number;
  pointsPossible: number;
  pointsPossiblePerc: number;
  matchupID?: string;
  nextMatchupID?: string;
  manualRank?: number;

  topScorerWeek?: string;
  topScorerWeekPoints?: number;
  topScorerSeason?: string;
  topScorerSeasonPoints?: number;
}

export type OwnerWithRanks = Owner & {
  ranks: {
    pointsForRank: number;
    pointsAgainstRank: number;
    pointsPossibleRank: number;
    pointsPossiblePercRank: number;
    addDropRank: number;
    tradeRank: number;
  };
};
