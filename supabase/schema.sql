-- AETHON AI OS — Expanded Supabase Schema
-- Run this once in your Supabase SQL editor
-- This schema supports the full AI DevOS platform

-- Enable extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. USER SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- User profiles (extends Clerk)
create table if not exists user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique,
  email text,
  full_name text,
  avatar_url text,
  bio text,
  timezone text default 'UTC',
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User API keys (for external integrations)
create table if not exists user_api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  key_prefix text not null,
  encrypted_key text not null,
  permissions text[] default '{}',
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

-- User usage tracking
create table if not exists user_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  resource_type text not null, -- 'api_calls', 'tokens', 'storage', 'deployments'
  count int default 0,
  period_start date not null,
  period_end date not null,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. MEMORIES (Vector Store for AI)
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists memories (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(768),
  memory_type text default 'general', -- 'general', 'project', 'code', 'preference'
  importance float default 0.5,
  created_at timestamptz default now()
);

create index if not exists memories_user_id_idx on memories(user_id);
create index if not exists memories_type_idx on memories(memory_type);
create index if not exists memories_embedding_idx on memories using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- RPC: similarity search
create or replace function match_memories(
  p_user_id text,
  query_embedding vector(768),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. AI AGENTS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists aethon_agents (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text,
  description text,
  avatar_url text,
  status text not null default 'idle' check (status in ('idle', 'busy', 'error', 'offline')),
  current_task_id uuid,
  capabilities text[] default '{}',
  tools text[] default '{}',
  system_prompt text,
  model_provider text default 'gemini',
  model_name text default 'models/gemini-1.5-pro-latest',
  temperature float default 0.7,
  max_tokens int default 8192,
  last_seen timestamptz default now(),
  created_at timestamptz default now()
);

-- Seed default agents
insert into aethon_agents (name, display_name, description, capabilities, tools) values
  ('AETHON-Core', 'AETHON Core', 'Main AI agent for general tasks', array['chat', 'reasoning', 'planning', 'web_search', 'memory'], array['googleSearch', 'saveMemory', 'recallMemory']),
  ('AETHON-Coder', 'AETHON Coder', 'Specialized in code writing and editing', array['code', 'file_system', 'terminal', 'github'], array['readFile', 'writeFile', 'listDirectory', 'runCommand', 'githubWriteFile', 'githubOpenPR']),
  ('AETHON-Search', 'AETHON Search', 'Research and data collection agent', array['web_search', 'data_collection', 'analysis'], array['googleSearch']),
  ('AETHON-Deploy', 'AETHON Deploy', 'Deployment and DevOps agent', array['vercel_deploy', 'github_pr', 'deployment'], array['vercelDeploy', 'vercelListDeployments'])
on conflict (name) do nothing;

-- Agent tasks
create table if not exists agent_tasks (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references aethon_agents(id) on delete cascade,
  user_id text not null,
  title text not null,
  description text,
  task_type text not null, -- 'code', 'research', 'deploy', 'chat', 'automation'
  priority int default 0,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'error', 'cancelled')),
  input_data jsonb default '{}',
  output_data jsonb default '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Agent memory (per-agent context)
create table if not exists agent_memory (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references aethon_agents(id) on delete cascade,
  user_id text not null,
  context_type text not null, -- 'conversation', 'task', 'system'
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Agent logs
create table if not exists agent_logs (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references aethon_agents(id) on delete cascade,
  user_id text not null,
  action text not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. TASK QUEUE
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists aethon_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text not null,
  description text,
  task_type text not null default 'general', -- 'general', 'code', 'research', 'deploy', 'automation'
  priority int not null default 0,
  status text not default 'queued' check (status in ('queued', 'running', 'done', 'error', 'cancelled')),
  assigned_agent text,
  input_data jsonb default '{}',
  result text,
  error_msg text,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists aethon_tasks_user_priority_idx on aethon_tasks(user_id, priority desc);
create index if not exists aethon_tasks_status_idx on aethon_tasks(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. PROJECTS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  description text,
  status text default 'active' check (status in ('active', 'archived', 'deleted')),
  visibility text default 'private' check (visibility in ('private', 'team', 'public')),
  tech_stack text[] default '{}',
  repo_url text,
  live_url text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project members
create table if not exists project_members (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id text not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz default now()
);

-- Project activity
create table if not exists project_activity (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id text not null,
  action text not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. CODE SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- Repositories (GitHub integration)
create table if not exists repositories (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  full_name text,
  description text,
  language text,
  is_private boolean default false,
  repo_id text,
  default_branch text default 'main',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Code files (for AI analysis)
create table if not exists code_files (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  user_id text not null,
  file_path text not null,
  content text,
  language text,
  line_count int,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Commits
create table if not exists commits (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  user_id text not null,
  sha text not null,
  message text,
  author text,
  additions int default 0,
  deletions int default 0,
  created_at timestamptz default now()
);

-- Branches
create table if not exists branches (
  id uuid primary key default uuid_generate_v4(),
  repository_id uuid references repositories(id) on delete cascade,
  name text not null,
  is_default boolean default false,
  last_commit_sha text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. AI MODELS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists ai_models (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text,
  provider text not null, -- 'google', 'openai', 'anthropic', 'local'
  model_id text not null,
  description text,
  capabilities text[] default '{}',
  context_window int,
  max_output_tokens int,
  pricing_input float,
  pricing_output float,
  is_active boolean default true,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Seed default models
insert into ai_models (name, display_name, provider, model_id, capabilities, context_window, max_output_tokens) values
  ('gemini-pro', 'Gemini 1.5 Pro', 'google', 'models/gemini-1.5-pro-latest', array['chat', 'code', 'vision', 'search'], 1000000, 8192),
  ('gemini-flash', 'Gemini 1.5 Flash', 'google', 'models/gemini-1.5-flash-latest', array['chat', 'code', 'vision', 'search'], 1000000, 8192),
  ('gemini-pro-vision', 'Gemini Pro Vision', 'google', 'models/gemini-1.5-pro-vision-preview', array['chat', 'code', 'vision'], 1000000, 4096)
on conflict (name) do nothing;

-- Model usage tracking
create table if not exists model_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  model_name text not null,
  provider text not null,
  input_tokens int default 0,
  output_tokens int default 0,
  latency_ms int,
  cost float,
  period date not null,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. KNOWLEDGE BASE
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists knowledge_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text not null,
  content text,
  source text, -- 'upload', 'web', 'chat', 'manual'
  source_url text,
  file_type text,
  embedding vector(768),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists knowledge_embeddings_idx on knowledge_documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Knowledge sources
create table if not exists knowledge_sources (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  source_type text not null, -- 'website', 'github', 'notion', 'file'
  config jsonb not null,
  last_sync_at timestamptz,
  status text default 'active',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. AUTOMATION / WORKFLOWS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists workflows (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  description text,
  trigger_type text not null, -- 'schedule', 'webhook', 'event'
  trigger_config jsonb default '{}',
  steps jsonb not null default '[]',
  is_active boolean default true,
  last_run_at timestamptz,
  run_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workflow runs
create table if not exists workflow_runs (
  id uuid primary key default uuid_generate_v4(),
  workflow_id uuid references workflows(id) on delete cascade,
  status text not null default 'pending',
  input_data jsonb default '{}',
  output_data jsonb default '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Scheduled tasks
create table if not exists schedules (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  cron_expression text not null,
  action_type text not null, -- 'task', 'workflow', 'reminder'
  action_config jsonb not null,
  is_active boolean default true,
  last_run_at timestamptz,
  next_run_at timestamptz,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. PLUGINS / MARKETPLACE
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists plugins (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  display_name text,
  description text,
  version text,
  author text,
  category text, -- 'productivity', 'ai', 'integration', 'utility'
  icon_url text,
  homepage_url text,
  is_official boolean default false,
  is_premium boolean default false,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Plugin installations
create table if not exists plugin_installs (
  id uuid primary key default uuid_generate_v4(),
  plugin_id uuid references plugins(id) on delete cascade,
  user_id text not null,
  config jsonb default '{}',
  is_enabled boolean default true,
  installed_at timestamptz default now()
);

-- Plugin settings per user
create table if not exists plugin_settings (
  id uuid primary key default uuid_generate_v4(),
  plugin_id uuid references plugins(id) on delete cascade,
  user_id text not null,
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. STORAGE
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists uploads (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  file_name text not null,
  file_type text,
  file_size int,
  storage_path text not null,
  storage_provider text default 'local', -- 'local', 's3', 'supabase'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Backups
create table if not exists backups (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  backup_type text not null, -- 'manual', 'automatic'
  storage_path text not null,
  size_bytes int,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. ANALYTICS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists analytics_events (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  event_type text not null,
  event_data jsonb default '{}',
  session_id text,
  user_agent text,
  ip_hash text,
  created_at timestamptz default now()
);

-- Usage stats (aggregated)
create table if not exists usage_stats (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  metric_type text not null, -- 'api_calls', 'tokens', 'storage', 'agents', 'tasks'
  metric_value float not null,
  period date not null,
  created_at timestamptz default now()
);

-- Agent performance
create table if not exists agent_performance (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references aethon_agents(id) on delete cascade,
  metric_type text not null,
  metric_value float not null,
  period date not null,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. CHAT HISTORY
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists chat_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  session_id text not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  model_provider text,
  model_name text,
  tool_calls jsonb,
  token_count int,
  latency_ms int,
  created_at timestamptz default now()
);

create index if not exists chat_messages_session_idx on chat_messages(user_id, session_id, created_at desc);

-- Chat sessions
create table if not exists chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text,
  agent_id uuid references aethon_agents(id),
  model_provider text,
  model_name text,
  message_count int default 0,
  last_message_at timestamptz,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 14. API SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- API requests log
create table if not exists api_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id text,
  endpoint text not null,
  method text not null,
  status_code int,
  latency_ms int,
  request_data jsonb default '{}',
  response_size int,
  created_at timestamptz default now()
);

-- Webhooks
create table if not exists webhooks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  url text not null,
  events text[] not null,
  secret text,
  is_active boolean default true,
  last_triggered_at timestamptz,
  created_at timestamptz default now()
);

-- Webhook logs
create table if not exists webhook_logs (
  id uuid primary key default uuid_generate_v4(),
  webhook_id uuid references webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  response_status int,
  response_body text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 15. USER SETTINGS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null unique,
  backend_endpoint text,
  model_provider text default 'gemini',
  model_name text default 'models/gemini-1.5-pro-latest',
  temperature float default 0.7,
  max_tokens int default 8192,
  enable_search boolean default true,
  enable_deploy boolean default false,
  enable_self_mutation boolean default false,
  enable_terminal boolean default false,
  enable_code_execution boolean default false,
  default_agent text,
  theme text default 'dark',
  language text default 'en',
  notifications jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 16. AUDIT LOGS
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists aethon_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  agent_id uuid references aethon_agents(id) on delete set null,
  tool_name text,
  action text not null,
  args jsonb default '{}',
  status text not null check (status in ('ok', 'error')),
  latency_ms int,
  error_msg text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create index if not exists aethon_logs_user_idx on aethon_logs(user_id, created_at desc);
create index if not exists aethon_logs_agent_idx on aethon_logs(agent_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. WEBHOOKS SYSTEM
-- ═══════════════════════════════════════════════════════════════════════════════

-- Webhooks for external integrations
create table if not exists aethon_webhooks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  url text not null,
  events text[] not null,
  secret text not null,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Webhook delivery logs
create table if not exists aethon_webhook_logs (
  id uuid primary key default uuid_generate_v4(),
  webhook_id uuid references aethon_webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb,
  status text not null check (status in ('success', 'failed', 'pending')),
  response_code int,
  error_message text,
  attempts int default 0,
  created_at timestamptz default now()
);

create index if not exists aethon_webhooks_user_idx on aethon_webhooks(user_id);
create index if not exists aethon_webhook_logs_webhook_idx on aethon_webhook_logs(webhook_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. CUSTOM AGENTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Custom agent configurations
create table if not exists aethon_custom_agents (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  description text,
  avatar_url text,
  system_prompt text not null,
  tools jsonb default '[]',
  config jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists aethon_custom_agents_user_idx on aethon_custom_agents(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- User notifications
create table if not exists aethon_notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  type text not null,
  title text not null,
  message text,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists aethon_notifications_user_idx on aethon_notifications(user_id, read, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. FILES
-- ═══════════════════════════════════════════════════════════════════════════════

-- File storage metadata
create table if not exists aethon_files (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  name text not null,
  path text not null,
  size int,
  mime_type text,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists aethon_files_user_idx on aethon_files(user_id, created_at desc);
