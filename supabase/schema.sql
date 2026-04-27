create table if not exists public.queues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  title text not null default '',
  description text not null default '',
  lunch_time text not null default '',
  estimated_wait_minutes integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.queues
add column if not exists title text not null default '',
add column if not exists description text not null default '',
add column if not exists lunch_time text not null default '',
add column if not exists estimated_wait_minutes integer not null default 0,
add column if not exists business_id uuid references public.businesses(id) on delete cascade;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  queue_id uuid not null references public.queues(id) on delete cascade,
  position integer not null,
  status text not null default 'waiting' check (status in ('waiting', 'serving', 'done')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'customer' check (role in ('customer', 'business_admin', 'staff', 'super_admin')),
  created_at timestamptz not null default now()
);

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

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_email text not null,
  owner_name text not null default '',
  phone text not null default '',
  location text not null default '',
  subscription_plan_id uuid references public.subscription_plans(id) on delete set null,
  trial_ends_at timestamptz,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'trial', 'paid', 'overdue')),
  status text not null default 'pending' check (status in ('pending', 'trial', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
add column if not exists business_id uuid references public.businesses(id) on delete set null;

create index if not exists customers_queue_id_position_idx
  on public.customers (queue_id, position);

create unique index if not exists queues_owner_id_lower_name_idx
  on public.queues (owner_id, lower(name));

alter table public.queues enable row level security;
alter table public.customers enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Queue owners can manage their queues"
  on public.queues
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Queue owners can manage customers in their queues"
  on public.customers
  for all
  using (
    exists (
      select 1
      from public.queues
      where queues.id = customers.queue_id
        and queues.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.queues
      where queues.id = customers.queue_id
        and queues.owner_id = auth.uid()
    )
  );

create or replace function public.join_queue(
  queue_name_param text,
  customer_name_param text,
  customer_phone_param text
)
returns table (
  id uuid,
  name text,
  phone text,
  queue_id uuid,
  "position" integer,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_queue_id uuid;
  next_position integer;
begin
  if nullif(trim(customer_name_param), '') is null then
    raise exception 'Customer name is required.'
      using errcode = 'P0001';
  end if;

  if nullif(trim(customer_phone_param), '') is null then
    raise exception 'Customer phone number is required.'
      using errcode = 'P0001';
  end if;

  select queues.id
  into target_queue_id
  from public.queues
  where lower(queues.name) = lower(queue_name_param)
  order by queues.created_at asc
  limit 1;

  if target_queue_id is null then
    raise exception 'Queue "%" is not available.', queue_name_param
      using errcode = 'P0001';
  end if;

  select coalesce(max(customers.position), 0) + 1
  into next_position
  from public.customers
  where customers.queue_id = target_queue_id
    and customers.status in ('waiting', 'serving');

  return query
  insert into public.customers (
    name,
    phone,
    queue_id,
    position,
    status
  )
  values (
    trim(customer_name_param),
    trim(customer_phone_param),
    target_queue_id,
    next_position,
    'waiting'
  )
  returning
    customers.id,
    customers.name,
    customers.phone,
    customers.queue_id,
    customers.position,
    customers.status,
    customers.created_at;
end;
$$;

grant execute on function public.join_queue(text, text, text) to anon, authenticated;

create or replace function public.list_public_queues()
returns table (
  id uuid,
  name text,
  title text,
  description text,
  lunch_time text,
  estimated_wait_minutes integer,
  people_waiting bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    queues.id,
    queues.name,
    queues.title,
    queues.description,
    queues.lunch_time,
    queues.estimated_wait_minutes,
    count(customers.id) filter (
      where customers.status in ('waiting', 'serving')
    ) as people_waiting,
    queues.created_at
  from public.queues
  left join public.customers on customers.queue_id = queues.id
  group by
    queues.id,
    queues.name,
    queues.title,
    queues.description,
    queues.lunch_time,
    queues.estimated_wait_minutes,
    queues.created_at
  order by queues.created_at desc;
$$;

grant execute on function public.list_public_queues() to anon, authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    'customer'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email;

  return new;
exception
  when others then
    raise warning 'Could not create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;

create trigger create_profile_after_signup
after insert on auth.users
for each row
execute function public.create_profile_for_new_user();

insert into public.profiles (
  id,
  full_name,
  email,
  role
)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', ''),
  coalesce(email, ''),
  'customer'
from auth.users
on conflict (id) do nothing;
