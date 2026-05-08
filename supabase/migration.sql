-- ============================================================
--  Ciycle — Full Database Migration
--  Supabase SQL Editor'a yapıştır ve çalıştır
--  dashboard.supabase.com → SQL Editor → New query
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── Enum Types ──────────────────────────────────────────────
create type vehicle_type      as enum ('motorcycle', 'bicycle', 'both');
create type subscription_tier as enum ('free', 'premium', 'pro');
create type user_role         as enum ('user', 'moderator', 'admin');
create type road_type         as enum ('asphalt', 'gravel', 'offroad', 'mixed');
create type difficulty_level  as enum ('easy', 'moderate', 'hard', 'expert');
create type route_visibility  as enum ('public', 'private', 'club_only');
create type post_type         as enum ('text', 'image', 'video', 'route_share', 'event_share');
create type event_status      as enum ('draft', 'published', 'ongoing', 'completed', 'cancelled');
create type event_visibility  as enum ('public', 'private', 'invite_only');
create type event_rsvp        as enum ('going', 'maybe', 'not_going');
create type club_visibility   as enum ('public', 'private', 'invite_only');
create type club_role         as enum ('founder', 'admin', 'moderator', 'ride_captain', 'member');
create type conversation_type as enum ('direct', 'group');
create type message_type      as enum ('text', 'image', 'voice', 'location', 'route_share');
create type notification_type as enum (
  'like', 'comment', 'reply', 'follow', 'mention',
  'event_invite', 'club_invite', 'route_share', 'achievement'
);


-- ============================================================
--  TABLES  (referans sırasına göre: önce bağımsız tablolar)
-- ============================================================

-- ─── 1. profiles ─────────────────────────────────────────────
create table profiles (
  id                uuid              primary key references auth.users(id) on delete cascade,
  username          text              unique not null,
  full_name         text              not null,
  avatar_url        text,
  cover_url         text,
  bio               text,
  location          text,
  website           text,
  vehicle_type      vehicle_type      not null default 'motorcycle',
  subscription_tier subscription_tier not null default 'free',
  role              user_role         not null default 'user',
  xp                integer           not null default 0,
  level             integer           not null default 1,
  is_verified       boolean           not null default false,
  is_private        boolean           not null default false,
  followers_count   integer           not null default 0,
  following_count   integer           not null default 0,
  posts_count       integer           not null default 0,
  routes_count      integer           not null default 0,
  total_distance_km float             not null default 0,
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now(),
  constraint username_length  check (char_length(username)  between 3 and 30),
  constraint username_format  check (username ~ '^[a-z0-9_]+$'),
  constraint full_name_length check (char_length(full_name) between 2 and 80),
  constraint bio_length       check (bio is null or char_length(bio) <= 300),
  constraint website_format   check (website is null or website ~ '^https?://')
);

create index profiles_username_idx        on profiles (username);
create index profiles_followers_count_idx on profiles (followers_count desc);
create index profiles_xp_idx              on profiles (xp desc);
create index profiles_vehicle_type_idx    on profiles (vehicle_type);
create index profiles_search_idx          on profiles using gin (
  to_tsvector('simple', coalesce(full_name,'') || ' ' || coalesce(username,''))
);

-- ─── 2. follows ──────────────────────────────────────────────
create table follows (
  follower_id  uuid        not null references profiles(id) on delete cascade,
  following_id uuid        not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index follows_following_id_idx on follows (following_id);

-- ─── 3. clubs ────────────────────────────────────────────────
create table clubs (
  id           uuid            primary key default uuid_generate_v4(),
  founder_id   uuid            not null references profiles(id) on delete cascade,
  name         text            not null,
  slug         text            unique not null,
  description  text,
  avatar_url   text,
  cover_url    text,
  location     text,
  vehicle_type vehicle_type    not null default 'motorcycle',
  visibility   club_visibility not null default 'public',
  member_count integer         not null default 0,
  post_count   integer         not null default 0,
  route_count  integer         not null default 0,
  created_at   timestamptz     not null default now(),
  constraint name_length check (char_length(name) between 3 and 50),
  constraint slug_format check (slug ~ '^[a-z0-9-]+$')
);

create index clubs_slug_idx         on clubs (slug);
create index clubs_member_count_idx on clubs (member_count desc);
create index clubs_vehicle_type_idx on clubs (vehicle_type);
create index clubs_search_idx       on clubs using gin (
  to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(description,''))
);

-- ─── 4. club_members ─────────────────────────────────────────
create table club_members (
  user_id   uuid        not null references profiles(id) on delete cascade,
  club_id   uuid        not null references clubs(id)    on delete cascade,
  role      club_role   not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (user_id, club_id)
);

create index club_members_club_id_idx on club_members (club_id);

-- ─── 5. routes ───────────────────────────────────────────────
create table routes (
  id                uuid             primary key default uuid_generate_v4(),
  author_id         uuid             not null references profiles(id) on delete cascade,
  title             text             not null,
  description       text,
  road_type         road_type        not null default 'asphalt',
  difficulty        difficulty_level not null default 'moderate',
  visibility        route_visibility not null default 'public',
  stats             jsonb            not null default '{}',
  waypoints         jsonb            not null default '[]',
  elevation_profile jsonb            not null default '[]',
  gpx_url           text,
  cover_image_url   text,
  tags              text[]           not null default '{}',
  start_location    jsonb            not null default '{}',
  end_location      jsonb            not null default '{}',
  bbox              float[]          not null default '{}',
  likes_count       integer          not null default 0,
  saves_count       integer          not null default 0,
  rides_count       integer          not null default 0,
  comments_count    integer          not null default 0,
  club_id           uuid             references clubs(id) on delete set null,
  created_at        timestamptz      not null default now(),
  updated_at        timestamptz      not null default now(),
  constraint title_length check (char_length(title) between 3 and 120)
);

create index routes_author_id_idx  on routes (author_id);
create index routes_created_at_idx on routes (created_at desc);
create index routes_road_type_idx  on routes (road_type);
create index routes_difficulty_idx on routes (difficulty);
create index routes_tags_idx       on routes using gin (tags);

-- ─── 6. events ───────────────────────────────────────────────
create table events (
  id                 uuid             primary key default uuid_generate_v4(),
  organizer_id       uuid             not null references profiles(id) on delete cascade,
  club_id            uuid             references clubs(id)  on delete set null,
  title              text             not null,
  description        text             not null,
  cover_image_url    text,
  start_at           timestamptz      not null,
  end_at             timestamptz,
  location_name      text             not null,
  location           jsonb            not null default '{}',
  route_id           uuid             references routes(id) on delete set null,
  max_participants   integer,
  participants_count integer          not null default 0,
  status             event_status     not null default 'published',
  visibility         event_visibility not null default 'public',
  tags               text[]           not null default '{}',
  created_at         timestamptz      not null default now(),
  constraint title_length    check (char_length(title) between 3 and 120),
  constraint end_after_start check (end_at is null or end_at > start_at)
);

create index events_organizer_id_idx on events (organizer_id);
create index events_start_at_idx     on events (start_at);
create index events_status_idx       on events (status);
create index events_club_id_idx      on events (club_id);
create index events_tags_idx         on events using gin (tags);

-- ─── 7. event_participants ───────────────────────────────────
create table event_participants (
  event_id  uuid        not null references events(id)  on delete cascade,
  user_id   uuid        not null references profiles(id) on delete cascade,
  status    event_rsvp  not null default 'going',
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index event_participants_user_id_idx on event_participants (user_id);

-- ─── 8. posts ────────────────────────────────────────────────
-- routes ve events artık var, FK referansları çalışır
create table posts (
  id             uuid        primary key default uuid_generate_v4(),
  author_id      uuid        not null references profiles(id) on delete cascade,
  content        text        not null,
  post_type      post_type   not null default 'text',
  media_urls     text[]      not null default '{}',
  tags           text[]      not null default '{}',
  location       jsonb,
  route_id       uuid        references routes(id) on delete set null,
  event_id       uuid        references events(id) on delete set null,
  likes_count    integer     not null default 0,
  comments_count integer     not null default 0,
  shares_count   integer     not null default 0,
  saves_count    integer     not null default 0,
  is_repost      boolean     not null default false,
  repost_of      uuid        references posts(id) on delete set null,
  club_id        uuid        references clubs(id) on delete set null,
  is_pinned      boolean     not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint content_length check (char_length(content) between 1 and 2000)
);

create index posts_author_id_idx  on posts (author_id);
create index posts_created_at_idx on posts (created_at desc);
create index posts_tags_idx       on posts using gin (tags);
create index posts_search_idx     on posts using gin (to_tsvector('simple', content));

-- ─── 9. post_likes ───────────────────────────────────────────
create table post_likes (
  post_id    uuid        not null references posts(id)    on delete cascade,
  user_id    uuid        not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ─── 10. post_saves ──────────────────────────────────────────
create table post_saves (
  post_id    uuid        not null references posts(id)    on delete cascade,
  user_id    uuid        not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- ─── 11. comments ────────────────────────────────────────────
create table comments (
  id            uuid        primary key default uuid_generate_v4(),
  post_id       uuid        not null references posts(id)    on delete cascade,
  author_id     uuid        not null references profiles(id) on delete cascade,
  content       text        not null,
  parent_id     uuid        references comments(id) on delete cascade,
  replies_count integer     not null default 0,
  likes_count   integer     not null default 0,
  created_at    timestamptz not null default now(),
  constraint content_length check (char_length(content) between 1 and 1000)
);

create index comments_post_id_idx   on comments (post_id);
create index comments_author_id_idx on comments (author_id);
create index comments_parent_id_idx on comments (parent_id);

-- ─── 12. conversations ───────────────────────────────────────
create table conversations (
  id         uuid              primary key default uuid_generate_v4(),
  type       conversation_type not null default 'direct',
  name       text,
  avatar_url text,
  created_at timestamptz       not null default now(),
  updated_at timestamptz       not null default now()
);

-- ─── 13. conversation_participants ───────────────────────────
create table conversation_participants (
  conversation_id uuid        not null references conversations(id) on delete cascade,
  user_id         uuid        not null references profiles(id)       on delete cascade,
  joined_at       timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index conv_participants_user_id_idx on conversation_participants (user_id);

-- ─── 14. messages ────────────────────────────────────────────
create table messages (
  id              uuid         primary key default uuid_generate_v4(),
  conversation_id uuid         not null references conversations(id) on delete cascade,
  sender_id       uuid         not null references profiles(id)       on delete cascade,
  type            message_type not null default 'text',
  content         text         not null,
  media_url       text,
  is_read         boolean      not null default false,
  reactions       jsonb        not null default '{}',
  created_at      timestamptz  not null default now()
);

create index messages_conversation_id_idx on messages (conversation_id, created_at desc);
create index messages_sender_id_idx       on messages (sender_id);
create index messages_unread_idx          on messages (conversation_id, is_read) where is_read = false;

-- ─── 15. notifications ───────────────────────────────────────
create table notifications (
  id          uuid              primary key default uuid_generate_v4(),
  user_id     uuid              not null references profiles(id) on delete cascade,
  actor_id    uuid              not null references profiles(id) on delete cascade,
  type        notification_type not null,
  entity_id   uuid,
  entity_type text,
  message     text              not null,
  is_read     boolean           not null default false,
  created_at  timestamptz       not null default now()
);

create index notifications_user_id_idx on notifications (user_id, created_at desc);
create index notifications_unread_idx  on notifications (user_id, is_read) where is_read = false;


-- ============================================================
--  FUNCTIONS & TRIGGERS
-- ============================================================

-- ─── updated_at otomatik güncelle ────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on profiles for each row execute function set_updated_at();
create trigger set_posts_updated_at
  before update on posts for each row execute function set_updated_at();
create trigger set_routes_updated_at
  before update on routes for each row execute function set_updated_at();
create trigger set_conversations_updated_at
  before update on conversations for each row execute function set_updated_at();

-- ─── Yeni kullanıcı → profil oluştur ─────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, vehicle_type)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9_]', '_', 'g'))
    ),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'vehicle_type', 'motorcycle')::vehicle_type
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── XP → Level ──────────────────────────────────────────────
create or replace function public.calculate_user_level(p_xp integer)
returns integer language plpgsql immutable as $$
begin
  return case
    when p_xp <    100 then 1   when p_xp <    300 then 2
    when p_xp <    600 then 3   when p_xp <   1000 then 4
    when p_xp <   1500 then 5   when p_xp <   2100 then 6
    when p_xp <   2800 then 7   when p_xp <   3600 then 8
    when p_xp <   4500 then 9   when p_xp <   5500 then 10
    when p_xp <   7000 then 15  when p_xp <  10000 then 20
    when p_xp <  15000 then 30  when p_xp <  25000 then 40
    when p_xp <  40000 then 50  when p_xp <  60000 then 60
    when p_xp <  85000 then 70  when p_xp < 115000 then 80
    when p_xp < 150000 then 90  else 100
  end;
end;
$$;

-- ─── Takip et ─────────────────────────────────────────────────
create or replace function public.follow_user(p_follower_id uuid, p_following_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into follows (follower_id, following_id)
  values (p_follower_id, p_following_id)
  on conflict do nothing;

  update profiles set following_count = following_count + 1 where id = p_follower_id;
  update profiles set followers_count = followers_count + 1 where id = p_following_id;

  insert into notifications (user_id, actor_id, type, message)
  values (p_following_id, p_follower_id, 'follow', 'Seni takip etmeye başladı');
end;
$$;

-- ─── Takipten çık ─────────────────────────────────────────────
create or replace function public.unfollow_user(p_follower_id uuid, p_following_id uuid)
returns void language plpgsql security definer as $$
begin
  delete from follows where follower_id = p_follower_id and following_id = p_following_id;
  update profiles set following_count = greatest(following_count - 1, 0) where id = p_follower_id;
  update profiles set followers_count = greatest(followers_count - 1, 0) where id = p_following_id;
end;
$$;

-- ─── Gönderi beğen / beğenme ──────────────────────────────────
create or replace function public.toggle_post_like(p_post_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer as $$
declare v_liked boolean;
begin
  select exists(
    select 1 from post_likes where post_id = p_post_id and user_id = p_user_id
  ) into v_liked;

  if v_liked then
    delete from post_likes where post_id = p_post_id and user_id = p_user_id;
    update posts set likes_count = greatest(likes_count - 1, 0) where id = p_post_id;
    return false;
  else
    insert into post_likes (post_id, user_id) values (p_post_id, p_user_id);
    update posts set likes_count = likes_count + 1 where id = p_post_id;
    insert into notifications (user_id, actor_id, type, entity_id, entity_type, message)
    select author_id, p_user_id, 'like', p_post_id, 'post', 'Gönderini beğendi'
    from posts where id = p_post_id and author_id <> p_user_id;
    return true;
  end if;
end;
$$;

-- ─── Feed ─────────────────────────────────────────────────────
create or replace function public.get_feed_posts(
  p_user_id uuid, p_limit integer default 20, p_offset integer default 0
)
returns jsonb[] language plpgsql security definer as $$
declare v_result jsonb[];
begin
  select array_agg(row_to_json(p)::jsonb) into v_result
  from (
    select posts.*, row_to_json(profiles)::jsonb as author
    from posts
    join profiles on profiles.id = posts.author_id
    where posts.author_id = p_user_id
       or posts.author_id in (select following_id from follows where follower_id = p_user_id)
    order by posts.created_at desc
    limit p_limit offset p_offset
  ) p;
  return coalesce(v_result, '{}');
end;
$$;

-- ─── Sayaç trigger'ları ───────────────────────────────────────
create or replace function public.update_club_member_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update clubs set member_count = member_count + 1 where id = new.club_id;
  elsif tg_op = 'DELETE' then
    update clubs set member_count = greatest(member_count - 1, 0) where id = old.club_id;
  end if;
  return null;
end;
$$;

create trigger club_members_count_trigger
  after insert or delete on club_members
  for each row execute function update_club_member_count();

create or replace function public.update_event_participant_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' and new.status = 'going' then
    update events set participants_count = participants_count + 1 where id = new.event_id;
  elsif tg_op = 'DELETE' and old.status = 'going' then
    update events set participants_count = greatest(participants_count - 1, 0) where id = old.event_id;
  elsif tg_op = 'UPDATE' then
    if old.status <> 'going' and new.status = 'going' then
      update events set participants_count = participants_count + 1 where id = new.event_id;
    elsif old.status = 'going' and new.status <> 'going' then
      update events set participants_count = greatest(participants_count - 1, 0) where id = new.event_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger event_participants_count_trigger
  after insert or update or delete on event_participants
  for each row execute function update_event_participant_count();

create or replace function public.update_posts_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update profiles set posts_count = posts_count + 1 where id = new.author_id;
  elsif tg_op = 'DELETE' then
    update profiles set posts_count = greatest(posts_count - 1, 0) where id = old.author_id;
  end if;
  return null;
end;
$$;

create trigger posts_count_trigger
  after insert or delete on posts
  for each row execute function update_posts_count();

create or replace function public.update_comments_count()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update posts    set comments_count = comments_count + 1                    where id = new.post_id;
    update comments set replies_count  = replies_count  + 1 where id = new.parent_id and new.parent_id is not null;
  elsif tg_op = 'DELETE' then
    update posts    set comments_count = greatest(comments_count - 1, 0)       where id = old.post_id;
    update comments set replies_count  = greatest(replies_count  - 1, 0) where id = old.parent_id and old.parent_id is not null;
  end if;
  return null;
end;
$$;

create trigger comments_count_trigger
  after insert or delete on comments
  for each row execute function update_comments_count();


-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================

alter table profiles                  enable row level security;
alter table follows                   enable row level security;
alter table clubs                     enable row level security;
alter table club_members              enable row level security;
alter table routes                    enable row level security;
alter table events                    enable row level security;
alter table event_participants        enable row level security;
alter table posts                     enable row level security;
alter table post_likes                enable row level security;
alter table post_saves                enable row level security;
alter table comments                  enable row level security;
alter table conversations             enable row level security;
alter table conversation_participants enable row level security;
alter table messages                  enable row level security;
alter table notifications             enable row level security;

-- profiles
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- follows
create policy "follows_select" on follows for select using (true);
create policy "follows_insert" on follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on follows for delete using (auth.uid() = follower_id);

-- clubs
create policy "clubs_select" on clubs for select using (
  visibility = 'public'
  or founder_id = auth.uid()
  or exists (select 1 from club_members where club_id = clubs.id and user_id = auth.uid())
);
create policy "clubs_insert" on clubs for insert with check (auth.uid() = founder_id);
create policy "clubs_update" on clubs for update using (
  auth.uid() = founder_id
  or exists (select 1 from club_members where club_id = clubs.id and user_id = auth.uid() and role in ('founder','admin'))
);
create policy "clubs_delete" on clubs for delete using (auth.uid() = founder_id);

-- club_members
-- NOTE: self-referential queries on club_members cause infinite recursion in RLS.
-- Use auth.uid() = user_id (direct check) instead of subqueries into club_members.
create policy "club_members_select" on club_members for select using (
  auth.uid() = user_id
  or exists (select 1 from clubs where id = club_members.club_id and visibility = 'public')
);
create policy "club_members_insert" on club_members for insert with check (auth.uid() = user_id);
create policy "club_members_update" on club_members for update using (auth.uid() = user_id);
create policy "club_members_delete" on club_members for delete using (auth.uid() = user_id);

-- routes
create policy "routes_select" on routes for select using (
  visibility = 'public'
  or author_id = auth.uid()
  or (visibility = 'club_only' and exists (select 1 from club_members where club_id = routes.club_id and user_id = auth.uid()))
);
create policy "routes_insert" on routes for insert with check (auth.uid() = author_id);
create policy "routes_update" on routes for update using (auth.uid() = author_id);
create policy "routes_delete" on routes for delete using (auth.uid() = author_id);

-- events
create policy "events_select" on events for select using (
  visibility = 'public'
  or organizer_id = auth.uid()
  or exists (select 1 from event_participants where event_id = events.id and user_id = auth.uid())
);
create policy "events_insert" on events for insert with check (auth.uid() = organizer_id);
create policy "events_update" on events for update using (auth.uid() = organizer_id);
create policy "events_delete" on events for delete using (auth.uid() = organizer_id);

-- event_participants
create policy "event_participants_select" on event_participants for select using (true);
create policy "event_participants_insert" on event_participants for insert with check (auth.uid() = user_id);
create policy "event_participants_update" on event_participants for update using (auth.uid() = user_id);
create policy "event_participants_delete" on event_participants for delete using (auth.uid() = user_id);

-- posts
-- Allow public posts (club_id IS NULL) or authenticated users for club posts.
-- Avoid subquery into club_members here to prevent infinite recursion via club_members RLS.
create policy "posts_select" on posts for select using (
  club_id is null
  or auth.uid() is not null
);
create policy "posts_insert" on posts for insert with check (auth.uid() = author_id);
create policy "posts_update" on posts for update using (auth.uid() = author_id);
create policy "posts_delete" on posts for delete using (auth.uid() = author_id);

-- post_likes
create policy "post_likes_select" on post_likes for select using (true);
create policy "post_likes_insert" on post_likes for insert with check (auth.uid() = user_id);
create policy "post_likes_delete" on post_likes for delete using (auth.uid() = user_id);

-- post_saves
create policy "post_saves_select" on post_saves for select using (auth.uid() = user_id);
create policy "post_saves_insert" on post_saves for insert with check (auth.uid() = user_id);
create policy "post_saves_delete" on post_saves for delete using (auth.uid() = user_id);

-- comments
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = author_id);
create policy "comments_update" on comments for update using (auth.uid() = author_id);
create policy "comments_delete" on comments for delete using (auth.uid() = author_id);

-- conversations
create policy "conversations_select" on conversations for select using (
  exists (select 1 from conversation_participants where conversation_id = conversations.id and user_id = auth.uid())
);
create policy "conversations_insert" on conversations for insert with check (auth.uid() is not null);
create policy "conversations_update" on conversations for update using (
  exists (select 1 from conversation_participants where conversation_id = conversations.id and user_id = auth.uid())
);

-- conversation_participants
create policy "conv_participants_select" on conversation_participants for select using (
  user_id = auth.uid()
  or exists (select 1 from conversation_participants cp2 where cp2.conversation_id = conversation_participants.conversation_id and cp2.user_id = auth.uid())
);
create policy "conv_participants_insert" on conversation_participants for insert with check (auth.uid() is not null);
create policy "conv_participants_delete" on conversation_participants for delete using (auth.uid() = user_id);

-- messages
create policy "messages_select" on messages for select using (
  exists (select 1 from conversation_participants where conversation_id = messages.conversation_id and user_id = auth.uid())
);
create policy "messages_insert" on messages for insert with check (
  auth.uid() = sender_id
  and exists (select 1 from conversation_participants where conversation_id = messages.conversation_id and user_id = auth.uid())
);
create policy "messages_update" on messages for update using (
  exists (select 1 from conversation_participants where conversation_id = messages.conversation_id and user_id = auth.uid())
);

-- notifications
create policy "notifications_select" on notifications for select using (auth.uid() = user_id);
create policy "notifications_insert" on notifications for insert with check (auth.uid() is not null);
create policy "notifications_update" on notifications for update using (auth.uid() = user_id);
create policy "notifications_delete" on notifications for delete using (auth.uid() = user_id);


-- ============================================================
--  REALTIME
-- ============================================================
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table posts;


-- ============================================================
--  STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true,  5242880,  array['image/jpeg','image/png','image/webp']),
  ('covers',  'covers',  true,  10485760, array['image/jpeg','image/png','image/webp']),
  ('posts',   'posts',   true,  52428800, array['image/jpeg','image/png','image/webp','video/mp4']),
  ('routes',  'routes',  true,  10485760, array['application/gpx+xml','application/xml','text/xml']),
  ('audio',   'audio',   false, 10485760, array['audio/mpeg','audio/ogg','audio/webm'])
on conflict (id) do nothing;

create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "covers_select" on storage.objects for select using (bucket_id = 'covers');
create policy "covers_insert" on storage.objects for insert
  with check (bucket_id = 'covers' and auth.uid() is not null);

create policy "posts_storage_select" on storage.objects for select using (bucket_id = 'posts');
create policy "posts_storage_insert" on storage.objects for insert
  with check (bucket_id = 'posts' and auth.uid() is not null);

create policy "routes_storage_select" on storage.objects for select using (bucket_id = 'routes');
create policy "routes_storage_insert" on storage.objects for insert
  with check (bucket_id = 'routes' and auth.uid() is not null);

create policy "audio_select" on storage.objects for select
  using (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "audio_insert" on storage.objects for insert
  with check (bucket_id = 'audio' and auth.uid() is not null);


-- ============================================================
--  TAMAMLANDI
--  Kontrol: select tablename from pg_tables where schemaname = 'public';
-- ============================================================
