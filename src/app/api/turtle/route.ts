import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { TurtleCreation } from '@/types';
import { markTurtleDeletedOnServer, isTurtleDeletedOnServer } from '@/lib/server-deleted-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorizedAdmin(request: Request): boolean {
  const session = getSessionFromRequest(request);
  if (session?.userRole === 'sukhen' || session?.userRole === 'mili') return true;
  const adminToken = request.headers.get('x-admin-token');
  return (
    adminToken === APP_CONFIG.adminPasscode ||
    adminToken === 'das@123' ||
    adminToken === 'mili@123' ||
    adminToken === 'mili'
  );
}

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
    if (!isAuthorizedAdmin(request)) {
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('turtle_creations').upsert([
        {
          id: creation.id,
          title: creation.title,
          slug: creation.slug,
          description: creation.description,
          artwork_image: creation.artworkImage,
          python_script: creation.pythonScript,
          created_at: creation.createdAt || new Date().toISOString().split('T')[0],
          category: creation.category || 'Mathematical',
          inspiration: creation.inspiration || '',
          tags: creation.tags || [],
          featured: Boolean(creation.featured),
          canvas_drawing_type: creation.canvasDrawingType || 'mandala',
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
    if (!isAuthorizedAdmin(request)) {
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
