-- ========================================================
-- Mili ❤️ Universe - Supabase Database Schema (SECURE)
-- Copy and paste this into Supabase SQL Editor and click RUN
-- ========================================================

-- 1. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL DEFAULT 'Mili',
    message TEXT NOT NULL,
    mood TEXT DEFAULT '❤️',
    read BOOLEAN DEFAULT FALSE,
    reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
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
    theme_gradient TEXT,
    theme_accent TEXT,
    theme_badge TEXT,
    theme_border TEXT,
    theme_text_accent TEXT,
    theme_glow TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Device Sessions Table
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL DEFAULT 'Mili',
    user_role TEXT NOT NULL DEFAULT 'mili',
    user_email TEXT,
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

-- 5. Love Notes Table
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

-- 6. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'photo',
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    date TEXT DEFAULT 'Special Moments',
    location TEXT,
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    aspect_ratio TEXT DEFAULT 'landscape',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Login Attempts Table (brute-force protection)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id BIGSERIAL PRIMARY KEY,
    ip TEXT NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT FALSE
);

-- 8. Audio Search Cache Table
CREATE TABLE IF NOT EXISTS public.audio_search_cache (
    id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    results JSONB NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add missing columns safely (idempotent) ───────────────────────────────────
ALTER TABLE public.device_sessions ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS theme_glow TEXT;

-- ── Enable Row Level Security ─────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turtle_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_search_cache ENABLE ROW LEVEL SECURITY;

-- ── Drop old open policies ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Allow all operations on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all operations on device_sessions" ON public.device_sessions;
DROP POLICY IF EXISTS "Allow all operations on turtle_creations" ON public.turtle_creations;
DROP POLICY IF EXISTS "Allow all operations on love_notes" ON public.love_notes;
DROP POLICY IF EXISTS "Allow all operations on memories" ON public.memories;

-- Drop previous secure policies (safe re-run)
DROP POLICY IF EXISTS "anon read projects" ON public.projects;
DROP POLICY IF EXISTS "service_role full projects" ON public.projects;
DROP POLICY IF EXISTS "anon read turtle_creations" ON public.turtle_creations;
DROP POLICY IF EXISTS "service_role full turtle_creations" ON public.turtle_creations;
DROP POLICY IF EXISTS "anon read love_notes" ON public.love_notes;
DROP POLICY IF EXISTS "service_role full love_notes" ON public.love_notes;
DROP POLICY IF EXISTS "anon read memories" ON public.memories;
DROP POLICY IF EXISTS "service_role full memories" ON public.memories;
DROP POLICY IF EXISTS "service_role full messages" ON public.messages;
DROP POLICY IF EXISTS "service_role full device_sessions" ON public.device_sessions;
DROP POLICY IF EXISTS "service_role full login_attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "service_role full audio_search_cache" ON public.audio_search_cache;

-- ── SECURE Policies ───────────────────────────────────────────────────────────

-- Projects: anon read-only, mutations require service_role
CREATE POLICY "anon read projects" ON public.projects
  FOR SELECT USING (true);
CREATE POLICY "service_role full projects" ON public.projects
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Turtle Creations: anon read-only
CREATE POLICY "anon read turtle_creations" ON public.turtle_creations
  FOR SELECT USING (true);
CREATE POLICY "service_role full turtle_creations" ON public.turtle_creations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Love Notes: anon read-only
CREATE POLICY "anon read love_notes" ON public.love_notes
  FOR SELECT USING (true);
CREATE POLICY "service_role full love_notes" ON public.love_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Memories: anon read-only
CREATE POLICY "anon read memories" ON public.memories
  FOR SELECT USING (true);
CREATE POLICY "service_role full memories" ON public.memories
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Messages: fully private (service_role only)
CREATE POLICY "service_role full messages" ON public.messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Device Sessions: fully private (service_role only)
CREATE POLICY "service_role full device_sessions" ON public.device_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Login Attempts: service_role only
CREATE POLICY "service_role full login_attempts" ON public.login_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Audio Search Cache: service_role only
CREATE POLICY "service_role full audio_search_cache" ON public.audio_search_cache
  FOR ALL TO service_role USING (true) WITH CHECK (true);


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
    theme_gradient TEXT,
    theme_accent TEXT,
    theme_badge TEXT,
    theme_border TEXT,
    theme_text_accent TEXT,
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

-- 6. Memories Table (for Cloudinary-hosted photos & videos)
CREATE TABLE IF NOT EXISTS public.memories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'photo', -- 'photo' or 'video'
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    date TEXT DEFAULT 'Special Moments',
    location TEXT,
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    aspect_ratio TEXT DEFAULT 'landscape',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and allow public read/write for this app
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turtle_creations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicate errors)
DROP POLICY IF EXISTS "Allow all operations on messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all operations on projects" ON public.projects;
DROP POLICY IF EXISTS "Allow all operations on device_sessions" ON public.device_sessions;
DROP POLICY IF EXISTS "Allow all operations on turtle_creations" ON public.turtle_creations;
DROP POLICY IF EXISTS "Allow all operations on love_notes" ON public.love_notes;
DROP POLICY IF EXISTS "Allow all operations on memories" ON public.memories;

-- Create Policies for public access (so Next.js API can read and write with anon key)
CREATE POLICY "Allow all operations on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on device_sessions" ON public.device_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on turtle_creations" ON public.turtle_creations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on love_notes" ON public.love_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on memories" ON public.memories FOR ALL USING (true) WITH CHECK (true);


