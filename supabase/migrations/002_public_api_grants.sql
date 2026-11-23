-- Supabase projects may not grant table access to API roles by default.
-- These grants complement the row-level security policies from migration 001.
grant usage on schema public to anon, authenticated;
grant select, insert on public.recipes, public.ratings to anon, authenticated;
grant update, delete on public.recipes, public.ratings to authenticated;
