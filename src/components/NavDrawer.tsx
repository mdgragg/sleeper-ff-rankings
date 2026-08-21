import { useState } from "react";
import { Link } from "react-router-dom";
import { useLeague } from "../features/league/hooks";

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;

export default function NavDrawer() {
  const [open, setOpen] = useState(false);

  // Cached + deduped by react-query, so this is free on pages that
  // already load the league.
  const { data: league } = useLeague(LEAGUE_ID);
  const currentWeek = league?.settings?.leg ?? 1;

  const navLinks = [
    { to: `/week/${currentWeek}`, label: "Power Rankings" },
    { to: "/history", label: "History / Record Book" },
    { to: "/market-share", label: "Market Share" },
    { to: "/activity", label: "Activity" },
  ];

  return (
    <>
      <button
        className="nav-toggle"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div
          className="nav-overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className={`nav-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <button
          className="nav-close"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          &times;
        </button>
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
