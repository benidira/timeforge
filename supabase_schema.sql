-- Run this in your Supabase SQL Editor

-- 1. Workspaces Table
CREATE TABLE public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspace Members (For Team Sharing)
CREATE TABLE public.workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 3. Vault Items (Shared Prompts, Scripts, Regex)
CREATE TABLE public.vault_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'prompt', 'regex', 'snippet', 'workflow'
  content TEXT NOT NULL,
  language TEXT, -- e.g., 'python', 'json', 'typescript'
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. API Keys (For CLI and API access)
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policies for Workspaces
CREATE POLICY "Users can view workspaces they belong to" 
ON public.workspaces FOR SELECT 
USING (
  id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR owner_id = auth.uid()
);

CREATE POLICY "Users can insert their own workspaces" 
ON public.workspaces FOR INSERT 
WITH CHECK (owner_id = auth.uid());

-- Policies for Vault Items
CREATE POLICY "Users can view vault items in their workspaces" 
ON public.vault_items FOR SELECT 
USING (
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
);

CREATE POLICY "Users can insert vault items to their workspaces" 
ON public.vault_items FOR INSERT 
WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  OR workspace_id IN (SELECT id FROM public.workspaces WHERE owner_id = auth.uid())
);

-- API Keys
CREATE POLICY "Users manage their own API keys" 
ON public.api_keys FOR ALL 
USING (user_id = auth.uid());
