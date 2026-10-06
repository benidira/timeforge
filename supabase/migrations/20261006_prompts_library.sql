-- Create Prompts Table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ai_model TEXT NOT NULL,
    role TEXT NOT NULL,
    title TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access to prompts" 
    ON public.prompts
    FOR SELECT 
    TO public
    USING (true);

-- Allow authenticated admins to insert/update (or we can use service_role key to bypass RLS)
-- Since the generation script will use service_role, it bypasses RLS anyway.

-- Create indexes for extremely fast search and filtering
CREATE INDEX IF NOT EXISTS idx_prompts_ai_model ON public.prompts (ai_model);
CREATE INDEX IF NOT EXISTS idx_prompts_role ON public.prompts (role);
-- Trigram index for fast text search on title and prompt_text (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_prompts_title_trgm ON public.prompts USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prompts_text_trgm ON public.prompts USING gin (prompt_text gin_trgm_ops);
