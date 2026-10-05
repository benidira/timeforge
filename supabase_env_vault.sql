-- Run this in your Supabase SQL Editor to add the Env Vault support

CREATE TABLE public.env_vaults (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  encrypted_payload TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Note: No RLS needed for now since decryption happens completely locally and anyone with the ID AND the password can decrypt. 
-- However, we can enforce read-only public access.
ALTER TABLE public.env_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert" 
ON public.env_vaults FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read" 
ON public.env_vaults FOR SELECT 
USING (true);
