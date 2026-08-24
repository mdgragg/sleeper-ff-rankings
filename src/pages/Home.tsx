import { Link } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import { useLeague } from "../features/league/hooks";
import logo from "/images/logo_with_text.png";

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;

export default function Home() {
  const { data: league } = useLeague(LEAGUE_ID);
  const currentWeek = league?.settings?.leg ?? 1;

  const pages = [
    {
      to: `/week/${currentWeek}`,
      emoji: "🏈",
      title: "Power Rankings",
      desc: "Weekly rankings, matchups and awards",
    },
    {
      to: "/history",
      emoji: "🏆",
      title: "History / Record Book",
      desc: "All-time records, hall of fame and shame",
    },
    {
      to: "/market-share",
      emoji: "📈",
      title: "Market Share",
      desc: "Who keeps rostering the same players",
    },
    {
      to: "/activity",
      emoji: "🔄",
      title: "League Activity",
      desc: "Ai Reporters and transactions",
    },
  ];

  return (
    <div className="body home-page">
      <NavDrawer />
      <header>
        <img alt="logo" className="sleeper-logo" src={logo} />
        <h1>{league?.name || "Fantasy Football"}</h1>
        {/* <h2>
          {league?.season ? `${league.season} Season` : " "}
          {league?.settings?.leg ? ` - Week ${currentWeek}` : ""}
        </h2> */}
      </header>

      <nav className="home-links">
        {pages.map((page) => (
          <Link key={page.to} to={page.to} className="home-link">
            <span className="emoji">{page.emoji}</span>
            <span className="home-link-title">{page.title}</span>
            <span className="home-link-desc">{page.desc}</span>
          </Link>
        ))}
      </nav>

      <p className="home-footer">
        <Link to="/update">Update weekly blurbs</Link>
      </p>
    </div>
  );
}
