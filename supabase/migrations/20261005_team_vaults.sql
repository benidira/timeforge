-- Migration: Team Shared Vaults (Zero-Knowledge)
-- Description: Adds tables for teams, members, and encrypted team vaults with strict RLS.

CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    public_key TEXT NOT NULL, -- User's RSA-OAEP Public Key (Base64 SPKI)
    encrypted_team_key TEXT NOT NULL, -- AES-GCM Team Key encrypted with User's Public Key
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

CREATE TABLE public.team_vaults (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Production", "Staging"
    encrypted_payload TEXT NOT NULL, -- The AES-GCM encrypted .env content
    iv TEXT NOT NULL, -- The Initialization Vector (Base64)
    version INTEGER NOT NULL DEFAULT 1,
    updated_by UUID NOT NULL REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(team_id, name)
);

-- Row Level Security (RLS)

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_vaults ENABLE ROW LEVEL SECURITY;

-- 1. Teams Policy: Users can view teams they are a member of
CREATE POLICY "Users can view their teams" ON public.teams
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = public.teams.id AND user_id = auth.uid()
        )
    );

-- 2. Team Members Policy: Users can view members of their teams
CREATE POLICY "Users can view team members" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = public.team_members.team_id AND tm.user_id = auth.uid()
        )
    );

-- 3. Team Vaults Policy: Users can view and update vaults of their teams
CREATE POLICY "Users can view team vaults" ON public.team_vaults
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = public.team_vaults.team_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert/update team vaults" ON public.team_vaults
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members 
            WHERE team_id = public.team_vaults.team_id AND user_id = auth.uid()
        )
    );

-- Allow inserting into teams if authenticated (creator automatically becomes owner via application logic)
CREATE POLICY "Users can create teams" ON public.teams
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow inserting members if you are an admin/owner (simplification for now: anyone in team can invite, or check role)
CREATE POLICY "Users can invite members" ON public.team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.team_id = public.team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
        OR 
        -- Allow the creator to add themselves as the first member
        EXISTS (
            SELECT 1 FROM public.teams t 
            WHERE t.id = public.team_members.team_id AND t.created_by = auth.uid()
        )
    );
