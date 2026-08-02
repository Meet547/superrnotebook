-- User Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: RLS (Row Level Security) ensures users can only read/update their own profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using ( auth.uid() = id );
create policy "Users can insert own profile" on public.profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );

-- Auto-create a profile row whenever a new user signs up via Supabase Auth
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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Library Materials
create type public.material_type as enum ('notebook', 'items', 'canvases');

create table if not exists public.library_materials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
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

-- Library RLS policies
alter table public.library_materials enable row level security;
create policy "Users can view own library materials" on public.library_materials for select using ( auth.uid() = user_id );
create policy "Users can insert own library materials" on public.library_materials for insert with check ( auth.uid() = user_id );
create policy "Users can update own library materials" on public.library_materials for update using ( auth.uid() = user_id );
create policy "Users can delete own library materials" on public.library_materials for delete using ( auth.uid() = user_id );

-- Quizzes
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
create policy "Users can view own quizzes" on public.quizzes for select using ( auth.uid() = user_id );
create policy "Users can insert own quizzes" on public.quizzes for insert with check ( auth.uid() = user_id );
create policy "Users can update own quizzes" on public.quizzes for update using ( auth.uid() = user_id );
create policy "Users can delete own quizzes" on public.quizzes for delete using ( auth.uid() = user_id );

-- Community Feed
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  handle text not null,
  avatar text not null,
  text text not null,
  board_label text not null,
  time text not null,
  likes integer default 0,
  replies integer default 0,
  rotation text default 'rotate-0',
  tape_rotate text default 'rotate-0',
  paper_color text default 'bg-white',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.community_posts enable row level security;
-- Community posts are readable by anyone, but only the owner can insert or delete them.
create policy "Community posts are public to read" on public.community_posts for select using ( true );
create policy "Users can insert own community posts" on public.community_posts for insert with check ( auth.uid() = user_id );
create policy "Users can delete own community posts" on public.community_posts for delete using ( auth.uid() = user_id );

-- Seed Data Instructions (Run in SQL Editor after replacing 'YOUR_UUID' with a valid auth.users ID)
/*
INSERT INTO public.quizzes (user_id, subject, topic, score, active, color, border) VALUES
  ('YOUR_UUID', 'Biology', 'Photosynthesis & Respiration', '9/10', true, 'bg-green-100/50', 'border-green-200'),
  ('YOUR_UUID', 'History', 'Mughal Empire Timeline', 'Pending', false, 'bg-amber-100/50', 'border-amber-200');

INSERT INTO public.community_posts (user_id, name, handle, avatar, text, board_label, time, likes, replies, rotation, tape_rotate, paper_color) VALUES
  ('YOUR_UUID', 'Ananya Rao', '@curious_mind', 'A', 'Just mapped out my entire History syllabus into one visual canvas. 3 chapters in 20 minutes! 🗺️ Anyone else studying the Mughal Empire this week?', 'History — Mughal Empire Mind Map', '2h', 128, 14, 'rotate-2', '-rotate-2', 'bg-[#fffce8]');
*/

-- Waitlist (Public Landing Page Sign-ups)
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  role text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Anyone can join the waitlist (unauthenticated)
alter table public.waitlist enable row level security;
create policy "Anyone can insert to waitlist" on public.waitlist for insert with check ( true );
create policy "Public can view waitlist count" on public.waitlist for select using ( true );

-- Unique index on email to prevent duplicates
create unique index if not exists waitlist_email_idx on public.waitlist (lower(email));
