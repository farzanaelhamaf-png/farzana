create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  topic text not null check (char_length(topic) between 2 and 100),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new','read','replied'))
);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant select, update on public.contact_messages to authenticated;
-- Admins may read and change status, while public visitors cannot access this table.
create policy "Admins read contact messages" on public.contact_messages
  for select to authenticated using (
    exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );
create policy "Admins update contact messages" on public.contact_messages
  for update to authenticated using (
    exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
  );
