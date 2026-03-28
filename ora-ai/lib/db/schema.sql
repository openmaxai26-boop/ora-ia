-- ============================================================
-- ORA AI — Schéma Supabase PostgreSQL
-- À exécuter dans l'éditeur SQL du dashboard Supabase
-- https://supabase.com/dashboard -> SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- Extensions
-- ------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
create type agent_id as enum ('teva', 'hina', 'reva', 'manu', 'ari');

create type task_status as enum ('pending', 'running', 'success', 'failed', 'skipped');

create type task_type as enum (
  'social_post',
  'social_story',
  'customer_reply',
  'appointment',
  'seo_article',
  'job_post',
  'cv_analysis',
  'prospect_message',
  'prospect_followup'
);

create type user_plan as enum ('starter', 'pro', 'business');

create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');

create type platform as enum (
  'facebook',
  'instagram',
  'tiktok',
  'linkedin',
  'whatsapp',
  'messenger',
  'gmail',
  'google_calendar',
  'notion',
  'stripe',
  'wordpress',
  'wix',
  'shopify'
);

create type message_platform as enum ('whatsapp', 'messenger');

-- ------------------------------------------------------------
-- Trigger helper : updated_at auto
-- ------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE : users
-- Étendue du profil Supabase Auth (auth.users)
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "Users can read own user" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own user" on public.users
  for update using (auth.uid() = id);

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Trigger : créer la ligne user auto à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TABLE : profiles
-- Informations entreprise de l'utilisateur
-- (séparée de users pour flexibilité)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null unique references public.users(id) on delete cascade,
  entreprise  text not null default '',
  secteur     text not null default 'Commerce & Artisanat',
  island      text not null default 'Tahiti',
  email       text not null default '',
  whatsapp    text not null default '',
  langue      text not null default 'Français'
              check (langue in ('Français', 'Français & Tahitien', 'English')),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = user_id);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Trigger : créer le profil auto à l'inscription
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_user_created_profile
  after insert on public.users
  for each row execute function public.handle_new_profile();

-- ============================================================
-- TABLE : user_notifications
-- Préférences de notification par utilisateur
-- ============================================================
create table if not exists public.user_notifications (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null unique references public.users(id) on delete cascade,
  email              boolean not null default true,
  whatsapp           boolean not null default true,
  rapport_quotidien  boolean not null default true,
  rapport_hebdo      boolean not null default true,
  alertes_erreur     boolean not null default true,
  updated_at         timestamptz not null default now()
);

alter table public.user_notifications enable row level security;
create policy "Users can manage own notifications" on public.user_notifications
  for all using (auth.uid() = user_id);

create trigger user_notifications_updated_at
  before update on public.user_notifications
  for each row execute function public.handle_updated_at();

-- Trigger : créer les prefs de notification auto à l'inscription
create or replace function public.handle_new_user_notifications()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_notifications (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_user_created_notifications
  after insert on public.users
  for each row execute function public.handle_new_user_notifications();

-- ============================================================
-- TABLE : subscriptions
-- Abonnements Stripe des utilisateurs
-- ============================================================
create table if not exists public.subscriptions (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references public.users(id) on delete cascade,
  plan                     user_plan not null default 'starter',
  status                   subscription_status not null default 'active',
  price_xpf                integer not null default 4900,
  stripe_customer_id       text,
  stripe_subscription_id   text unique,
  stripe_price_id          text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  canceled_at              timestamptz,
  trial_start              timestamptz,
  trial_end                timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Trigger : créer un abonnement starter par défaut à l'inscription
create or replace function public.handle_new_subscription()
returns trigger language plpgsql security definer as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'starter', 'active')
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_user_created_subscription
  after insert on public.users
  for each row execute function public.handle_new_subscription();

-- ============================================================
-- TABLE : tasks
-- Tâches exécutées par les agents IA
-- ============================================================
create table if not exists public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  agent_id      agent_id not null,
  type          task_type not null,
  status        task_status not null default 'pending',
  platform      platform not null,
  title         text not null,
  description   text,
  scheduled_at  timestamptz,
  executed_at   timestamptz,
  error         text,
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_tasks_user_id    on public.tasks(user_id);
create index idx_tasks_agent_id   on public.tasks(agent_id);
create index idx_tasks_status     on public.tasks(status);
create index idx_tasks_created_at on public.tasks(created_at desc);

alter table public.tasks enable row level security;
create policy "Users can read own tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can create own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABLE : integrations
-- Connexions aux plateformes tierces
-- ============================================================
create table if not exists public.integrations (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  platform      platform not null,
  label         text not null,
  icon          text not null default '',
  connected     boolean not null default false,
  access_token  text,        -- chiffré via pgcrypto en prod
  refresh_token text,
  expires_at    timestamptz,
  account_name  text,
  account_id    text,
  scopes        text[],
  connected_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, platform)
);

alter table public.integrations enable row level security;
create policy "Users can manage own integrations" on public.integrations
  for all using (auth.uid() = user_id);

create trigger integrations_updated_at
  before update on public.integrations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- TABLE : conversations
-- Historique des conversations Hina (SAV IA)
-- ============================================================
create table if not exists public.conversations (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  platform         message_platform not null,
  contact_id       text not null,   -- numéro E.164 ou PSID Facebook
  contact_name     text,
  history          jsonb not null default '[]',
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  unique (user_id, platform, contact_id)
);

create index idx_conversations_user_id on public.conversations(user_id);
create index idx_conversations_contact on public.conversations(contact_id);
create index idx_conversations_last    on public.conversations(last_message_at desc);

alter table public.conversations enable row level security;
create policy "Users can manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

-- Fonction : append atomique d'un message dans history (JSONB)
create or replace function public.append_conversation_message(
  p_conversation_id uuid,
  p_role            text,
  p_content         text,
  p_at              text
) returns void language plpgsql security definer as $$
begin
  update public.conversations
  set
    history = history || jsonb_build_object(
      'role',    p_role,
      'content', p_content,
      'at',      p_at
    ),
    last_message_at = now()
  where id = p_conversation_id;
end;
$$;

-- ============================================================
-- TABLE : agent_stats
-- Statistiques agrégées par agent et par période
-- ============================================================
create table if not exists public.agent_stats (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.users(id) on delete cascade,
  agent_id              agent_id not null,
  period                text not null check (period in ('day', 'week', 'month')),
  tasks_total           integer not null default 0,
  tasks_success         integer not null default 0,
  tasks_failed          integer not null default 0,
  messages_handled      integer,
  posts_published       integer,
  prospects_contacted   integer,
  time_saved_minutes    integer not null default 0,
  created_at            timestamptz not null default now()
);

create index idx_agent_stats_user on public.agent_stats(user_id, agent_id, period);

alter table public.agent_stats enable row level security;
create policy "Users can read own stats" on public.agent_stats
  for select using (auth.uid() = user_id);

-- ============================================================
-- FONCTION : get_dashboard_stats
-- Stats globales pour le dashboard principal
-- ============================================================
create or replace function public.get_dashboard_stats(p_user_id uuid)
returns table (
  active_agents    bigint,
  total_tasks      bigint,
  messages_handled bigint,
  time_saved_hours numeric
)
language plpgsql security definer as $$
begin
  return query
  select
    (select count(distinct agent_id)
      from public.tasks
      where user_id = p_user_id
        and status = 'success'
        and created_at > now() - interval '30 days'
    ) as active_agents,
    (select count(*)
      from public.tasks
      where user_id = p_user_id
    ) as total_tasks,
    (select count(*)
      from public.tasks
      where user_id = p_user_id
        and type = 'customer_reply'
        and status = 'success'
    ) as messages_handled,
    (select coalesce(sum(time_saved_minutes), 0) / 60.0
      from public.agent_stats
      where user_id = p_user_id
    ) as time_saved_hours;
end;
$$;

-- ============================================================
-- FONCTION : get_user_plan
-- Retourne le plan actif de l'utilisateur
-- ============================================================
create or replace function public.get_user_plan(p_user_id uuid)
returns table (
  plan    user_plan,
  status  subscription_status,
  label   text,
  price   integer
)
language plpgsql security definer as $$
begin
  return query
  select
    s.plan,
    s.status,
    case s.plan
      when 'starter'  then 'Starter'
      when 'pro'      then 'Pro'
      when 'business' then 'Business'
    end as label,
    case s.plan
      when 'starter'  then 4900
      when 'pro'      then 9900
      when 'business' then 24900
    end as price
  from public.subscriptions s
  where s.user_id = p_user_id
    and s.status in ('active', 'trialing')
  order by s.created_at desc
  limit 1;
end;
$$;

-- ============================================================
-- VUES : pour simplifier les requêtes courantes
-- ============================================================

-- Vue : profil complet utilisateur (users + profiles + subscription)
create or replace view public.user_full_profile as
select
  u.id,
  u.email,
  p.entreprise,
  p.secteur,
  p.island,
  p.whatsapp,
  p.langue,
  p.avatar_url,
  s.plan,
  s.status as subscription_status,
  u.created_at
from public.users u
left join public.profiles p on p.user_id = u.id
left join public.subscriptions s on s.user_id = u.id and s.status in ('active', 'trialing');

-- RLS sur la vue
alter view public.user_full_profile owner to authenticated;
