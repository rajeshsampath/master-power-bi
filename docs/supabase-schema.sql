-- ============================================================
-- Master Power BI — Supabase schema, security & policies
-- Run this ONCE in Supabase ▸ SQL Editor ▸ New query ▸ Run.
-- Safe to re-run (idempotent).
-- ============================================================

-- ---------- tables ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  role       text not null default 'faculty',   -- 'faculty' | 'admin'
  last_seen  timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.progress (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  state        jsonb not null default '{}'::jsonb,
  pct          int   not null default 0,
  lessons_done int   not null default 0,
  avg_quiz     int   not null default 0,
  readiness    int   not null default 0,
  streak       int   not null default 0,
  updated_at   timestamptz default now()
);

create table if not exists public.allowed_faculty (
  email    text primary key,
  added_at timestamptz default now()
);

-- ---------- admin check (SECURITY DEFINER avoids RLS recursion) ----------
create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------- prevent privilege escalation ----------
-- A signed-in user may upsert their own profile, but must NOT make
-- themselves admin. Changes coming from the SQL editor (auth.uid() null)
-- are allowed, so the one-time admin seed below still works.
create or replace function public.guard_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;

create or replace function public.guard_role_ins()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and new.role = 'admin' and not public.is_admin() then
    new.role := 'faculty';
  end if;
  return new;
end $$;

drop trigger if exists trg_guard_role     on public.profiles;
drop trigger if exists trg_guard_role_ins on public.profiles;
create trigger trg_guard_role     before update on public.profiles for each row execute function public.guard_role();
create trigger trg_guard_role_ins before insert on public.profiles for each row execute function public.guard_role_ins();

-- ---------- grants (RLS still restricts rows) ----------
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles        to authenticated;
grant select, insert, update, delete on public.progress        to authenticated;
grant select, insert, update, delete on public.allowed_faculty to authenticated;

-- ---------- row-level security ----------
alter table public.profiles        enable row level security;
alter table public.progress        enable row level security;
alter table public.allowed_faculty enable row level security;

-- profiles: read own or (admin) all; write only own row
drop policy if exists profiles_read   on public.profiles;
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_update on public.profiles;
create policy profiles_read   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_insert on public.profiles for insert with check (id = auth.uid());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- progress: read own or (admin) all; write only own row
drop policy if exists progress_read   on public.progress;
drop policy if exists progress_insert on public.progress;
drop policy if exists progress_update on public.progress;
create policy progress_read   on public.progress for select using (user_id = auth.uid() or public.is_admin());
create policy progress_insert on public.progress for insert with check (user_id = auth.uid());
create policy progress_update on public.progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- allowed_faculty: a user may check ONLY their own email; admins manage all
drop policy if exists allow_read   on public.allowed_faculty;
drop policy if exists allow_insert on public.allowed_faculty;
drop policy if exists allow_update on public.allowed_faculty;
drop policy if exists allow_delete on public.allowed_faculty;
create policy allow_read   on public.allowed_faculty for select
  using (email = lower(auth.jwt()->>'email') or public.is_admin());
create policy allow_insert on public.allowed_faculty for insert with check (public.is_admin());
create policy allow_update on public.allowed_faculty for update using (public.is_admin());
create policy allow_delete on public.allowed_faculty for delete using (public.is_admin());

-- ============================================================
-- ONE-TIME ADMIN SEED — run AFTER you have signed in once.
-- Replace the email with YOUR Google email, then run these two lines:
--
--   insert into public.allowed_faculty(email) values ('you@example.com') on conflict do nothing;
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================
