create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  monthly_price numeric(10, 2) not null default 0,
  queue_limit integer,
  staff_limit integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists subscription_plans_lower_name_idx
  on public.subscription_plans (lower(name));

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_email text not null,
  owner_name text not null default '',
  phone text not null default '',
  location text not null default '',
  subscription_plan_id uuid references public.subscription_plans(id) on delete set null,
  trial_ends_at timestamptz,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'trial', 'paid', 'overdue')),
  status text not null default 'pending'
    check (status in ('pending', 'trial', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists businesses_lower_email_idx
  on public.businesses (lower(trim(business_email)));

create index if not exists businesses_status_idx
  on public.businesses (status);

alter table public.profiles
add column if not exists business_id uuid references public.businesses(id) on delete set null;

alter table public.queues
add column if not exists business_id uuid references public.businesses(id) on delete cascade;

do $$
declare
  profile_role_constraint_name text;
begin
  select conname
  into profile_role_constraint_name
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%role%';

  if profile_role_constraint_name is not null then
    execute format(
      'alter table public.profiles drop constraint %I',
      profile_role_constraint_name
    );
  end if;
end $$;

update public.profiles
set role = 'business_admin'
where role = 'admin';

alter table public.profiles
add constraint profiles_role_check
check (role in ('customer', 'business_admin', 'staff', 'super_admin'));

with owners as (
  select distinct
    profiles.id as profile_id,
    coalesce(nullif(trim(profiles.full_name), ''), split_part(profiles.email, '@', 1), 'Business Owner') as owner_name,
    coalesce(nullif(trim(profiles.email), ''), profiles.id::text || '@queueskip.local') as business_email,
    coalesce(nullif(trim(profiles.location), ''), '') as location,
    coalesce(nullif(trim(profiles.full_name), ''), 'QueueSkip Business') as business_name
  from public.profiles
  where profiles.role = 'business_admin'
     or exists (
       select 1
       from public.queues
       where queues.owner_id = profiles.id
     )
),
inserted_businesses as (
  insert into public.businesses (
    name,
    business_email,
    owner_name,
    location,
    status,
    payment_status,
    trial_ends_at
  )
  select
    owners.business_name,
    owners.business_email,
    owners.owner_name,
    owners.location,
    'active',
    'paid',
    null
  from owners
  where not exists (
    select 1
    from public.businesses
    where lower(trim(businesses.business_email)) = lower(trim(owners.business_email))
  )
  returning id, business_email
),
all_businesses as (
  select id, business_email
  from public.businesses
)
update public.profiles
set business_id = all_businesses.id
from all_businesses
where lower(trim(public.profiles.email)) = lower(trim(all_businesses.business_email))
  and public.profiles.business_id is null;

update public.queues
set business_id = profiles.business_id
from public.profiles
where public.queues.owner_id = profiles.id
  and profiles.business_id is not null
  and public.queues.business_id is null;

create index if not exists profiles_business_id_idx
  on public.profiles (business_id);

create index if not exists queues_business_id_idx
  on public.queues (business_id, created_at desc);

drop policy if exists "Queue owners can manage their queues" on public.queues;
create policy "Business members can manage their queues"
  on public.queues
  for all
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.business_id = queues.business_id
        and profiles.role in ('business_admin', 'staff', 'super_admin')
    )
  )
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.business_id = queues.business_id
        and profiles.role in ('business_admin', 'staff', 'super_admin')
    )
  );

drop policy if exists "Queue owners can manage customers in their queues" on public.customers;
create policy "Business members can manage customers in their queues"
  on public.customers
  for all
  using (
    exists (
      select 1
      from public.queues
      join public.profiles on profiles.id = auth.uid()
      where queues.id = customers.queue_id
        and (
          queues.owner_id = auth.uid()
          or (
            profiles.business_id = queues.business_id
            and profiles.role in ('business_admin', 'staff', 'super_admin')
          )
        )
    )
  )
  with check (
    exists (
      select 1
      from public.queues
      join public.profiles on profiles.id = auth.uid()
      where queues.id = customers.queue_id
        and (
          queues.owner_id = auth.uid()
          or (
            profiles.business_id = queues.business_id
            and profiles.role in ('business_admin', 'staff', 'super_admin')
          )
        )
    )
  );

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  matched_business public.businesses%rowtype;
  resolved_role text := 'customer';
  resolved_location text := coalesce(new.raw_user_meta_data->>'location', '');
begin
  select *
  into matched_business
  from public.businesses
  where lower(trim(public.businesses.business_email)) = lower(trim(coalesce(new.email, '')))
  order by public.businesses.created_at asc
  limit 1;

  if matched_business.id is not null then
    resolved_role := 'business_admin';
    resolved_location := coalesce(nullif(trim(matched_business.location), ''), resolved_location);
  end if;

  insert into public.profiles (
    id,
    full_name,
    email,
    location,
    role,
    business_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    resolved_location,
    resolved_role,
    matched_business.id
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    location = excluded.location,
    role = excluded.role,
    business_id = excluded.business_id;

  return new;
exception
  when others then
    raise warning 'Could not create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

update public.profiles
set
  role = 'business_admin',
  business_id = businesses.id,
  location = case
    when nullif(trim(public.profiles.location), '') is null then businesses.location
    else public.profiles.location
  end
from public.businesses
where lower(trim(public.profiles.email)) = lower(trim(businesses.business_email));

notify pgrst, 'reload schema';
