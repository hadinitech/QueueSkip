create table if not exists public.business_onboarding_requests (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_name text not null,
  email text not null,
  phone text not null,
  location text not null,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'approved')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_onboarding_requests_status_idx
  on public.business_onboarding_requests (status, created_at desc);

create unique index if not exists business_onboarding_requests_lower_email_idx
  on public.business_onboarding_requests (lower(trim(email)), created_at desc);

alter table public.business_onboarding_requests enable row level security;

drop policy if exists "Anyone can submit onboarding requests" on public.business_onboarding_requests;
create policy "Anyone can submit onboarding requests"
  on public.business_onboarding_requests
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Super admins can view onboarding requests" on public.business_onboarding_requests;
create policy "Super admins can view onboarding requests"
  on public.business_onboarding_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

drop policy if exists "Super admins can update onboarding requests" on public.business_onboarding_requests;
create policy "Super admins can update onboarding requests"
  on public.business_onboarding_requests
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

notify pgrst, 'reload schema';
