alter table public.queues enable row level security;
alter table public.customers enable row level security;

create index if not exists queues_owner_id_created_at_idx
  on public.queues (owner_id, created_at desc);

drop policy if exists "Queue owners can manage their queues" on public.queues;
drop policy if exists "Queue owners can manage customers in their queues" on public.customers;

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

notify pgrst, 'reload schema';
