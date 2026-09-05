import { NextResponse } from 'next/server';
import { clearAllDeletedOnServer } from '@/lib/server-deleted-tracker';
import { INITIAL_PROJECTS } from '@/data/projects';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';
import { INITIAL_MEMORIES } from '@/data/memories';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Clear server-side deleted blacklist
    clearAllDeletedOnServer();

    // 2. If Supabase is active, re-seed / restore initial datasets
    if (isSupabaseConfigured && supabase) {
      try {
        // Re-insert initial projects
        for (const p of INITIAL_PROJECTS) {
          await supabase.from('projects').upsert([
            {
              id: p.id,
              title: p.title,
              slug: p.slug,
              description: p.description,
              detailed_story: p.detailedStory,
              category: p.category,
              url: p.url,
              github_url: p.githubUrl,
              thumbnail: p.thumbnail,
              technologies: p.technologies,
              featured: p.featured,
              order_index: p.order || 1,
              created_at: p.createdAt || new Date().toISOString(),
            },
          ]);
        }

        // Re-insert initial turtle creations
        for (const t of INITIAL_TURTLE_CREATIONS) {
          await supabase.from('turtle_creations').upsert([
            {
              id: t.id,
              title: t.title,
              slug: t.slug,
              description: t.description,
              artwork_image: t.artworkImage,
              python_script: t.pythonScript,
              created_at: t.createdAt,
              category: t.category,
              inspiration: t.inspiration,
              tags: t.tags,
              featured: t.featured,
              canvas_drawing_type: t.canvasDrawingType,
            },
          ]);
        }
        // Re-insert initial love notes
        for (const n of INITIAL_LOVE_NOTES) {
          await supabase.from('love_notes').upsert([
            {
              id: n.id,
              title: n.title,
              snippet: n.snippet,
              full_message: n.fullMessage,
              date: n.date,
              mood_tag: n.moodTag || 'deep',
              is_favorite: Boolean(n.isFavorite),
              created_at: new Date().toISOString(),
            },
          ]);
        }

        // Re-insert initial memories
        for (const m of INITIAL_MEMORIES) {
          await supabase.from('memories').upsert([
            {
              id: m.id,
              title: m.title,
              type: m.type || 'photo',
              url: m.url,
              thumbnail_url: m.thumbnailUrl || m.url,
              date: m.date || 'A special moment',
              location: m.location || '',
              description: m.description || '',
              is_favorite: Boolean(m.isFavorite),
              aspect_ratio: m.aspectRatio || 'landscape',
              created_at: m.createdAt || new Date().toISOString(),
            },
          ]);
        }
      } catch (err: any) {
        console.warn('Supabase restore notice:', err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All original projects, Python art, love notes, and memories have been fully restored.',
      projects: INITIAL_PROJECTS,
      turtleCreations: INITIAL_TURTLE_CREATIONS,
      loveNotes: INITIAL_LOVE_NOTES,
      memories: INITIAL_MEMORIES,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to restore default datasets' }, { status: 500 });
  }
}
