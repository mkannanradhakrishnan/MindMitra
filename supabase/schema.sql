-- MindMitra privacy-first schema. Run this in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  peer_alias text not null unique,
  role text not null default 'student' check (role in ('student', 'mentor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mood smallint not null check (mood between 0 and 4),
  sleep_quality smallint not null check (sleep_quality between 1 and 3),
  academic_load smallint not null check (academic_load between 1 and 3),
  support_signal smallint not null check (support_signal between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.peer_rooms (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users (id) on delete cascade,
  mentor_id uuid references auth.users (id) on delete set null,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.peer_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.peer_rooms (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.peer_reports (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.peer_rooms (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (length(trim(reason)) between 1 and 500),
  created_at timestamptz not null default now()
);

-- Keep a previously created prototype database compatible with the current names.
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.peer_rooms add column if not exists updated_at timestamptz not null default now();
alter table public.check_ins add column if not exists support_signal smallint;
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'check_ins' and column_name = 'risk_score') then
    update public.check_ins set support_signal = coalesce(support_signal, risk_score, 50);
  else
    update public.check_ins set support_signal = coalesce(support_signal, 50);
  end if;
end $$;
alter table public.check_ins alter column support_signal set not null;
do $$
begin
  alter table public.check_ins add constraint check_ins_support_signal_check check (support_signal between 0 and 100);
exception when duplicate_object then null;
end $$;

create index if not exists check_ins_user_created_idx on public.check_ins (user_id, created_at desc);
create index if not exists peer_rooms_status_created_idx on public.peer_rooms (status, created_at);
create index if not exists peer_rooms_student_status_idx on public.peer_rooms (student_id, status);
create index if not exists peer_messages_room_created_idx on public.peer_messages (room_id, created_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists peer_rooms_updated_at on public.peer_rooms;
create trigger peer_rooms_updated_at before update on public.peer_rooms
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, peer_alias)
  values (new.id, 'Student #' || upper(substr(replace(new.id::text, '-', ''), 1, 4)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_user();

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.claim_peer_room(requested_room_id uuid)
returns setof public.peer_rooms language plpgsql security definer set search_path = public as $$
begin
  if public.current_user_role() not in ('mentor', 'admin') then
    raise exception 'mentor access required';
  end if;

  return query
    update public.peer_rooms
    set mentor_id = (select auth.uid()), status = 'active', updated_at = now()
    where id = requested_room_id and status = 'waiting' and mentor_id is null
    returning *;
end;
$$;

create or replace function public.close_peer_room(requested_room_id uuid)
returns setof public.peer_rooms language plpgsql security definer set search_path = public as $$
begin
  return query
    update public.peer_rooms
    set status = 'closed', closed_at = now(), updated_at = now()
    where id = requested_room_id
      and status = 'active'
      and ((student_id = (select auth.uid())) or (mentor_id = (select auth.uid())))
    returning *;
end;
$$;

alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;
alter table public.peer_rooms enable row level security;
alter table public.peer_messages enable row level security;
alter table public.peer_reports enable row level security;

drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
drop policy if exists "checkins own select" on public.check_ins;
drop policy if exists "checkins own insert" on public.check_ins;
drop policy if exists "checkins own delete" on public.check_ins;
drop policy if exists "rooms participant select" on public.peer_rooms;
drop policy if exists "rooms student insert" on public.peer_rooms;
drop policy if exists "rooms participant update" on public.peer_rooms;
drop policy if exists "rooms student delete" on public.peer_rooms;
drop policy if exists "messages participant select" on public.peer_messages;
drop policy if exists "messages participant insert" on public.peer_messages;
drop policy if exists "reports participant insert" on public.peer_reports;

create policy "profiles own or assigned select" on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (
    public.current_user_role() in ('mentor', 'admin')
    and exists (select 1 from public.peer_rooms r where r.student_id = profiles.id and (r.status = 'waiting' or r.mentor_id = (select auth.uid())))
  )
);
create policy "profiles own insert" on public.profiles for insert to authenticated
with check (id = (select auth.uid()) and role = 'student');
create policy "profiles own update" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = public.current_user_role());

create policy "checkins own select" on public.check_ins for select to authenticated
using (user_id = (select auth.uid()));
create policy "checkins own insert" on public.check_ins for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "checkins own delete" on public.check_ins for delete to authenticated
using (user_id = (select auth.uid()));

create policy "rooms participant or mentor queue select" on public.peer_rooms for select to authenticated
using (
  student_id = (select auth.uid())
  or mentor_id = (select auth.uid())
  or (status = 'waiting' and public.current_user_role() in ('mentor', 'admin'))
);
create policy "rooms student insert" on public.peer_rooms for insert to authenticated
with check (student_id = (select auth.uid()) and mentor_id is null and status = 'waiting');
create policy "rooms assigned mentor update" on public.peer_rooms for update to authenticated
using (mentor_id = (select auth.uid()))
with check (mentor_id = (select auth.uid()));
create policy "rooms student delete" on public.peer_rooms for delete to authenticated
using (student_id = (select auth.uid()));

create policy "messages participant select" on public.peer_messages for select to authenticated
using (exists (select 1 from public.peer_rooms r where r.id = room_id and (r.student_id = (select auth.uid()) or r.mentor_id = (select auth.uid()))));
create policy "messages participant insert" on public.peer_messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (select 1 from public.peer_rooms r where r.id = room_id and r.status = 'active' and (r.student_id = (select auth.uid()) or r.mentor_id = (select auth.uid())))
);

create policy "reports participant insert" on public.peer_reports for insert to authenticated
with check (
  reporter_id = (select auth.uid())
  and exists (select 1 from public.peer_rooms r where r.id = room_id and (r.student_id = (select auth.uid()) or r.mentor_id = (select auth.uid())))
);

do $$
begin
  alter publication supabase_realtime add table public.peer_messages;
exception when duplicate_object then null;
end $$;
