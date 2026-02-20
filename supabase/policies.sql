alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.farms enable row level security;
alter table public.fields enable row level security;
alter table public.weather_snapshots_daily enable row level security;
alter table public.irrigation_recommendations_daily enable row level security;
alter table public.alerts enable row level security;
alter table public.satellite_ndvi_timeseries enable row level security;
alter table public.reports enable row level security;
alter table public.articles enable row level security;
alter table public.plan_limits enable row level security;
alter table public.external_api_cache enable row level security;
alter table public.usage_events enable row level security;
alter table public.job_runs enable row level security;

create policy "own profile read" on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid());

create policy "org members read org" on public.organizations for select using (public.is_org_member(id));
create policy "org owner update org" on public.organizations for update using (owner_id = auth.uid());
create policy "org owner insert org" on public.organizations for insert with check (owner_id = auth.uid());

create policy "members read members" on public.organization_members for select using (public.is_org_member(org_id));
create policy "owner manages members" on public.organization_members for all using (
  exists (select 1 from public.organizations o where o.id = org_id and o.owner_id = auth.uid())
);

create policy "members read farms" on public.farms for select using (public.is_org_member(org_id));
create policy "members write farms" on public.farms for all using (public.is_org_member(org_id));

create policy "members read fields" on public.fields for select using (
  exists (select 1 from public.farms f where f.id = farm_id and public.is_org_member(f.org_id))
);
create policy "members write fields" on public.fields for all using (
  exists (select 1 from public.farms f where f.id = farm_id and public.is_org_member(f.org_id))
);

create policy "members read weather" on public.weather_snapshots_daily for select using (
  exists (select 1 from public.fields fd join public.farms f on f.id = fd.farm_id where fd.id = field_id and public.is_org_member(f.org_id))
);
create policy "service writes weather" on public.weather_snapshots_daily for all to service_role using (true) with check (true);

create policy "members read irrigation" on public.irrigation_recommendations_daily for select using (
  exists (select 1 from public.fields fd join public.farms f on f.id = fd.farm_id where fd.id = field_id and public.is_org_member(f.org_id))
);
create policy "service writes irrigation" on public.irrigation_recommendations_daily for all to service_role using (true) with check (true);

create policy "members read alerts" on public.alerts for select using (
  exists (select 1 from public.fields fd join public.farms f on f.id = fd.farm_id where fd.id = field_id and public.is_org_member(f.org_id))
);
create policy "service writes alerts" on public.alerts for all to service_role using (true) with check (true);

create policy "members read ndvi" on public.satellite_ndvi_timeseries for select using (
  exists (select 1 from public.fields fd join public.farms f on f.id = fd.farm_id where fd.id = field_id and public.is_org_member(f.org_id))
);
create policy "service writes ndvi" on public.satellite_ndvi_timeseries for all to service_role using (true) with check (true);

create policy "members read reports" on public.reports for select using (public.is_org_member(org_id));
create policy "members create reports" on public.reports for insert with check (public.is_org_member(org_id));
create policy "service manages reports" on public.reports for all to service_role using (true) with check (true);

create policy "public read articles" on public.articles for select using (true);
create policy "admins manage articles" on public.articles for all using (public.can_manage_article());

create policy "public read plan limits" on public.plan_limits for select using (true);

create policy "service manages external cache" on public.external_api_cache for all to service_role using (true) with check (true);
create policy "members read usage" on public.usage_events for select using (public.is_org_member(org_id));
create policy "service writes usage" on public.usage_events for all to service_role using (true) with check (true);
create policy "service manages job runs" on public.job_runs for all to service_role using (true) with check (true);

alter view public.public_reports set (security_invoker = true);
grant select on public.public_reports to anon, authenticated;
