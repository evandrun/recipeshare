create extension if not exists pgcrypto;

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (length(trim(author_name)) > 0),
  title text not null check (length(trim(title)) > 0),
  cuisine text not null check (cuisine in ('American','Arabic','Chinese','German','Indian','Iranian','Italian','Japanese','Mexican','Other')),
  category text not null check (category in ('Breakfast','Main Dish','Fast Food','Soup','Salad','Dessert','Snack','Drink')),
  ingredients text[] not null check (cardinality(ingredients) > 0),
  steps text[] not null check (cardinality(steps) > 0),
  prep_minutes integer not null check (prep_minutes > 0),
  image_url text not null check (image_url ~ '^https?://'),
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  guest_id text,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  check ((user_id is not null and guest_id is null) or (user_id is null and guest_id is not null))
);

create unique index if not exists ratings_one_per_user on public.ratings(recipe_id, user_id) where user_id is not null;
create unique index if not exists ratings_one_per_guest on public.ratings(recipe_id, guest_id) where guest_id is not null;
create index if not exists recipes_created_at_idx on public.recipes(created_at desc);

alter table public.recipes enable row level security;
alter table public.ratings enable row level security;

drop policy if exists "Recipes are public" on public.recipes;
create policy "Recipes are public" on public.recipes for select using (true);
drop policy if exists "Visitors can add recipes" on public.recipes;
create policy "Visitors can add recipes" on public.recipes for insert to anon, authenticated
  with check (owner_id is null or owner_id = (select auth.uid()));
drop policy if exists "Owners can edit recipes" on public.recipes;
create policy "Owners can edit recipes" on public.recipes for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "Owners can delete recipes" on public.recipes;
create policy "Owners can delete recipes" on public.recipes for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Ratings are public" on public.ratings;
create policy "Ratings are public" on public.ratings for select using (true);
drop policy if exists "Visitors can add ratings" on public.ratings;
create policy "Visitors can add ratings" on public.ratings for insert to anon, authenticated
  with check (
    (user_id is null and guest_id is not null)
    or (user_id = (select auth.uid()) and guest_id is null)
  );
drop policy if exists "Users can replace their rating" on public.ratings;
create policy "Users can replace their rating" on public.ratings for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and guest_id is null);
drop policy if exists "Users can remove their rating" on public.ratings;
create policy "Users can remove their rating" on public.ratings for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.save_rating(p_recipe_id uuid, p_rating integer, p_guest_id text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be from 1 to 5';
  end if;
  if current_user_id is null then
    if p_guest_id is null or length(p_guest_id) < 12 then
      raise exception 'A guest rating id is required';
    end if;
    insert into public.ratings (recipe_id, user_id, guest_id, rating)
      values (p_recipe_id, null, p_guest_id, p_rating)
      on conflict (recipe_id, guest_id) where guest_id is not null
      do update set rating = excluded.rating, created_at = now();
  else
    if exists (select 1 from public.recipes where id = p_recipe_id and owner_id = current_user_id) then
      raise exception 'Authors cannot rate their own recipes';
    end if;
    insert into public.ratings (recipe_id, user_id, guest_id, rating)
      values (p_recipe_id, current_user_id, null, p_rating)
      on conflict (recipe_id, user_id) where user_id is not null
      do update set rating = excluded.rating, created_at = now();
  end if;
end;
$$;
revoke all on function public.save_rating(uuid, integer, text) from public;
grant execute on function public.save_rating(uuid, integer, text) to anon, authenticated;

-- Public food photos use Supabase Storage. Only authenticated users may upload;
-- public reads let recipe cards display an image without signing in.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-photos', 'recipe-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "Recipe photos are public" on storage.objects;
create policy "Recipe photos are public" on storage.objects for select
  using (bucket_id = 'recipe-photos');
drop policy if exists "Signed-in users upload recipe photos" on storage.objects;
create policy "Signed-in users upload recipe photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Users manage their recipe photos" on storage.objects;
create policy "Users manage their recipe photos" on storage.objects for delete to authenticated
  using (bucket_id = 'recipe-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
