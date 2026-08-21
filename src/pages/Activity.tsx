import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavDrawer from "../components/NavDrawer";
import { supabase } from "../lib/supabase";
import logo from "/images/logo_with_text.png";

const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID;

// Discord posts are mirrored into Supabase by scripts/sync-discord.mjs
// (see supabase/discord_posts.sql), so they render in the site's own
// styling rather than as an embedded Discord window.
//
// VITE_DISCORD_INVITE_CODE is the part after discord.gg/ in your invite
// link — optional, it just controls the join button.
const DISCORD_INVITE_CODE = import.meta.env.VITE_DISCORD_INVITE_CODE ?? "";

// Keep this below MESSAGE_LIMIT in the sync script — Discord's image URLs
// expire, and only the messages inside the sync window get refreshed.
const POST_LIMIT = 20;

// Scoop attaches a generated graphic to every post.
//   "lightbox" — a link that opens the graphic in a modal (default)
//   "inline"   — render it in the card
//   "hidden"   — text only
type ImageMode = "lightbox" | "inline" | "hidden";
const POST_IMAGE_MODE = "lightbox" as ImageMode;
const SHOW_POST_IMAGES = POST_IMAGE_MODE !== "hidden";

interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  image?: { url?: string };
  thumbnail?: { url?: string };
}

interface DiscordAttachment {
  id: string;
  url: string;
  filename: string;
  content_type?: string;
}

// Components V2 (message flag 32768). Only the subset Scoop uses:
// 17 container, 9 section, 10 text, 11 thumbnail, 12 media gallery,
// 14 separator. Buttons and selects are ignored — they do nothing here.
interface DiscordComponent {
  type: number;
  content?: string;
  components?: DiscordComponent[];
  items?: { media?: { url?: string }; description?: string | null }[];
  media?: { url?: string };
  accessory?: DiscordComponent;
}

interface DiscordPost {
  id: string;
  thread_name: string | null;
  components: DiscordComponent[] | null;
  author_name: string | null;
  author_avatar: string | null;
  content: string | null;
  embeds: DiscordEmbed[] | null;
  attachments: DiscordAttachment[] | null;
  posted_at: string;
}

interface DraftPickTrade {
  season: string;
  round: number;
  roster_id: number; // roster the pick originally belongs to
  previous_owner_id: number;
  owner_id: number; // roster receiving the pick
}

interface WaiverBudgetTrade {
  sender: number;
  receiver: number;
  amount: number;
}

interface TransactionItem {
  type: string;
  status: string;
  created: number;
  week: number;
  adds: Record<string, number> | null; // player_id -> roster_id
  drops: Record<string, number> | null;
  draft_picks: DraftPickTrade[] | null;
  waiver_budget: WaiverBudgetTrade[] | null;
  roster_ids: number[];
}

interface RosterInfo {
  roster_id: number;
  teamName: string;
}

// "Ai Schefter" -> "author-ai-schefter", so each Scoop persona can be
// themed in index.css.
function authorClass(name: string | null) {
  if (!name) return "";
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `author-${slug}` : "";
}

// Discord's **bold** is the only markup Scoop's posts rely on.
function renderMarkdown(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

// Either the image itself or a link that opens it in the lightbox.
function PostImage({
  url,
  alt,
  onOpen,
}: {
  url: string;
  alt?: string;
  onOpen: (url: string) => void;
}) {
  if (POST_IMAGE_MODE === "hidden") return null;
  if (POST_IMAGE_MODE === "inline")
    return <img className="discord-image" src={url} alt={alt ?? ""} />;

  return (
    <button
      type="button"
      className="discord-image-link"
      onClick={() => onOpen(url)}
    >
      View graphic
    </button>
  );
}

function DiscordComponents({
  nodes,
  onOpenImage,
}: {
  nodes: DiscordComponent[];
  onOpenImage: (url: string) => void;
}) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 17: // container
          case 9: // section
            return (
              <div key={i} className="discord-card">
                <DiscordComponents
                  nodes={node.components ?? []}
                  onOpenImage={onOpenImage}
                />
                {node.accessory?.media?.url && (
                  <PostImage
                    url={node.accessory.media.url}
                    onOpen={onOpenImage}
                  />
                )}
              </div>
            );
          case 10: // text display
            return (
              <p key={i} className="discord-text">
                {renderMarkdown(node.content ?? "")}
              </p>
            );
          case 11: // thumbnail
            return node.media?.url ? (
              <PostImage key={i} url={node.media.url} onOpen={onOpenImage} />
            ) : null;
          case 12: // media gallery
            return !SHOW_POST_IMAGES ? null : (
              <div key={i} className="discord-gallery">
                {(node.items ?? []).map((item, j) =>
                  item.media?.url ? (
                    <PostImage
                      key={j}
                      url={item.media.url}
                      alt={item.description ?? ""}
                      onOpen={onOpenImage}
                    />
                  ) : null,
                )}
              </div>
            );
          case 14: // separator
            return <hr key={i} className="discord-separator" />;
          default:
            return null;
        }
      })}
    </>
  );
}

function ordinal(n: number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

export default function Activity() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [rosters, setRosters] = useState<RosterInfo[]>([]);
  const [players, setPlayers] = useState<Record<string, any>>({});
  const [leagueName, setLeagueName] = useState("");
  const [discordPosts, setDiscordPosts] = useState<DiscordPost[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Escape closes the lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // Loaded separately so a missing table or empty feed never blocks the
  // transactions list.
  useEffect(() => {
    supabase
      .from("discord_posts")
      .select("*")
      .order("posted_at", { ascending: false })
      .limit(POST_LIMIT)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load Discord posts:", error.message);
          return;
        }
        setDiscordPosts(data ?? []);
      });
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const [leagueRes, rostersRes, usersRes, playersRes] = await Promise.all([
        fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}`).then((r) =>
          r.json(),
        ),
        fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`).then(
          (r) => r.json(),
        ),
        fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`).then(
          (r) => r.json(),
        ),
        fetch("https://api.sleeper.app/v1/players/nfl").then((r) => r.json()),
      ]);

      const rosterInfo: RosterInfo[] = rostersRes.map((roster: any) => {
        const user = usersRes.find((u: any) => u.user_id === roster.owner_id);
        return {
          roster_id: roster.roster_id,
          teamName:
            user?.metadata?.team_name || user?.display_name || "Unknown",
        };
      });

      if (leagueRes?.name) setLeagueName(leagueRes.name);

      const currentWeek = leagueRes.settings?.leg ?? 1;

      let allTx: TransactionItem[] = [];
      for (let w = 1; w <= currentWeek; w++) {
        const txRes = await fetch(
          `https://api.sleeper.app/v1/league/${LEAGUE_ID}/transactions/${w}`,
        ).then((r) => r.json());
        if (Array.isArray(txRes)) allTx = allTx.concat(txRes);
      }

      allTx.sort((a, b) => b.created - a.created);

      setRosters(rosterInfo);
      setPlayers(playersRes);
      setTransactions(allTx);
      setLoading(false);
    };

    run();
  }, []);

  const teamName = (roster_id: number) =>
    rosters.find((r) => r.roster_id === roster_id)?.teamName ?? "Unknown";

  const playerName = (player_id: string) =>
    players[player_id]?.full_name ?? player_id;

  const renderTransaction = (tx: TransactionItem, idx: number) => {
    const date = new Date(tx.created).toLocaleDateString();

    if (tx.type === "trade") {
      return (
        <li key={idx} className="tx-item tx-trade">
          <span className="tx-label">Trade</span>
          <span className="tx-date">{date}</span>
          <div className="trade-sides">
            {tx.roster_ids.map((rid) => {
              // Everything this roster ended up with in the deal
              const gets = [
                ...Object.entries(tx.adds ?? {})
                  .filter(([, toRoster]) => toRoster === rid)
                  .map(([pid]) => playerName(pid)),
                ...(tx.draft_picks ?? [])
                  .filter((p) => p.owner_id === rid)
                  .map(
                    (p) =>
                      `${p.season} ${ordinal(p.round)} Round Pick` +
                      (p.roster_id !== rid
                        ? ` (${teamName(p.roster_id)})`
                        : ""),
                  ),
                ...(tx.waiver_budget ?? [])
                  .filter((w) => w.receiver === rid)
                  .map((w) => `$${w.amount} FAAB`),
              ];

              return (
                <div key={rid} className="trade-side">
                  <span className="trade-team">{teamName(rid)}</span>
                  <ul className="trade-gets">
                    {gets.length ? (
                      gets.map((g, i) => <li key={i}>{g}</li>)
                    ) : (
                      <li className="trade-nothing">Nothing</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </li>
      );
    }

    const adds = tx.adds ? Object.entries(tx.adds) : [];
    const drops = tx.drops ? Object.entries(tx.drops) : [];

    return (
      <li
        key={idx}
        className={`tx-item ${tx.type === "waiver" ? "tx-waiver" : "tx-free-agent"}`}
      >
        <span className="tx-label">
          {tx.type === "waiver" ? "Waiver" : "Free Agent"}
        </span>
        <span className="tx-date">{date}</span>
        <span className="tx-moves">
          {adds.map(([pid, rid]) => (
            <span key={`add-${pid}`} className="tx-add">
              + {playerName(pid)}{" "}
              <span className="tx-team">{teamName(rid)}</span>
            </span>
          ))}
          {drops.map(([pid, rid]) => (
            <span key={`drop-${pid}`} className="tx-drop">
              &minus; {playerName(pid)}{" "}
              <span className="tx-team">{teamName(rid)}</span>
            </span>
          ))}
        </span>
      </li>
    );
  };

  if (loading)
    return (
      <div className="full-screen-loading">
        <div className="loading-bar">
          <div className="loading-bar-progress"></div>
        </div>
        <p>Loading activity...</p>
      </div>
    );

  return (
    <div className="body activity-page">
      <NavDrawer />
      <header>
        <Link to="/">
          <img alt="logo" className="sleeper-logo" src={logo} />
        </Link>
        <h1>League Activity</h1>
        <h2>{leagueName || "Trades, Waivers & Free Agents"}</h2>
      </header>

      <section className="panel discord-section">
        <span className="emoji">💬</span>
        <h2>Ai League Reporters</h2>
        <div className="scroll-container">
          {discordPosts.length === 0 ? (
            <p className="panel-note">
              Nothing posted yet. Once the sync job runs, posts from the league
              channel show up here.
            </p>
          ) : (
            <ul className="discord-feed">
              {discordPosts.map((post) => (
                <li
                  key={post.id}
                  className={`discord-post ${authorClass(post.author_name)}`}
                >
                  {post.author_avatar && (
                    <img
                      className="discord-avatar"
                      src={post.author_avatar}
                      alt=""
                    />
                  )}
                  <div className="discord-body">
                    <div className="discord-head">
                      <span className="discord-author">{post.author_name}</span>
                      <span className="discord-date">
                        {new Date(post.posted_at).toLocaleString()}
                      </span>
                    </div>

                    {post.thread_name && (
                      <h3 className="discord-headline">{post.thread_name}</h3>
                    )}

                    {post.content && (
                      <p className="discord-text">
                        {renderMarkdown(post.content)}
                      </p>
                    )}

                    <DiscordComponents
                      nodes={post.components ?? []}
                      onOpenImage={setLightbox}
                    />

                    {(post.embeds ?? []).map((embed, i) => {
                      const image = embed.image?.url || embed.thumbnail?.url;
                      return (
                        <div key={i} className="discord-card">
                          {embed.title && (
                            <h3 className="discord-card-title">
                              {embed.title}
                            </h3>
                          )}
                          {embed.description && (
                            <p className="discord-text">{embed.description}</p>
                          )}
                          {image && (
                            <PostImage url={image} onOpen={setLightbox} />
                          )}
                        </div>
                      );
                    })}

                    {(post.attachments ?? [])
                      .filter((a) => a.content_type?.startsWith("image/"))
                      .map((a) => (
                        <PostImage
                          key={a.id}
                          url={a.url}
                          alt={a.filename}
                          onOpen={setLightbox}
                        />
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* {DISCORD_INVITE_CODE && (
          <a
            href={`https://discord.gg/${DISCORD_INVITE_CODE}`}
            target="_blank"
            rel="noreferrer"
            className="discord-invite-btn"
          >
            Join our Discord
          </a>
        )} */}
      </section>

      <section className="panel transactions-section">
        <span className="emoji">🔄</span>
        <div className="scroll-container">
          <h2>
            Transactions{" "}
            <span className="panel-count">({transactions.length})</span>
          </h2>
          {transactions.length === 0 ? (
            <p className="tx-empty">No transactions yet this season.</p>
          ) : (
            <ul className="tx-list">
              {transactions.map((tx, idx) => renderTransaction(tx, idx))}
            </ul>
          )}
        </div>
      </section>

      {lightbox && (
        <div className="modal-overlay" onClick={() => setLightbox(null)}>
          <div
            className="modal-content lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-button"
              aria-label="Close"
              onClick={() => setLightbox(null)}
            >
              &times;
            </button>
            <img className="lightbox-image" src={lightbox} alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
