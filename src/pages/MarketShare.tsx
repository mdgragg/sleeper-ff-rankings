import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import { LEAGUE_HISTORY, type SeasonLeague } from "../data/leagueHistory";
import logo from "/images/logo_with_text.png";

const CURRENT_LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;
const AVATAR_BASE = "https://sleepercdn.com/avatars/thumbs/";

interface PlayerHistory {
  player_id: string;
  playerName: string;
  seasons: string[]; // seasons this manager rostered this player
}

interface ManagerMarketShare {
  owner_id: string;
  name: string;
  avatar: string;
  totalSeasons: number; // how many seasons this manager has been in the league
  players: PlayerHistory[];
}

export default function MarketShare() {
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<ManagerMarketShare[]>([]);
  const [minSeasons, setMinSeasons] = useState(2);
  const [leagueName, setLeagueName] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const seasons: SeasonLeague[] = [
        ...LEAGUE_HISTORY,
        { season: "current", league_id: CURRENT_LEAGUE_ID },
      ];

      // player_id -> full_name, fetched once (large payload)
      const playersRes = await fetch(
        "https://api.sleeper.app/v1/players/nfl",
      ).then((r) => r.json());

      // owner_id -> { name, totalSeasons, players: { player_id -> seasons[] } }
      const byOwner: Record<
        string,
        {
          name: string;
          avatar: string;
          seasonsInLeague: Set<string>;
          players: Record<string, Set<string>>;
        }
      > = {};

      for (const { season, league_id } of seasons) {
        if (!league_id) continue;

        try {
          const [leagueRes, rostersRes, usersRes] = await Promise.all([
            fetch(`https://api.sleeper.app/v1/league/${league_id}`).then((r) =>
              r.json(),
            ),
            fetch(
              `https://api.sleeper.app/v1/league/${league_id}/rosters`,
            ).then((r) => r.json()),
            fetch(`https://api.sleeper.app/v1/league/${league_id}/users`).then(
              (r) => r.json(),
            ),
          ]);

          const seasonLabel = leagueRes?.season ?? season;
          if (league_id === CURRENT_LEAGUE_ID && leagueRes?.name) {
            setLeagueName(leagueRes.name);
          }

          rostersRes.forEach((roster: any) => {
            const user = usersRes.find(
              (u: any) => u.user_id === roster.owner_id,
            );
            const name = user?.display_name || "Unknown";
            const avatar =
              user?.metadata?.avatar ||
              (user?.avatar ? AVATAR_BASE + user.avatar : "");

            if (!byOwner[roster.owner_id]) {
              byOwner[roster.owner_id] = {
                name,
                avatar,
                seasonsInLeague: new Set(),
                players: {},
              };
            } else {
              byOwner[roster.owner_id].name = name;
              if (avatar) byOwner[roster.owner_id].avatar = avatar;
            }

            const ownerData = byOwner[roster.owner_id];
            ownerData.seasonsInLeague.add(seasonLabel);

            (roster.players ?? []).forEach((pid: string) => {
              if (!ownerData.players[pid]) ownerData.players[pid] = new Set();
              ownerData.players[pid].add(seasonLabel);
            });
          });
        } catch (err) {
          console.error(`Failed to load season ${season} (${league_id}):`, err);
        }
      }

      const result: ManagerMarketShare[] = Object.entries(byOwner).map(
        ([owner_id, data]) => ({
          owner_id,
          name: data.name,
          avatar: data.avatar,
          totalSeasons: data.seasonsInLeague.size,
          players: Object.entries(data.players)
            .map(([player_id, seasonSet]) => ({
              player_id,
              playerName:
                playersRes[player_id]?.full_name || `Player ${player_id}`,
              seasons: [...seasonSet].sort(),
            }))
            .sort((a, b) => b.seasons.length - a.seasons.length),
        }),
      );

      setManagers(result.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    };

    run();
  }, []);

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading market share data...</p>
      </div>
    );

  // Managers with nothing to show are hidden, so work the list out once
  // and drive both the jump links and the cards from it.
  const visibleManagers = managers
    .map((manager) => ({
      manager,
      filteredPlayers: manager.players.filter(
        (p) => p.seasons.length >= minSeasons,
      ),
    }))
    .filter(({ filteredPlayers }) => filteredPlayers.length > 0);

  return (
    <div className="body market-share-page">
      <NavDrawer />
      <header>
        <Link to="/">
          <img alt="logo" className="sleeper-logo" src={logo} />
        </Link>
        <h1>Market Share</h1>
        <h2>{leagueName ? `${leagueName} - ` : ""}Most Rostered Players</h2>
      </header>

      <div className="filter-row">
        <label>
          Show players rostered in at least{" "}
          <select
            value={minSeasons}
            onChange={(e) => setMinSeasons(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>{" "}
          season(s)
        </label>
      </div>

      <div className="avatar-buttons">
        {visibleManagers.map(({ manager }) => (
          <a
            key={manager.owner_id}
            href={`#owner-${manager.owner_id}`}
            title={manager.name}
          >
            <img
              alt={manager.name}
              src={manager.avatar}
              className="avatar-link"
            />
          </a>
        ))}
      </div>

      <div className="ms-grid">
        {visibleManagers.map(({ manager, filteredPlayers }) => {
          return (
            <section
              key={manager.owner_id}
              id={`owner-${manager.owner_id}`}
              className="panel ms-card"
            >
              {manager.avatar && (
                <img className="ms-avatar" src={manager.avatar} alt="" />
              )}
              <h2>{manager.name}</h2>
              <p className="panel-note">
                {filteredPlayers.length} player
                {filteredPlayers.length !== 1 ? "s" : ""} ·{" "}
                {manager.totalSeasons} season
                {manager.totalSeasons !== 1 ? "s" : ""} in league
              </p>
              <ul className="ms-player-list">
                {filteredPlayers.map((p) => (
                  <li key={p.player_id} className="ms-player">
                    <span className="ms-player-name">
                      {p.playerName}
                      <span className="ms-player-years">
                        {p.seasons.join(", ")}
                      </span>
                    </span>
                    <span className="ms-player-count">
                      {p.seasons.length}/{manager.totalSeasons}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
