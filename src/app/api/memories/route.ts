import { NextResponse } from 'next/server';
import { INITIAL_MEMORIES } from '@/data/memories';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { MemoryItem } from '@/types';
import { markMemoryDeletedOnServer, isMemoryDeletedOnServer } from '@/lib/server-deleted-tracker';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  const session = await getSessionFromRequest(request);
  if (session?.userRole === 'sukhen' || session?.userRole === 'mili') return true;
  const adminToken = request.headers.get('x-admin-token');
  return adminToken === APP_CONFIG.adminPasscode;
}

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data !== null) {
        const filtered = data
          .filter((m) => !isMemoryDeletedOnServer(m.id))
          .map((m) => ({
            id: m.id,
            title: m.title,
            type: m.type || 'photo',
            url: m.url,
            thumbnailUrl: m.thumbnail_url || m.url,
            date: m.date || 'A special moment',
            location: m.location || '',
            description: m.description || '',
            isFavorite: Boolean(m.is_favorite),
            aspectRatio: m.aspect_ratio || 'landscape',
            createdAt: m.created_at,
          }));

        return NextResponse.json(
          { memories: filtered },
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

  const baselineFiltered = INITIAL_MEMORIES.filter((m) => !isMemoryDeletedOnServer(m.id));

  return NextResponse.json(
    { memories: baselineFiltered },
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
        { error: 'Unauthorized. Only Admins can upload memories.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const memory: MemoryItem = body.memory;

    if (!memory || !memory.title || !memory.url) {
      return NextResponse.json(
        { error: 'Missing required memory fields (title, url)' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('memories').upsert([
        {
          id: memory.id,
          title: memory.title,
          type: memory.type || 'photo',
          url: memory.url,
          thumbnail_url: memory.thumbnailUrl || memory.url,
          date: memory.date || 'A special moment',
          location: memory.location || '',
          description: memory.description || '',
          is_favorite: Boolean(memory.isFavorite),
          aspect_ratio: memory.aspectRatio || 'landscape',
          created_at: memory.createdAt || new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn('Supabase upsert memory warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, memory });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save memory' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins can delete memories.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    // Permanently register deletion on server
    markMemoryDeletedOnServer(id);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete memory warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, id, message: 'Memory permanently deleted.' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete memory' },
      { status: 500 }
    );
  }
}
