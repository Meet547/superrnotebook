-- SuperrBook Migration v2 — Safe to run multiple times (idempotent)
-- Apply this in: Supabase Dashboard → SQL Editor → New Query

-- ============================================================
-- 1. PROFILES TABLE (with auto-create trigger)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on public.profiles for select using ( auth.uid() = id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can insert own profile') then
    create policy "Users can insert own profile" on public.profiles for insert with check ( auth.uid() = id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );
  end if;
end $$;

-- Trigger: Auto-create profile row on new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. LIBRARY MATERIALS TABLE (shared / public — no user_id)
-- ============================================================
do $$ begin
  if not exists (select 1 from pg_type where typname = 'material_type') then
    create type public.material_type as enum ('notebook', 'items', 'canvases');
  end if;
end $$;

create table if not exists public.library_materials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,  -- nullable: shared materials have no owner
  type public.material_type not null,
  year text not null,
  subject text not null,
  title text not null,
  authors text,
  color text default 'bg-[#d9f2c6]',
  border_color text default 'border-[#c4e0ae]',
  stats text default '0',
  progress integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.library_materials enable row level security;

do $$ begin
  -- Everyone can read the public shared library
  if not exists (select 1 from pg_policies where tablename = 'library_materials' and policyname = 'Library is publicly readable') then
    create policy "Library is publicly readable" on public.library_materials for select using ( true );
  end if;
  -- Authenticated users can add their own materials
  if not exists (select 1 from pg_policies where tablename = 'library_materials' and policyname = 'Authenticated users can insert materials') then
    create policy "Authenticated users can insert materials" on public.library_materials for insert with check ( auth.role() = 'authenticated' );
  end if;
end $$;

-- ============================================================
-- 3. QUIZZES TABLE (per-user)
-- ============================================================
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null,
  topic text not null,
  score text not null default 'Pending',
  active boolean default false,
  color text default 'bg-green-100/50',
  border text default 'border-green-200',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quizzes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'quizzes' and policyname = 'Users can view own quizzes') then
    create policy "Users can view own quizzes" on public.quizzes for select using ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'quizzes' and policyname = 'Users can insert own quizzes') then
    create policy "Users can insert own quizzes" on public.quizzes for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'quizzes' and policyname = 'Users can update own quizzes') then
    create policy "Users can update own quizzes" on public.quizzes for update using ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'quizzes' and policyname = 'Users can delete own quizzes') then
    create policy "Users can delete own quizzes" on public.quizzes for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- ============================================================
-- 4. COMMUNITY POSTS TABLE (public read, auth insert)
-- ============================================================
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  handle text not null,
  avatar text not null,
  text text not null,
  board_label text not null,
  time text not null default 'just now',
  likes integer default 0,
  replies integer default 0,
  rotation text default 'rotate-0',
  tape_rotate text default 'rotate-0',
  paper_color text default 'bg-white',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'community_posts' and policyname = 'Community posts are public to read') then
    create policy "Community posts are public to read" on public.community_posts for select using ( true );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'community_posts' and policyname = 'Users can insert own community posts') then
    create policy "Users can insert own community posts" on public.community_posts for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'community_posts' and policyname = 'Users can update own post likes') then
    create policy "Users can update own post likes" on public.community_posts for update using ( true );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'community_posts' and policyname = 'Users can delete own community posts') then
    create policy "Users can delete own community posts" on public.community_posts for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- ============================================================
-- 5. CHAT SESSIONS TABLE (per-user)
-- ============================================================
create table if not exists public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'New Note',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_sessions enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'chat_sessions' and policyname = 'Users can view own chat sessions') then
    create policy "Users can view own chat sessions" on public.chat_sessions for select using ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'chat_sessions' and policyname = 'Users can insert own chat sessions') then
    create policy "Users can insert own chat sessions" on public.chat_sessions for insert with check ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'chat_sessions' and policyname = 'Users can update own chat sessions') then
    create policy "Users can update own chat sessions" on public.chat_sessions for update using ( auth.uid() = user_id );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'chat_sessions' and policyname = 'Users can delete own chat sessions') then
    create policy "Users can delete own chat sessions" on public.chat_sessions for delete using ( auth.uid() = user_id );
  end if;
end $$;

-- ============================================================
-- 6. CHAT MESSAGES TABLE (per-session)
-- ============================================================
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'ai')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.chat_messages enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'Users can view messages in own sessions') then
    create policy "Users can view messages in own sessions" on public.chat_messages
      for select using (
        exists (
          select 1 from public.chat_sessions
          where chat_sessions.id = chat_messages.session_id
          and chat_sessions.user_id = auth.uid()
        )
      );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'Users can insert messages in own sessions') then
    create policy "Users can insert messages in own sessions" on public.chat_messages
      for insert with check (
        exists (
          select 1 from public.chat_sessions
          where chat_sessions.id = chat_messages.session_id
          and chat_sessions.user_id = auth.uid()
        )
      );
  end if;
end $$;

-- ============================================================
-- 7. WAITLIST TABLE
-- ============================================================
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.waitlist enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'waitlist' and policyname = 'Anyone can insert to waitlist') then
    create policy "Anyone can insert to waitlist" on public.waitlist for insert with check ( true );
  end if;
  if not exists (select 1 from pg_policies where tablename = 'waitlist' and policyname = 'Public can view waitlist count') then
    create policy "Public can view waitlist count" on public.waitlist for select using ( true );
  end if;
end $$;

create unique index if not exists waitlist_email_idx on public.waitlist (lower(email));
