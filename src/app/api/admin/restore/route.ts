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
      } catch (err: any) {
        console.warn('Supabase restore notice:', err?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All original projects, Python art, love notes, and memories have been fully restored.',
      projects: INITIAL_PROJECTS,
      turtleCreations: INITIAL_TURTLE_CREATIONS,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to restore default datasets' }, { status: 500 });
  }
}
