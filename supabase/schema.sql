create extension if not exists pgcrypto;

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  city text not null,
  breed text not null,
  service text not null,
  timeframe text,
  notes text,
  source text,
  campaign text,
  landing_page text,
  status text not null default 'pending' check (status in ('pending','matched','contacted','closed','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.provider_claims (
  id uuid primary key default gen_random_uuid(),
  provider_slug text not null,
  name text not null,
  email text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.provider_reviews (
  id uuid primary key default gen_random_uuid(),
  provider_slug text not null,
  author text not null,
  rating smallint not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Anoniem',
  title text not null,
  category text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  author_name text not null default 'Anoniem',
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_status_created_idx on public.quote_requests(status, created_at desc);
create index if not exists quote_requests_city_breed_idx on public.quote_requests(city, breed);
create index if not exists provider_claims_status_idx on public.provider_claims(status);
create index if not exists provider_reviews_provider_status_idx on public.provider_reviews(provider_slug, status);
create index if not exists forum_topics_status_created_idx on public.forum_topics(status, created_at desc);
create index if not exists forum_replies_topic_status_idx on public.forum_replies(topic_id, status);

alter table public.quote_requests enable row level security;
alter table public.provider_claims enable row level security;
alter table public.provider_reviews enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;

-- Writes should go through the server API using a private service role.
-- Do not expose service-role credentials in browser code.
