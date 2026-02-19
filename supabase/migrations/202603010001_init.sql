create extension if not exists pgcrypto;

create type public.plan_type as enum ('free','pro','b2b');
create type public.org_role as enum ('owner','admin','member');
create type public.irrigation_method as enum ('flood','drip','sprinkler','other');
create type public.alert_type as enum ('heat','wind','cold','ndvi_drop','water_stress','system');
create type public.report_type as enum ('wapor_water_productivity','monthly_summary');
create type public.report_status as enum ('queued','ready','failed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  country text not null default 'EG',
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan public.plan_type not null default 'free',
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null default 'member',
  primary key (org_id, user_id)
);

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  country text not null,
  governorate text,
  location_lat numeric,
  location_lng numeric,
  created_at timestamptz not null default now()
);

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  area_ha numeric not null,
  geometry jsonb not null,
  centroid_lat numeric not null,
  centroid_lng numeric not null,
  crop_type text not null,
  planting_date date,
  irrigation_method public.irrigation_method not null default 'other',
  created_at timestamptz not null default now()
);

create table public.weather_snapshots_daily (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  source text not null default 'NASA_POWER',
  payload jsonb not null,
  created_at timestamptz not null default now(),
  unique(field_id, date)
);

create table public.irrigation_recommendations_daily (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  et0_mm numeric not null,
  recommended_mm numeric not null,
  reasoning text not null,
  confidence numeric not null,
  created_at timestamptz not null default now(),
  unique(field_id, date)
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  type public.alert_type not null,
  severity int not null check (severity between 1 and 5),
  message text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.satellite_ndvi_timeseries (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields(id) on delete cascade,
  date date not null,
  source text not null default 'SENTINEL_HUB',
  ndvi_mean numeric not null,
  cloud_pct numeric,
  preview_url text,
  created_at timestamptz not null default now(),
  unique(field_id, date)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  field_id uuid references public.fields(id) on delete set null,
  month date not null,
  type public.report_type not null,
  status public.report_status not null default 'queued',
  public_token text not null unique,
  artifact_url text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content_md text not null,
  tags text[] not null default '{}',
  locale text not null default 'ar',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.plan_limits (
  plan public.plan_type primary key,
  fields_limit int not null,
  reports_per_month int not null,
  ndvi_checks_per_month int not null
);

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.organization_members m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_article()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create view public.public_reports as
select public_token, month, type, status, artifact_url, payload, created_at
from public.reports
where status = 'ready';
