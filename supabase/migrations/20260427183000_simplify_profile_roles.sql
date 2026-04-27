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

  update public.profiles
  set role = 'business'
  where role in ('business_admin', 'staff');
end $$;

alter table public.profiles
add constraint profiles_role_check
check (role in ('customer', 'business', 'super_admin'));

drop policy if exists "Business members can manage their queues" on public.queues;
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
        and profiles.role in ('business', 'super_admin')
    )
  )
  with check (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.business_id = queues.business_id
        and profiles.role in ('business', 'super_admin')
    )
  );

drop policy if exists "Business members can manage customers in their queues" on public.customers;
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
            and profiles.role in ('business', 'super_admin')
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
            and profiles.role in ('business', 'super_admin')
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
    resolved_role := 'business';
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

notify pgrst, 'reload schema';
