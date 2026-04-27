drop function if exists public.join_queue(text, text, text);

create function public.join_queue(
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

notify pgrst, 'reload schema';
