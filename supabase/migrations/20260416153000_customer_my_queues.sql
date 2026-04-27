alter table public.customers
add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists customers_user_id_status_idx
  on public.customers (user_id, status);

drop policy if exists "Customers can view their own queue entries" on public.customers;

create policy "Customers can view their own queue entries"
  on public.customers
  for select
  using (auth.uid() = user_id);

drop function if exists public.join_queue(text, text, text);

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
    user_id,
    position,
    status
  )
  values (
    trim(customer_name_param),
    trim(customer_phone_param),
    target_queue_id,
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

grant execute on function public.join_queue(text, text, text) to anon, authenticated;

create or replace function public.list_my_queues()
returns table (
  id uuid,
  queue_id uuid,
  queue_name text,
  queue_title text,
  queue_description text,
  estimated_wait_minutes integer,
  "position" integer,
  status text,
  people_ahead bigint,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    customers.id,
    customers.queue_id,
    queues.name as queue_name,
    queues.title as queue_title,
    queues.description as queue_description,
    queues.estimated_wait_minutes,
    customers.position,
    customers.status,
    count(ahead.id) filter (
      where ahead.status in ('waiting', 'serving')
    ) as people_ahead,
    customers.created_at
  from public.customers
  join public.queues on queues.id = customers.queue_id
  left join public.customers as ahead
    on ahead.queue_id = customers.queue_id
    and ahead.position < customers.position
  where customers.user_id = auth.uid()
    and customers.status in ('waiting', 'serving')
  group by
    customers.id,
    customers.queue_id,
    queues.name,
    queues.title,
    queues.description,
    queues.estimated_wait_minutes,
    customers.position,
    customers.status,
    customers.created_at
  order by customers.created_at desc;
$$;

grant execute on function public.list_my_queues() to authenticated;

notify pgrst, 'reload schema';
