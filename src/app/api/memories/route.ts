import { NextResponse } from 'next/server';
import { INITIAL_MEMORIES } from '@/data/memories';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { MemoryItem } from '@/types';

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
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          {
            memories: data.map((m) => ({
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
    { memories: INITIAL_MEMORIES },
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
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can add or edit photos & videos.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const memory: MemoryItem = body.memory;

    if (!memory || !memory.title || !memory.url) {
      return NextResponse.json(
        { error: 'Memory Title and Media URL are required.' },
        { status: 400 }
      );
    }

    const memoryId = memory.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record: MemoryItem = {
      ...memory,
      id: memoryId,
      type: memory.type || 'photo',
      thumbnailUrl: memory.thumbnailUrl || memory.url,
      date: memory.date || 'Special Moments',
      createdAt: memory.createdAt || new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('memories').upsert([
          {
            id: record.id,
            title: record.title,
            type: record.type,
            url: record.url,
            thumbnail_url: record.thumbnailUrl,
            date: record.date,
            location: record.location,
            description: record.description,
            is_favorite: Boolean(record.isFavorite),
            aspect_ratio: record.aspectRatio || 'landscape',
            created_at: record.createdAt,
          },
        ]);

        if (error) {
          console.warn('Supabase upsert warning for memory:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase error for memory:', err?.message);
      }
    }

    return NextResponse.json({ success: true, memory: record });
  } catch {
    return NextResponse.json({ error: 'Failed to save memory item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can delete memories.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Memory ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('memories').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete warning for memory:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase delete error for memory:', err?.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Memory deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 });
  }
}
