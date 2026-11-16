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
  check (topic in ('outfit-harian', 'mix-match', 'local-brand', 'sustainable-style', 'event-nusa'));

create table if not exists public.community_likes (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
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
grant update (full_name) on public.profiles to authenticated;
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
