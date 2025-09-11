import type { Owner } from "../types";

interface WeeklyAwardsProps {
  owners: Owner[];
  currentWeek: number;
}

export default function WeeklyAwards({
  owners,
  currentWeek,
}: WeeklyAwardsProps) {
  const weeklyWinner = owners.reduce(
    (best, o) =>
      (o.matchupPoints ?? -Infinity) > (best.matchupPoints ?? -Infinity)
        ? o
        : best,
    owners[0]
  );

  const bustTeam = owners.reduce(
    (prev, curr) =>
      (curr.matchupPoints ?? Infinity) < (prev.matchupPoints ?? Infinity)
        ? curr
        : prev,
    owners[0]
  );

  const transactionKing = owners.reduce(
    (prev, curr) =>
      (curr.addDropCount ?? 0) > (prev.addDropCount ?? 0) ? curr : prev,
    owners[0]
  );

  const worstLuck = owners.reduce(
    (prev, curr) =>
      (curr.pointsAgainst ?? -Infinity) > (prev.pointsAgainst ?? -Infinity)
        ? curr
        : prev,
    owners[0]
  );

  const bestManager = owners.reduce(
    (prev, curr) =>
      (curr.pointsPossiblePerc ?? 0) > (prev.pointsPossiblePerc ?? 0)
        ? curr
        : prev,
    owners[0]
  );

  const worstManager = owners.reduce(
    (prev, curr) =>
      (curr.pointsPossiblePerc ?? Infinity) <
      (prev.pointsPossiblePerc ?? Infinity)
        ? curr
        : prev,
    owners[0]
  );

  return (
    <div id="weekly-awards">
      <h2>Weekly Awards - Week {currentWeek}</h2>
      <div className="awards">
        <div className="box weekly-winner">
          <h3>
            <span className="emoji">💰</span> Weekly Winner{" "}
            <span className="username good">@{weeklyWinner.userName}</span>
          </h3>
          <div className="desc">(most points scored)</div>
          <div className="owner-block">
            <span className="stat">{weeklyWinner.matchupPoints} points</span>
          </div>
        </div>

        <div className="box">
          <h3>
            <span className="emoji">💩</span> Bust Team{" "}
            <span className="username bad">@{bustTeam.userName}</span>
          </h3>
          <div className="desc">(least points scored)</div>
          <div className="owner-block">
            <span className="stat">{bustTeam.matchupPoints} points</span>
          </div>
        </div>

        <div className="box">
          <h3>
            <span className="emoji">📈</span> Transaction King{" "}
            <span className="username good">@{transactionKing.userName}</span>
          </h3>
          <div className="desc">(most adds/drops)</div>
          <div className="owner-block">
            <span className="stat">
              {transactionKing.addDropCount} adds/drops
            </span>
          </div>
        </div>

        <div className="box">
          <h3>
            <span className="emoji">🤬</span> Worst Luck{" "}
            <span className="username bad">@{worstLuck.userName}</span>
          </h3>
          <div className="desc">(most points against)</div>
          <div className="owner-block">
            <span className="stat">{worstLuck.pointsAgainst} points</span>
          </div>
        </div>

        <div className="box">
          <h3>
            <span className="emoji">🔥</span> Best Manager{" "}
            <span className="username good">@{bestManager.userName}</span>
          </h3>
          <div className="desc">(highest % of possible points scored)</div>
          <div className="owner-block">
            <span className="stat">{bestManager.pointsPossiblePerc}%</span>
          </div>
        </div>

        <div className="box">
          <h3>
            <span className="emoji">🗑️</span> Worst Manager{" "}
            <span className="username bad">@{worstManager.userName}</span>
          </h3>
          <div className="desc">(lowest % of possible points scored)</div>
          <div className="owner-block">
            <span className="stat">{worstManager.pointsPossiblePerc}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
