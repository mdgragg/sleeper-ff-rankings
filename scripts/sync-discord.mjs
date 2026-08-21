#!/usr/bin/env node
// Pulls the most recent messages from a Discord channel into Supabase so
// the Activity page can render them in the site's own styling.
//
// Bot setup (Developer Portal):
//   1. Bot -> Privileged Gateway Intents -> enable MESSAGE CONTENT INTENT.
//      Without it Discord returns empty content/embeds/attachments, even
//      over REST, so every synced row comes back blank.
//   2. Invite with the `bot` scope plus View Channel + Read Message
//      History (permissions=66560). The invite uses the Application ID,
//      not the token.
//
// Env:
//   DISCORD_BOT_TOKEN          bot token (Developer Portal -> Bot -> Reset Token)
//   DISCORD_CHANNEL_ID         channel to mirror
//   SUPABASE_URL               same project as the site
//   SUPABASE_SERVICE_ROLE_KEY  service role key — NEVER put this in .env,
//                              it bypasses row level security
//   DISCORD_AUTHOR_ID          optional, only keep messages from this user
//                              (e.g. the Scoop bot) instead of the whole channel
//   MESSAGE_LIMIT              optional, defaults to 50 (Discord max is 100)
//
// Discord's CDN links for attachments and embed images are signed and
// expire after roughly a day. Re-upserting the newest MESSAGE_LIMIT
// messages on every run refreshes those URLs, so keep the number of posts
// shown on the site below MESSAGE_LIMIT or older images will 404.

import { createClient } from "@supabase/supabase-js";

const {
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  DISCORD_AUTHOR_ID,
  MESSAGE_LIMIT = "50",
} = process.env;

const required = {
  DISCORD_BOT_TOKEN,
  DISCORD_CHANNEL_ID,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};

for (const [name, value] of Object.entries(required)) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
}

const headers = { Authorization: `Bot ${DISCORD_BOT_TOKEN}` };

async function discord(path) {
  const res = await fetch(`https://discord.com/api/v10${path}`, { headers });
  if (!res.ok) {
    const body = await res.text();
    // 403 here almost always means the bot can't View Channel / Read
    // Message History on that specific channel.
    throw new Error(`Discord API ${res.status} on ${path}: ${body}`);
  }
  return res.json();
}

// Forum and media channels hold threads rather than messages, and each
// thread is one post. Scoop posts into a forum (#league-feed), so without
// this the sync would quietly find nothing.
const FORUM_TYPES = [15, 16];

async function collectMessages(channelId) {
  const channel = await discord(`/channels/${channelId}`);

  if (!FORUM_TYPES.includes(channel.type)) {
    const messages = await discord(
      `/channels/${channelId}/messages?limit=${MESSAGE_LIMIT}`,
    );
    return messages.map((m) => ({ message: m, threadName: null }));
  }

  const active = await discord(`/guilds/${channel.guild_id}/threads/active`);
  const archived = await discord(
    `/channels/${channelId}/threads/archived/public?limit=${MESSAGE_LIMIT}`,
  );

  const threads = [
    ...active.threads.filter((t) => t.parent_id === channelId),
    ...archived.threads,
  ];

  const collected = [];
  for (const thread of threads) {
    // The thread name is the post's headline, and it only lives on the
    // thread, not on any message inside it.
    const messages = await discord(
      `/channels/${thread.id}/messages?limit=${MESSAGE_LIMIT}`,
    );
    for (const message of messages) {
      collected.push({ message, threadName: thread.name });
    }
  }
  return collected;
}

const channelIds = DISCORD_CHANNEL_ID.split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const collected = [];
for (const channelId of channelIds) {
  try {
    const items = await collectMessages(channelId);
    console.log(`  ${channelId}: ${items.length} message(s)`);
    collected.push(...items.map((item) => ({ ...item, channelId })));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

const rows = collected
  .filter(
    ({ message }) =>
      !DISCORD_AUTHOR_ID || message.author?.id === DISCORD_AUTHOR_ID,
  )
  // Skip joins/pins/etc — type 0 is a normal message, 19 is a reply
  .filter(({ message }) => message.type === 0 || message.type === 19)
  .map(({ message: m, threadName, channelId }) => ({
    id: m.id,
    channel_id: channelId,
    thread_name: threadName,
    author_name: m.author?.global_name || m.author?.username || "Unknown",
    author_avatar: m.author?.avatar
      ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png?size=64`
      : null,
    author_is_bot: Boolean(m.author?.bot),
    content: m.content ?? "",
    embeds: m.embeds ?? [],
    attachments: m.attachments ?? [],
    // Components V2 messages (flag 32768) carry their text and images
    // here instead of in content/embeds/attachments.
    components: m.components ?? [],
    posted_at: m.timestamp,
    synced_at: new Date().toISOString(),
  }));

if (rows.length === 0) {
  console.log("No messages to sync.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error } = await supabase
  .from("discord_posts")
  .upsert(rows, { onConflict: "id" });

if (error) {
  console.error("Supabase upsert failed:", error.message);
  process.exit(1);
}

console.log(
  `Synced ${rows.length} messages from ${channelIds.length} channel(s)`,
);
