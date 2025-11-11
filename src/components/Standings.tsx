import TeamCard from "./TeamCard";
import WeeklyAwards from "./WeeklyAwards";
import type { Owner, OwnerWithRanks } from "../types";

interface StandingsProps {
  owners: Owner[];
  weeklyExtras: Record<
    number,
    { blurb?: string; image?: string; gifs?: string; topWeeks?: number[] }
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
  // Step 1: Sort owners for display (manual rank > wins > points)
  const ownersSorted = owners.slice().sort((a, b) => {
    if (a.manualRank !== undefined && b.manualRank !== undefined)
      return a.manualRank - b.manualRank;
    if (a.manualRank !== undefined) return -1;
    if (b.manualRank !== undefined) return 1;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  // Step 2: Build tie-aware ranks
  function buildRanks<T extends { ownerID: string | number }>(
    arr: T[],
    key: keyof T
  ): Record<string | number, number> {
    const sorted = [...arr].sort(
      (a, b) => Number(b[key] ?? 0) - Number(a[key] ?? 0)
    );
    let currentRank = 1;
    const ranks: Record<string | number, number> = {};

    for (let i = 0; i < sorted.length; i++) {
      const owner = sorted[i];
      const prev = sorted[i - 1];
      if (i > 0 && Number(owner[key]) === Number(prev[key])) {
        ranks[owner.ownerID] = ranks[prev.ownerID];
      } else {
        ranks[owner.ownerID] = currentRank;
      }
      currentRank++;
    }

    return ranks;
  }

  const addDropRanks = buildRanks(ownersSorted, "addDropCount");
  const tradeRanks = buildRanks(ownersSorted, "TradeCount");

  // Step 3: Build ownersWithRanks
  const ownersWithRanks: OwnerWithRanks[] = ownersSorted.map((owner) => {
    const rankHelper = (arr: Owner[], key: keyof Owner) => {
      const sorted = [...arr].sort(
        (a, b) => (b[key] as number) - (a[key] as number)
      );
      return sorted.findIndex((o) => o.ownerID === owner.ownerID) + 1;
    };

    return {
      ...owner,
      ranks: {
        pointsForRank: rankHelper(ownersSorted, "pointsFor"),
        pointsAgainstRank: rankHelper(ownersSorted, "pointsAgainst"),
        pointsPossibleRank: rankHelper(ownersSorted, "pointsPossible"),
        pointsPossiblePercRank: rankHelper(ownersSorted, "pointsPossiblePerc"),
        addDropRank: addDropRanks[owner.ownerID],
        tradeRank: tradeRanks[owner.ownerID],
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
                  ? `https://sleepercdn.com/avatars/thumbs/${owner.avatar}`
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
        <p>Click on team logo to see season stats and rankings.</p>
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
