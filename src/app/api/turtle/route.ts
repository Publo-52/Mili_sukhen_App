import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { TurtleCreation } from '@/types';
import { markTurtleDeletedOnServer, isTurtleDeletedOnServer } from '@/lib/server-deleted-tracker';
import { sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('turtle_creations')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data !== null) {
        const filtered = data
          .filter((t) => !isTurtleDeletedOnServer(t.id))
          .map((t) => ({
            id: t.id,
            title: t.title,
            slug: t.slug,
            description: t.description,
            artworkImage: t.artwork_image,
            pythonScript: t.python_script,
            createdAt: t.created_at,
            category: t.category,
            inspiration: t.inspiration,
            tags: Array.isArray(t.tags) ? t.tags : (t.tags ? JSON.parse(t.tags) : []),
            featured: Boolean(t.featured),
            canvasDrawingType: t.canvas_drawing_type,
          }));

        return NextResponse.json(
          { creations: filtered },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              Pragma: 'no-cache',
            },
          }
        );
      }
    } catch {
      // fallback
    }
  }

  const baselineFiltered = INITIAL_TURTLE_CREATIONS.filter((t) => !isTurtleDeletedOnServer(t.id));

  return NextResponse.json(
    { creations: baselineFiltered },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins can create or modify Python art.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const creation: TurtleCreation = body.creation;

    if (!creation || !creation.title || !creation.pythonScript) {
      return NextResponse.json(
        { error: 'Missing required fields (title, pythonScript)' },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeText(creation.title, 200);
    const cleanSlug = sanitizeText(creation.slug, 200) || `turtle-${Date.now()}`;
    const cleanDesc = sanitizeText(creation.description, 1000);
    const cleanInspiration = sanitizeText(creation.inspiration, 2000);
    const cleanCategory = sanitizeText(creation.category, 50) || 'Mathematical Geometry';
    const cleanScript = sanitizeText(creation.pythonScript, 50000);
    const cleanImage = creation.artworkImage ? sanitizeText(creation.artworkImage, 1000) : null;
    const cleanTags = Array.isArray(creation.tags)
      ? creation.tags.map((t: any) => sanitizeText(String(t), 50)).filter(Boolean)
      : ['Python Turtle', 'Generative Art'];

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('turtle_creations').upsert([
        {
          id: sanitizeText(creation.id, 64) || `turtle-${Date.now()}`,
          title: cleanTitle,
          slug: cleanSlug,
          description: cleanDesc,
          artwork_image: cleanImage,
          python_script: cleanScript,
          created_at: creation.createdAt || new Date().toISOString().split('T')[0],
          category: cleanCategory,
          inspiration: cleanInspiration,
          tags: cleanTags,
          featured: Boolean(creation.featured),
          canvas_drawing_type: sanitizeText(creation.canvasDrawingType || 'mandala', 50),
        },
      ]);

      if (error) {
        console.warn('Supabase upsert turtle warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, creation });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save Python Turtle creation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins can delete Python art.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Creation ID is required' }, { status: 400 });
    }

    // Permanently register deletion on server
    markTurtleDeletedOnServer(id);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('turtle_creations').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete turtle warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, id, message: 'Python artwork permanently deleted.' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete Python Turtle creation' },
      { status: 500 }
    );
  }
}
