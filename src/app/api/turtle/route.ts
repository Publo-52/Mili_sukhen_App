import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { TurtleCreation } from '@/types';

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

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          {
            creations: data.map((t) => ({
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
            })),
          },
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

  return NextResponse.json(
    { creations: INITIAL_TURTLE_CREATIONS },
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
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can add or edit Python Art.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const creation: TurtleCreation = body.creation;

    if (!creation || !creation.title || !creation.pythonScript) {
      return NextResponse.json(
        { error: 'Title and Python Script are required.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('turtle_creations').upsert([
          {
            id: creation.id,
            title: creation.title,
            slug: creation.slug,
            description: creation.description,
            artwork_image: creation.artworkImage,
            python_script: creation.pythonScript,
            category: creation.category,
            inspiration: creation.inspiration,
            tags: creation.tags,
            featured: creation.featured,
            canvas_drawing_type: creation.canvasDrawingType,
            created_at: creation.createdAt || new Date().toISOString(),
          },
        ]);

        if (error) {
          console.warn('Supabase upsert warning for turtle art:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase error for turtle art:', err?.message);
      }
    }

    return NextResponse.json({ success: true, creation });
  } catch {
    return NextResponse.json({ error: 'Failed to save Python Art creation' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can delete Python Art.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Artwork ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('turtle_creations').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete warning for turtle art:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase delete error for turtle art:', err?.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Artwork deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete Python Art' }, { status: 500 });
  }
}
