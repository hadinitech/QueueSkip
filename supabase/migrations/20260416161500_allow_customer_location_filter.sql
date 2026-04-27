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
