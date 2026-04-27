alter table public.businesses
add column if not exists address text not null default '',
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists place_id text,
add column if not exists city text not null default '',
add column if not exists province text not null default '',
add column if not exists country text not null default '';

create index if not exists businesses_latitude_longitude_idx
  on public.businesses (latitude, longitude);

create index if not exists businesses_place_id_idx
  on public.businesses (place_id);

create or replace function public.list_public_queues(
  location_param text default null
)
returns table (
  id uuid,
  business_id uuid,
  name text,
  title text,
  description text,
  lunch_time text,
  location text,
  address text,
  city text,
  province text,
  country text,
  latitude double precision,
  longitude double precision,
  place_id text,
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
    queues.business_id,
    queues.name,
    queues.title,
    queues.description,
    queues.lunch_time,
    queues.location,
    businesses.address,
    businesses.city,
    businesses.province,
    businesses.country,
    businesses.latitude,
    businesses.longitude,
    businesses.place_id,
    queues.estimated_wait_minutes,
    count(customers.id) filter (
      where customers.status in ('waiting', 'serving')
    ) as people_waiting,
    queues.created_at
  from public.queues
  left join public.businesses on businesses.id = queues.business_id
  left join public.customers on customers.queue_id = queues.id
  where location_param is null
    or lower(trim(queues.location)) = lower(trim(location_param))
  group by
    queues.id,
    queues.business_id,
    queues.name,
    queues.title,
    queues.description,
    queues.lunch_time,
    queues.location,
    businesses.address,
    businesses.city,
    businesses.province,
    businesses.country,
    businesses.latitude,
    businesses.longitude,
    businesses.place_id,
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
    where queues.id = queue_id_param
  ) then
    raise exception 'This queue is not available.'
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

notify pgrst, 'reload schema';
