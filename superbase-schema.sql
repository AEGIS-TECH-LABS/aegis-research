-- API keys table (for personal use + anyone you invite)
create table if not exists api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  key_hash text not null unique,
  key_prefix text not null,
  label text,
  tier text default 'personal',
  requests_today int default 0,
  last_reset timestamptz default now(),
  revoked boolean default false,
  created_at timestamptz default now()
);

-- Usage logs
create table if not exists usage_logs (
  id bigserial primary key,
  key_hash text,
  user_id uuid,
  query text,
  source_used text,
  duration_ms int,
  status text,
  created_at timestamptz default now()
);

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  tier text default 'personal',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, tier)
  values (new.id, new.email, 'personal');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Indexes
create index if not exists idx_api_keys_hash on api_keys(key_hash);
create index if not exists idx_usage_logs_key on usage_logs(key_hash);
