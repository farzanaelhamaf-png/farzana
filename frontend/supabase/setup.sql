-- Kjør i Supabase SQL Editor én gang.
create table if not exists public.site_content (
  id integer primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.site_content (id, content) values (1, '{}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

create policy "Public can read published content" on public.site_content
for select to anon, authenticated using (true);
create policy "Admins can edit content" on public.site_content
for update to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
create policy "Admin can see own role" on public.admin_users
for select to authenticated using (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

create policy "Public can see site images" on storage.objects
for select to anon, authenticated using (bucket_id = 'site-images');
create policy "Admins can upload site images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'site-images' and
  exists (select 1 from public.admin_users where user_id = (select auth.uid()))
);

-- Etter at du har opprettet en bruker i Authentication > Users,
-- kjør denne kommandoen SEPARAT, og erstatt UUID med brukerens ID:
-- insert into public.admin_users (user_id) values ('DIN-BRUKER-UUID');
