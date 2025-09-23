import { useState } from "react";
import type { Owner, OwnerWithRanks } from "../types";

interface TeamCardProps {
  owner: OwnerWithRanks;
  idx: number;
  owners: OwnerWithRanks[];
  weeklyExtras: Record<
    number,
    { blurb?: string; image?: string; gif?: string }
  >;
  currentWeek: number;
  matchups: Record<string, Owner[]>;
  nextMatchups: Record<string, Owner[]>;
  previousChampsByOwner: Record<string, string>;
  currentChampRosterId: number;
}

export default function TeamCard({
  owner,
  owners,
  idx,
  weeklyExtras,
  matchups,
  nextMatchups,
  previousChampsByOwner,
  currentChampRosterId,
}: TeamCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const extras = weeklyExtras[owner.roster_id] || {};
  const nextOpp =
    nextMatchups[owner.nextMatchupID || ""]?.filter(
      (o) => o.roster_id !== owner.roster_id
    ) ?? [];

  const avatarUrl =
    owner.teamAvatar ||
    (owner.avatar
      ? `https://sleepercdn.com/avatars/thumbs/${owner.avatar}`
      : "");

  const streakClass = owner.streak?.trim().endsWith("W")
    ? "wins"
    : owner.streak?.trim().endsWith("L")
      ? "losses"
      : "";

  function getOrdinal(n: number) {
    if (n % 100 >= 11 && n % 100 <= 13) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  function isTied(
    owners: OwnerWithRanks[],
    key: keyof OwnerWithRanks,
    ownerID: string
  ) {
    const value = owners.find((o) => o.ownerID === ownerID)?.[key];
    return owners.filter((o) => o[key] === value).length > 1;
  }

  return (
    <>
      <li
        data-place={idx + 1}
        id={owner.userName}
        className={`container-${idx} container ${
          owner.isWeeklyWinner ? "weekly-winner" : ""
        }`}
      >
        <span
          className={`ranking ${owner.isWeeklyWinner ? "weekly-winner-rank" : ""}`}
        >
          {idx + 1}
        </span>{" "}
        <img
          alt="team avatar"
          src={avatarUrl}
          className={`avatar-${idx} avatar ${
            owner.isWeeklyWinner ? "weekly-winner-circle" : ""
          }`}
          onClick={() => setModalOpen(true)}
          style={{ cursor: "pointer" }}
        />
        <div className="name-desc">
          <h3>
            {owner.teamName} ({owner.wins}-{owner.losses}
            {owner.ties ? `-${owner.ties}` : ""}){" "}
            <span className={`streak ${streakClass}`}>{owner.streak}</span>
          </h3>
          <span className="owner-name">@{owner.userName}</span>

          {extras.image && <img src={extras.image} alt="team" />}
          {extras.gif && <iframe src={extras.gif} title="team gif"></iframe>}

          <p className="team-blurb">{extras.blurb || ""}</p>
        </div>
        <div
          className={`bottom ${
            owner.roster_id === currentChampRosterId ||
            previousChampsByOwner[owner.ownerID]
              ? "champ-matchup"
              : ""
          }`}
        >
          <p>
            <span className="matchup">
              Last Week:{" "}
              <b>
                {matchups[owner.matchupID || ""]?.length === 2
                  ? (() => {
                      const [teamA, teamB] = matchups[owner.matchupID || ""];
                      const isCurrentOwnerA =
                        teamA.roster_id === owner.roster_id;
                      const self = isCurrentOwnerA ? teamA : teamB;
                      const opp = isCurrentOwnerA ? teamB : teamA;

                      let result = "—";
                      if (
                        self.matchupPoints != null &&
                        opp.matchupPoints != null
                      ) {
                        if (self.matchupPoints > opp.matchupPoints)
                          result = "Win";
                        else if (self.matchupPoints < opp.matchupPoints)
                          result = "Loss";
                        else result = "Tie";
                      }

                      return `${result} vs @${opp.userName} (${
                        self.matchupPoints?.toFixed(2) ?? "—"
                      }-${opp.matchupPoints?.toFixed(2) ?? "—"})`;
                    })()
                  : "—"}
              </b>{" "}
              {"    "}| {"    "} Next Week:{" "}
              <b>
                {nextOpp.length
                  ? nextOpp.map((o) => `@${o.userName}`).join(", ")
                  : "—"}
              </b>
            </span>
            <span
              className={`previous-champ ${
                owner.roster_id === currentChampRosterId ? "current-champ" : ""
              }`}
            >
              {previousChampsByOwner[owner.ownerID] || ""}
            </span>
          </p>
        </div>
      </li>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-button"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <img src={avatarUrl} alt="team avatar" className="modal-avatar" />
            <h2>
              {owner.teamName}{" "}
              <span className="owner-name">(@{owner.userName})</span>
            </h2>

            <p className="mvp">
              <b> Week MVP: </b>
              {owner.topScorerWeek} (
              {owner.topScorerWeekPoints?.toFixed(2) ?? "0"})
            </p>

            <p className="bench-mvp">
              <b> Bench MVP: </b>
              {owner.topBenchWeek} (
              {owner.topBenchWeekPoints?.toFixed(2) ?? "0"})
            </p>

            <h3>Season Totals</h3>
            <p>
              <b> Top Scorer: </b>
              {owner.topScorerSeason} (
              {owner.topScorerSeasonPoints?.toFixed(2) ?? "0"})
            </p>
            <p>
              <b> Total Points: </b>
              {owner.pointsFor.toFixed(2)}{" "}
              <span className={owner.ranks.pointsForRank <= 6 ? "good" : "bad"}>
                ({isTied(owners, "pointsFor", owner.ownerID) ? "Tied-" : ""}
                {owner.ranks.pointsForRank}
                {getOrdinal(owner.ranks.pointsForRank)})
              </span>
            </p>

            <p>
              <b> Points Against: </b>
              {owner.pointsAgainst.toFixed(2)}{" "}
              <span
                className={owner.ranks.pointsAgainstRank <= 6 ? "good" : "bad"}
              >
                ({isTied(owners, "pointsAgainst", owner.ownerID) ? "Tied-" : ""}
                {owner.ranks.pointsAgainstRank}
                {getOrdinal(owner.ranks.pointsAgainstRank)})
              </span>
            </p>

            <p>
              <b> Possible Points: </b>
              {owner.pointsPossible.toFixed(2)}{" "}
              <span
                className={owner.ranks.pointsPossibleRank <= 6 ? "good" : "bad"}
              >
                (
                {isTied(owners, "pointsPossible", owner.ownerID) ? "Tied-" : ""}
                {owner.ranks.pointsPossibleRank}
                {getOrdinal(owner.ranks.pointsPossibleRank)})
              </span>
            </p>

            <p>
              <b> % of Possible Points: </b>
              {owner.pointsPossiblePerc.toFixed(2)}%{" "}
              <span
                className={
                  owner.ranks.pointsPossiblePercRank <= 6 ? "good" : "bad"
                }
              >
                (
                {isTied(owners, "pointsPossiblePerc", owner.ownerID)
                  ? "Tied-"
                  : ""}
                {owner.ranks.pointsPossiblePercRank}
                {getOrdinal(owner.ranks.pointsPossiblePercRank)})
              </span>
            </p>

            <p>
              <b> Adds/Drops: </b>
              {owner.addDropCount}{" "}
              <span className={owner.ranks.addDropRank <= 6 ? "good" : "bad"}>
                ({isTied(owners, "addDropCount", owner.ownerID) ? "Tied-" : ""}
                {owner.ranks.addDropRank}
                {getOrdinal(owner.ranks.addDropRank)})
              </span>
            </p>

            <p>
              <b> Trades: </b>
              {owner.TradeCount}{" "}
              <span className={owner.ranks.tradeRank <= 6 ? "good" : "bad"}>
                ({isTied(owners, "TradeCount", owner.ownerID) ? "Tied-" : ""}
                {owner.ranks.tradeRank}
                {getOrdinal(owner.ranks.tradeRank)})
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
