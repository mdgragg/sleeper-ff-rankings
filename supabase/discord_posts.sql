-- Mirror of a Discord channel (Scoop's posts) so the Activity page can
-- render them natively instead of embedding Discord.
--
-- Run this once in the Supabase SQL editor.
--
-- Writes come from scripts/sync-discord.mjs using the SERVICE ROLE key,
-- which bypasses RLS. The site only ever reads, using the anon key.

create table if not exists discord_posts (
  id text primary key, -- discord message id
  channel_id text not null,
  author_name text,
  author_avatar text,
  author_is_bot boolean not null default false,
  content text,
  embeds jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  posted_at timestamptz not null,
  synced_at timestamptz not null default now()
);

-- Forum posts (Scoop's #league-feed) carry their headline as the thread
-- name. Safe to re-run if you already created the table above.
alter table discord_posts
  add column if not exists thread_name text;

-- Messages sent with the Components V2 flag (32768) have empty content,
-- embeds and attachments — the text and images live in components
-- instead. Scoop posts this way, so the feed is blank without it.
alter table discord_posts
  add column if not exists components jsonb not null default '[]'::jsonb;

create index if not exists discord_posts_posted_at_idx
  on discord_posts (posted_at desc);

alter table discord_posts enable row level security;

drop policy if exists "discord_posts public read" on discord_posts;
create policy "discord_posts public read"
  on discord_posts for select
  to anon
  using (true);
