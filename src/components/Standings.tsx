import TeamCard from "./TeamCard";
import WeeklyAwards from "./WeeklyAwards";
import type { Owner, OwnerWithRanks } from "../types";

interface StandingsProps {
  owners: Owner[];
  weeklyExtras: Record<
    number,
    { blurb?: string; image?: string; gif?: string }
  >;
  currentWeek: number;
  previousChampsByOwner: Record<string, string>;
  currentChampRosterId: number;
  matchups: Record<string, Owner[]>;
  nextMatchups: Record<string, Owner[]>;
}

export default function Standings({
  owners,
  weeklyExtras,
  currentWeek,
  previousChampsByOwner,
  currentChampRosterId,
  matchups,
  nextMatchups,
}: StandingsProps) {
  // Step 1: Sort owners for display
  const ownersSorted = owners.slice().sort((a, b) => {
    if (a.manualRank !== undefined && b.manualRank !== undefined) {
      return a.manualRank - b.manualRank;
    }
    if (a.manualRank !== undefined) return -1;
    if (b.manualRank !== undefined) return 1;

    if (b.wins !== a.wins) return b.wins - a.wins;

    return b.pointsFor - a.pointsFor;
  });

  const ownersWithRanks: OwnerWithRanks[] = ownersSorted.map((owner) => {
    const rankHelper = (arr: Owner[], key: keyof Owner) => {
      const sorted = [...arr].sort(
        (a, b) => (b[key] as number) - (a[key] as number)
      );
      const idx = sorted.findIndex((o) => o.ownerID === owner.ownerID);
      return idx + 1;
    };
    return {
      ...owner,
      ranks: {
        pointsForRank: rankHelper(ownersSorted, "pointsFor"),
        pointsAgainstRank: rankHelper(ownersSorted, "pointsAgainst"),
        pointsPossibleRank: rankHelper(ownersSorted, "pointsPossible"),
        pointsPossiblePercRank: rankHelper(ownersSorted, "pointsPossiblePerc"),
        addDropRank: rankHelper(ownersSorted, "addDropCount"),
        tradeRank: rankHelper(ownersSorted, "TradeCount"),
      },
    };
  });

  return (
    <>
      <div className="avatar-buttons">
        {ownersSorted.map((owner) => (
          <a key={owner.ownerID} href={`#${owner.userName}`}>
            <img
              alt="team avatar"
              src={
                owner.teamAvatar ||
                (owner.avatar
                  ? "https://sleepercdn.com/avatars/thumbs/" + owner.avatar
                  : "")
              }
              className="avatar-link"
            />
          </a>
        ))}
      </div>

      <WeeklyAwards owners={ownersWithRanks} currentWeek={currentWeek} />

      <div className="note">
        <h3>2025 Update</h3>
        <p>Click on team Logo to see season stats and rankings.</p>
      </div>

      <div className="standings">
        {ownersWithRanks.map((owner, idx) => (
          <TeamCard
            key={owner.ownerID}
            owner={owner}
            owners={ownersWithRanks}
            idx={idx}
            weeklyExtras={weeklyExtras}
            currentWeek={currentWeek}
            matchups={matchups}
            nextMatchups={nextMatchups}
            previousChampsByOwner={previousChampsByOwner}
            currentChampRosterId={currentChampRosterId}
          />
        ))}
      </div>
    </>
  );
}
