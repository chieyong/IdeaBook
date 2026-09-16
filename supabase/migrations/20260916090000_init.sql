-- Vonkenboek — basisschema
-- Alles staat in het schema `public`, met Row Level Security zodat elke
-- gebruiker uitsluitend zijn eigen ideeën en fragmenten ziet.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- enums ----

do $$ begin
  create type public.idee_type as enum ('app', 'film', 'project', 'overig');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.idee_status as enum ('vonk', 'verkennen', 'uitwerken', 'geparkeerd', 'gedaan', 'kerkhof');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.idee_inspanning as enum ('klein', 'middel', 'groot');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------- idea -----

create table if not exists public.idea (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titel text not null check (char_length(btrim(titel)) between 1 and 200),
  type public.idee_type not null default 'overig',
  status public.idee_status not null default 'vonk',
  enthousiasme smallint check (enthousiasme between 1 and 5),
  inspanning public.idee_inspanning,
  tags text[] not null default '{}',
  sjabloon_antwoorden jsonb not null default '{}'::jsonb,
  extern_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  gepromoveerd_at timestamptz
);

create index if not exists idea_user_created_idx on public.idea (user_id, created_at desc);
create index if not exists idea_user_status_idx on public.idea (user_id, status);
create index if not exists idea_user_type_idx on public.idea (user_id, type);
create index if not exists idea_review_idx on public.idea (user_id, last_reviewed_at nulls first);
create index if not exists idea_tags_idx on public.idea using gin (tags);
-- Snel zoeken op titel tijdens "toevoegen aan bestaand idee".
create index if not exists idea_titel_trgm_idx on public.idea using gin (titel gin_trgm_ops);

-- ------------------------------------------------------------- fragment ----

-- Een idee groeit via losse fragmenten op een tijdlijn, niet via één groot
-- tekstveld. `user_id` staat er redundant bij zodat RLS zonder join werkt.
create table if not exists public.fragment (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.idea (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  inhoud text,
  afbeelding_url text,
  link text,
  created_at timestamptz not null default now(),
  constraint fragment_niet_leeg check (
    coalesce(btrim(inhoud), '') <> '' or afbeelding_url is not null or link is not null
  )
);

create index if not exists fragment_idea_created_idx on public.fragment (idea_id, created_at);
create index if not exists fragment_user_idx on public.fragment (user_id);

-- ------------------------------------------------------------ idea_link ----

-- Koppelingen tussen ideeën. De check zorgt voor één canonieke richting,
-- zodat (a,b) en (b,a) niet allebei kunnen bestaan.
create table if not exists public.idea_link (
  idea_a uuid not null references public.idea (id) on delete cascade,
  idea_b uuid not null references public.idea (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (idea_a, idea_b),
  constraint idea_link_canoniek check (idea_a < idea_b)
);

create index if not exists idea_link_b_idx on public.idea_link (idea_b);
create index if not exists idea_link_user_idx on public.idea_link (user_id);

-- -------------------------------------------------------------- triggers ---

create or replace function public.zet_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists idea_updated_at on public.idea;
create trigger idea_updated_at
  before update on public.idea
  for each row execute function public.zet_updated_at();

-- Een nieuw fragment houdt het idee "levend".
create or replace function public.raak_idee_aan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.idea set updated_at = now() where id = new.idea_id;
  return new;
end;
$$;

drop trigger if exists fragment_raakt_idee_aan on public.fragment;
create trigger fragment_raakt_idee_aan
  after insert on public.fragment
  for each row execute function public.raak_idee_aan();

-- ------------------------------------------------------------------ RLS ----

alter table public.idea enable row level security;
alter table public.fragment enable row level security;
alter table public.idea_link enable row level security;

drop policy if exists "eigen ideeen lezen" on public.idea;
create policy "eigen ideeen lezen" on public.idea
  for select using (auth.uid() = user_id);

drop policy if exists "eigen ideeen toevoegen" on public.idea;
create policy "eigen ideeen toevoegen" on public.idea
  for insert with check (auth.uid() = user_id);

drop policy if exists "eigen ideeen wijzigen" on public.idea;
create policy "eigen ideeen wijzigen" on public.idea
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "eigen ideeen verwijderen" on public.idea;
create policy "eigen ideeen verwijderen" on public.idea
  for delete using (auth.uid() = user_id);

drop policy if exists "eigen fragmenten lezen" on public.fragment;
create policy "eigen fragmenten lezen" on public.fragment
  for select using (auth.uid() = user_id);

drop policy if exists "eigen fragmenten toevoegen" on public.fragment;
create policy "eigen fragmenten toevoegen" on public.fragment
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.idea i where i.id = idea_id and i.user_id = auth.uid())
  );

drop policy if exists "eigen fragmenten wijzigen" on public.fragment;
create policy "eigen fragmenten wijzigen" on public.fragment
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "eigen fragmenten verwijderen" on public.fragment;
create policy "eigen fragmenten verwijderen" on public.fragment
  for delete using (auth.uid() = user_id);

drop policy if exists "eigen koppelingen lezen" on public.idea_link;
create policy "eigen koppelingen lezen" on public.idea_link
  for select using (auth.uid() = user_id);

drop policy if exists "eigen koppelingen toevoegen" on public.idea_link;
create policy "eigen koppelingen toevoegen" on public.idea_link
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.idea i where i.id = idea_a and i.user_id = auth.uid())
    and exists (select 1 from public.idea i where i.id = idea_b and i.user_id = auth.uid())
  );

drop policy if exists "eigen koppelingen verwijderen" on public.idea_link;
create policy "eigen koppelingen verwijderen" on public.idea_link
  for delete using (auth.uid() = user_id);

-- -------------------------------------------------------------- storage ----

-- Private bucket voor afbeeldingen bij fragmenten (gebruikt vanaf fase 2).
-- Bestandspad is altijd "<user_id>/<bestandsnaam>".
insert into storage.buckets (id, name, public)
values ('fragment-afbeeldingen', 'fragment-afbeeldingen', false)
on conflict (id) do nothing;

drop policy if exists "eigen afbeeldingen lezen" on storage.objects;
create policy "eigen afbeeldingen lezen" on storage.objects
  for select using (
    bucket_id = 'fragment-afbeeldingen'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "eigen afbeeldingen uploaden" on storage.objects;
create policy "eigen afbeeldingen uploaden" on storage.objects
  for insert with check (
    bucket_id = 'fragment-afbeeldingen'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "eigen afbeeldingen verwijderen" on storage.objects;
create policy "eigen afbeeldingen verwijderen" on storage.objects
  for delete using (
    bucket_id = 'fragment-afbeeldingen'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
