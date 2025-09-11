import { useQuery } from "@tanstack/react-query";

const leagueId = import.meta.env.VITE_LEAGUE_ID;

const fetchTransactions = async () => {
  const res = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/transactions/1`
  );
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

export default function Awards() {
  const {
    data: transactions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  if (isLoading) return <div>Loading awards...</div>;
  if (error) return <div>Error loading awards</div>;

  return (
    <div>
      <h2>Weekly Awards</h2>
      <p>Transaction King: {transactions.length} moves this week</p>

      <div id="awards">
        <h2>Season Awards</h2>
        <div className="awards">
          <div className="box weekly-winner">
            <h3>
              <span className="emoji" role="img" aria-label="">
                💰
              </span>{" "}
              Most Points{" "}
              <span className="username good"> @{highPF.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{highPF.pointsFor} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                💩
              </span>
              Least Points{" "}
              <span className="username bad">@{lowPF.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{lowPF.pointsFor} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                🌸
              </span>
              Best Luck <span className="username good">@{lowPA.userName}</span>
            </h3>
            <div className="desc">(least points against)</div>
            <div className="owner-block">
              <span className="stat">{lowPA.pointsAgainst} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                🧐
              </span>
              Worst Luck{" "}
              <span className="username bad">@{highPA.userName}</span>
            </h3>
            <div className="desc">(most points against)</div>
            <div className="owner-block">
              <span className="stat">{highPA.pointsAgainst} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                🔥
              </span>
              Best Manager{" "}
              <span className="username good"> @{highPPP.userName}</span>
            </h3>
            <div className="desc">
              (highest percentage of possible points scored)
            </div>
            <div className="owner-block">
              <span className="stat">{highPPP.pointsPossiblePerc}%</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji" role="img" aria-label="">
                🤔
              </span>
              Worst Manager{" "}
              <span className="username bad">@{lowPPP.userName}</span>
            </h3>
            <div className="desc">
              (lowest percentage of possible points scored)
            </div>
            <div className="owner-block">
              <span className="stat">{lowPPP.pointsPossiblePerc}%</span>
            </div>
          </div>

          {/* New weekly awards */}
          <div className="box">
            <h3>
              <span className="emoji">💥</span> Boom Team{" "}
              <span className="username good">@{boomTeam.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{boomTeam.matchupPoints} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji">💀</span> Bust Team{" "}
              <span className="username bad">@{bustTeam.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{bustTeam.matchupPoints} points</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji">📈</span> Transaction King{" "}
              <span className="username good">@{transactionKing.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">
                {transactionKing.addDropCount} adds/drops
              </span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji">🤝</span> Trade Machine{" "}
              <span className="username good">@{tradeMachine.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{tradeMachine.TradeCount} trades</span>
            </div>
          </div>

          <div className="box">
            <h3>
              <span className="emoji">🔥</span> Longest Win Streak{" "}
              <span className="username good">@{longestStreak.userName}</span>
            </h3>
            <div className="owner-block">
              <span className="stat">{longestStreak.streak}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
