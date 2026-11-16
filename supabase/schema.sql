create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.customer_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.customer_data enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.customer_data from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select, insert, update on public.customer_data to authenticated;

drop policy if exists "Customers can read their own profile" on public.profiles;
create policy "Customers can read their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Customers can update their own profile" on public.profiles;
create policy "Customers can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Customers can read their own data" on public.customer_data;
create policy "Customers can read their own data"
  on public.customer_data for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Customers can create their own data" on public.customer_data;
create policy "Customers can create their own data"
  on public.customer_data for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Customers can update their own data" on public.customer_data;
create policy "Customers can update their own data"
  on public.customer_data for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_nusa_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  insert into public.customer_data (user_id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_nusa_auth_user_created on auth.users;
create trigger on_nusa_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_nusa_user();
