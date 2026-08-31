-- ========================================================
-- Mili ❤️ Universe - Supabase Database Schema
-- Copy and paste this into Supabase SQL Editor and click RUN
-- ========================================================

-- 1. Messages Table (for notes sent by Mili to Sukhen)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL DEFAULT 'Mili',
    message TEXT NOT NULL,
    mood TEXT DEFAULT '❤️',
    read BOOLEAN DEFAULT FALSE,
    reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table (for websites & creations added in Admin)
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    detailed_story TEXT,
    category TEXT DEFAULT 'Websites',
    url TEXT NOT NULL,
    github_url TEXT,
    thumbnail TEXT,
    technologies TEXT[] DEFAULT ARRAY['React', 'Next.js', 'Tailwind CSS'],
    featured BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Device Sessions Table (for active device tracking)
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL DEFAULT 'Mili',
    user_role TEXT NOT NULL DEFAULT 'mili',
    avatar TEXT DEFAULT '👑',
    device_name TEXT NOT NULL,
    user_agent TEXT,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Python Turtle Creations Table
CREATE TABLE IF NOT EXISTS public.turtle_creations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    inspiration TEXT,
    category TEXT DEFAULT 'Mathematical Geometry',
    artwork_image TEXT,
    python_script TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY['Python Turtle', 'Generative Art'],
    featured BOOLEAN DEFAULT TRUE,
    canvas_drawing_type TEXT DEFAULT 'mandala',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Love Notes Table (for unlimited love letters & notes created by Sukhen)
CREATE TABLE IF NOT EXISTS public.love_notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    snippet TEXT NOT NULL,
    full_message TEXT NOT NULL,
    date TEXT DEFAULT 'A heartfelt reminder',
    mood_tag TEXT DEFAULT 'deep',
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and allow public read/write for this app
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turtle_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

-- Policies for public access (so Next.js API can read and write with anon key)
CREATE POLICY "Allow all operations on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on device_sessions" ON public.device_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on turtle_creations" ON public.turtle_creations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on love_notes" ON public.love_notes FOR ALL USING (true) WITH CHECK (true);

