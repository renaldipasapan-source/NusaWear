create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

alter table public.profiles
  alter column last_seen_at drop default,
  alter column last_seen_at drop not null;

create table if not exists public.customer_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 80),
  caption text not null check (char_length(caption) between 1 and 220),
  topic text not null default 'outfit-harian',
  image_url text not null default '/images/community-style.jpg',
  created_at timestamptz not null default now()
);

alter table public.community_posts
  add column if not exists topic text not null default 'outfit-harian';

alter table public.community_posts
  drop constraint if exists community_posts_topic_check;

alter table public.community_posts
  add constraint community_posts_topic_check
  check (topic ~ '^[a-z0-9][a-z0-9-]{0,59}$');

create table if not exists public.community_likes (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.community_rooms (
  id text primary key,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '',
  mark text not null default '✳',
  created_at timestamptz not null default now()
);

create index if not exists community_posts_created_at_idx
  on public.community_posts (created_at desc);

alter table public.profiles enable row level security;
alter table public.customer_data enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_likes enable row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.customer_data from anon, authenticated;
revoke all on public.community_posts from anon, authenticated;
revoke all on public.community_likes from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (full_name, last_seen_at) on public.profiles to authenticated;
grant select, insert, update on public.customer_data to authenticated;
grant select on public.community_posts to anon, authenticated;
grant insert, delete on public.community_posts to authenticated;
grant select on public.community_likes to anon, authenticated;
grant insert, delete on public.community_likes to authenticated;

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

drop policy if exists "Anyone can read community stories" on public.community_posts;
create policy "Anyone can read community stories"
  on public.community_posts for select to anon, authenticated
  using (true);

drop policy if exists "Customers can publish their own stories" on public.community_posts;
create policy "Customers can publish their own stories"
  on public.community_posts for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "Customers can delete their own stories" on public.community_posts;
create policy "Customers can delete their own stories"
  on public.community_posts for delete to authenticated
  using ((select auth.uid()) = author_id);

drop policy if exists "Anyone can read community likes" on public.community_likes;
create policy "Anyone can read community likes"
  on public.community_likes for select to anon, authenticated
  using (true);

drop policy if exists "Customers can like stories as themselves" on public.community_likes;
create policy "Customers can like stories as themselves"
  on public.community_likes for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Customers can remove their own likes" on public.community_likes;
create policy "Customers can remove their own likes"
  on public.community_likes for delete to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'community-images',
  'community-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view community images" on storage.objects;
create policy "Anyone can view community images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'community-images');

drop policy if exists "Customers can upload their own community images" on storage.objects;
create policy "Customers can upload their own community images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Customers can remove their own community images" on storage.objects;
create policy "Customers can remove their own community images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'community-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

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

notify pgrst, 'reload schema';

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.store_products (
  id text primary key,
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  old_price integer check (old_price is null or old_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  sold integer not null default 0 check (sold >= 0),
  tag text not null default '',
  color text not null default 'sand',
  emoji text not null default '👕',
  image text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.store_events (
  id text primary key,
  date text not null,
  time text not null,
  type text not null,
  title text not null,
  location text not null,
  image text not null,
  description text not null,
  agenda jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.store_orders (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_data jsonb not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.store_products (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default 'Pembeli',
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 1 and 1000),
  image_url text not null default '',
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.product_reviews
  add column if not exists author_name text not null default 'Pembeli';

create or replace function public.set_product_review_author_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(nullif(profile.full_name, ''), 'Pembeli Nusa')
    into new.author_name
  from public.profiles as profile
  where profile.id = new.user_id;
  if not found then
    new.author_name := 'Pembeli Nusa';
  end if;
  if new.author_name is null or new.author_name = '' then
    new.author_name := 'Pembeli Nusa';
  end if;
  return new;
end;
$$;

revoke all on function public.set_product_review_author_name()
  from public, anon, authenticated;

drop trigger if exists set_product_review_author_name
  on public.product_reviews;
create trigger set_product_review_author_name
  before insert on public.product_reviews
  for each row execute function public.set_product_review_author_name();

alter table public.store_orders
  drop constraint if exists store_orders_status_check;

alter table public.store_orders
  add constraint store_orders_status_check
  check (status in ('pending', 'approved', 'packed', 'shipped', 'delivered', 'rejected'));

insert into public.store_orders (id, user_id, order_data, status)
select
  legacy_order.order_data ->> 'id',
  customer_data.user_id,
  legacy_order.order_data,
  'approved'
from public.customer_data as customer_data
cross join lateral jsonb_array_elements(
  case
    when jsonb_typeof(customer_data.data -> 'orders') = 'array'
      then customer_data.data -> 'orders'
    else '[]'::jsonb
  end
) as legacy_order(order_data)
where nullif(legacy_order.order_data ->> 'id', '') is not null
on conflict (id) do nothing;

create index if not exists store_orders_created_at_idx
  on public.store_orders (created_at desc);

alter table public.store_admins enable row level security;
alter table public.store_products enable row level security;
alter table public.store_events enable row level security;
alter table public.store_orders enable row level security;

revoke all on public.store_admins from anon, authenticated;
revoke all on public.store_products from anon, authenticated;
revoke all on public.store_events from anon, authenticated;
revoke all on public.store_orders from anon, authenticated;

grant select on public.store_admins to authenticated;
grant select on public.store_products, public.store_events to anon, authenticated;
grant insert, update, delete on public.store_products, public.store_events to authenticated;
grant select, insert on public.store_orders to authenticated;
grant update (status) on public.store_orders to authenticated;

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.store_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_store_admin() from public, anon;
grant execute on function public.is_store_admin() to authenticated;

create or replace function public.can_review_store_product(p_product_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.store_orders as store_order
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(store_order.order_data -> 'items') = 'array'
          then store_order.order_data -> 'items'
        else '[]'::jsonb
      end
    ) as ordered_item(item)
    where store_order.user_id = (select auth.uid())
      and store_order.status in ('approved', 'packed', 'shipped', 'delivered')
      and ordered_item.item ->> 'id' = p_product_id
  );
$$;

revoke all on function public.can_review_store_product(text) from public, anon;
grant execute on function public.can_review_store_product(text) to authenticated;

insert into public.community_rooms (id, name, description, mark)
values
  ('outfit-harian', 'Outfit harian', 'Ide gaya yang nyaman dipakai sehari-hari.', '01'),
  ('mix-match', 'Mix & match', 'Padu padan warna, tekstur, dan favoritmu.', '02'),
  ('local-brand', 'Brand lokal', 'Kenalkan karya dan label lokal pilihanmu.', '03'),
  ('sustainable-style', 'Gaya berkelanjutan', 'Thrift, rawat pakaian, dan pakai ulang.', '04'),
  ('event-nusa', 'Event Nusa', 'Cerita pertemuan, workshop, dan pop-up.', '05')
on conflict (id) do nothing;

alter table public.community_rooms enable row level security;
alter table public.product_reviews enable row level security;

revoke all on public.community_rooms from anon, authenticated;
revoke all on public.product_reviews from anon, authenticated;

grant select on public.community_rooms to anon, authenticated;
grant insert, update, delete on public.community_rooms to authenticated;
grant select on public.product_reviews to anon, authenticated;
grant insert on public.product_reviews to authenticated;

drop policy if exists "Admins can read all customer profiles" on public.profiles;
create policy "Admins can read all customer profiles"
  on public.profiles for select to authenticated
  using ((select public.is_store_admin()));

drop policy if exists "Anyone can read community rooms" on public.community_rooms;
create policy "Anyone can read community rooms"
  on public.community_rooms for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage community rooms" on public.community_rooms;
create policy "Admins can manage community rooms"
  on public.community_rooms for all to authenticated
  using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

drop policy if exists "Anyone can read product reviews" on public.product_reviews;
create policy "Anyone can read product reviews"
  on public.product_reviews for select to anon, authenticated
  using (true);

drop policy if exists "Verified buyers can review purchased products" on public.product_reviews;
create policy "Verified buyers can review purchased products"
  on public.product_reviews for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select public.can_review_store_product(product_id))
  );

drop policy if exists "Admins can read their own store role" on public.store_admins;
create policy "Admins can read their own store role"
  on public.store_admins for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Anyone can read store products" on public.store_products;
create policy "Anyone can read store products"
  on public.store_products for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage store products" on public.store_products;
create policy "Admins can manage store products"
  on public.store_products for all to authenticated
  using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

drop policy if exists "Anyone can read store events" on public.store_events;
create policy "Anyone can read store events"
  on public.store_events for select to anon, authenticated
  using (true);

drop policy if exists "Admins can manage store events" on public.store_events;
create policy "Admins can manage store events"
  on public.store_events for all to authenticated
  using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

drop policy if exists "Customers and admins can read store orders" on public.store_orders;
create policy "Customers and admins can read store orders"
  on public.store_orders for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_store_admin())
  );

drop policy if exists "Customers can create their own store orders" on public.store_orders;
create policy "Customers can create their own store orders"
  on public.store_orders for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Admins can update store order status" on public.store_orders;
create policy "Admins can update store order status"
  on public.store_orders for update to authenticated
  using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

notify pgrst, 'reload schema';
