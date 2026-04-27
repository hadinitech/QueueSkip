alter table public.queues
add column if not exists location text not null default '';

alter table public.profiles
add column if not exists location text not null default '';

create index if not exists queues_location_idx
  on public.queues (lower(location));

create or replace function public.list_queue_locations()
returns table (
  location text
)
language sql
security definer
set search_path = public
as $$
  select distinct trim(queues.location) as location
  from public.queues
  where nullif(trim(queues.location), '') is not null
  order by trim(queues.location);
$$;

grant execute on function public.list_queue_locations() to anon, authenticated;

create or replace function public.list_public_queues(
  location_param text default null
)
returns table (
  id uuid,
  name text,
  title text,
  description text,
  lunch_time text,
  location text,
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
    queues.location,
    queues.estimated_wait_minutes,
    count(customers.id) filter (
      where customers.status in ('waiting', 'serving')
    ) as people_waiting,
    queues.created_at
  from public.queues
  left join public.customers on customers.queue_id = queues.id
  where location_param is null
    or lower(trim(queues.location)) = lower(trim(location_param))
  group by
    queues.id,
    queues.name,
    queues.title,
    queues.description,
    queues.lunch_time,
    queues.location,
    queues.estimated_wait_minutes,
    queues.created_at
  order by queues.created_at desc;
$$;

grant execute on function public.list_public_queues(text) to anon, authenticated;

create or replace function public.join_queue_by_id(
  queue_id_param uuid,
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
  next_position integer;
begin
  if auth.uid() is null then
    raise exception 'You must be logged in to join a queue.'
      using errcode = 'P0001';
  end if;

  if nullif(trim(customer_name_param), '') is null then
    raise exception 'Customer name is required.'
      using errcode = 'P0001';
  end if;

  if nullif(trim(customer_phone_param), '') is null then
    raise exception 'Customer phone number is required.'
      using errcode = 'P0001';
  end if;

  if not exists (
    select 1
    from public.queues
    join public.profiles on profiles.id = auth.uid()
    where queues.id = queue_id_param
      and lower(trim(queues.location)) = lower(trim(profiles.location))
  ) then
    raise exception 'This queue is not available for your location.'
      using errcode = 'P0001';
  end if;

  select coalesce(max(customers.position), 0) + 1
  into next_position
  from public.customers
  where customers.queue_id = queue_id_param
    and customers.status in ('waiting', 'serving');

  return query
  insert into public.customers (
    name,
    phone,
    queue_id,
    user_id,
    position,
    status
  )
  values (
    trim(customer_name_param),
    trim(customer_phone_param),
    queue_id_param,
    auth.uid(),
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

grant execute on function public.join_queue_by_id(uuid, text, text) to authenticated;

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
    location,
    role
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'location', ''),
    'customer'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    location = excluded.location;

  return new;
exception
  when others then
    raise warning 'Could not create profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$;

update public.profiles
set location = coalesce(nullif(trim(location), ''), '')
where location is null;

notify pgrst, 'reload schema';
