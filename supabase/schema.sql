-- AETHON AI OS — Supabase Schema
-- Run this once in your Supabase SQL editor

-- Enable pgvector extension
create extension if not exists vector;

-- ─────────────────────────────────────────────
-- 1. Memories (vector store for AI long-term memory)
-- ─────────────────────────────────────────────
create table if not exists memories (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  content     text not null,
  metadata    jsonb default '{}',
  embedding   vector(768),  -- Gemini text-embedding-004 outputs 768 dims
  created_at  timestamptz default now()
);

create index if not exists memories_user_id_idx on memories(user_id);
create index if not exists memories_embedding_idx on memories using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC: similarity search
create or replace function match_memories(
  p_user_id       text,
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count     int   default 5
)
returns table (
  id         uuid,
  content    text,
  metadata   jsonb,
  similarity float
)
language sql stable
as $$
  select
    m.id,
    m.content,
    m.metadata,
    1 - (m.embedding <=> query_embedding) as similarity
  from memories m
  where m.user_id = p_user_id
    and 1 - (m.embedding <=> query_embedding) > match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

-- ─────────────────────────────────────────────
-- 2. Audit Logs
-- ─────────────────────────────────────────────
create table if not exists aethon_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  tool_name   text not null,
  args        jsonb default '{}',
  status      text not null check (status in ('ok', 'error')),
  latency_ms  int,
  error_msg   text,
  created_at  timestamptz default now()
);

create index if not exists aethon_logs_user_id_idx on aethon_logs(user_id);
create index if not exists aethon_logs_created_at_idx on aethon_logs(created_at desc);

-- ─────────────────────────────────────────────
-- 3. Task Queue
-- ─────────────────────────────────────────────
create table if not exists aethon_tasks (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  title           text not null,
  description     text,
  priority        int not null default 0,
  status          text not null default 'queued' check (status in ('queued', 'running', 'done', 'error')),
  assigned_agent  text,
  result          text,
  error_msg       text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists aethon_tasks_user_id_priority_idx on aethon_tasks(user_id, priority desc);
create index if not exists aethon_tasks_status_idx on aethon_tasks(status);

-- ─────────────────────────────────────────────
-- 4. Agent Runtime State
-- ─────────────────────────────────────────────
create table if not exists aethon_agents (
  id              uuid primary key default gen_random_uuid(),
  name            text not null unique,
  status          text not null default 'idle' check (status in ('idle', 'busy', 'error')),
  current_task_id uuid references aethon_tasks(id) on delete set null,
  capabilities    text[] default '{}',
  last_seen       timestamptz default now(),
  created_at      timestamptz default now()
);

-- Seed default agents
insert into aethon_agents (name, capabilities) values
  ('AETHON-Core',    array['chat', 'reasoning', 'planning']),
  ('AETHON-Coder',   array['code', 'file_system', 'terminal']),
  ('AETHON-Search',  array['web_search', 'data_collection']),
  ('AETHON-Deploy',  array['vercel_deploy', 'github_pr'])
on conflict (name) do nothing;

-- ─────────────────────────────────────────────
-- 5. User Settings
-- ─────────────────────────────────────────────
create table if not exists user_settings (
  id                  uuid primary key default gen_random_uuid(),
  user_id             text not null unique,
  backend_endpoint    text,
  model_provider      text not null default 'gemini',
  model_name          text not null default 'models/gemini-1.5-pro-latest',
  temperature         float not null default 0.7,
  enable_search       boolean not null default true,
  enable_deploy       boolean not null default false,
  enable_self_mutation boolean not null default false,
  enable_terminal     boolean not null default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─────────────────────────────────────────────
-- 6. Chat History
-- ─────────────────────────────────────────────
create table if not exists chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  role        text not null check (role in ('user', 'assistant', 'tool')),
  content     text not null,
  tool_calls  jsonb,
  created_at  timestamptz default now()
);

create index if not exists chat_messages_user_id_idx on chat_messages(user_id, created_at desc);
