import { NextResponse } from 'next/server';
import { INITIAL_MEMORIES } from '@/data/memories';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { MemoryItem } from '@/types';
import { markMemoryDeletedOnServer, isMemoryDeletedOnServer } from '@/lib/server-deleted-tracker';
import { sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data !== null) {
        const existingIds = new Set(data.map((m) => m.id));
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

        // Merge any baseline initial memories that aren't in DB yet and aren't deleted
        const missingBaseline = INITIAL_MEMORIES.filter(
          (m) => !existingIds.has(m.id) && !isMemoryDeletedOnServer(m.id)
        );

        const allCombined = [...filtered, ...missingBaseline];

        return NextResponse.json(
          { memories: allCombined },
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

    const cleanTitle = sanitizeText(memory.title, 200);
    const cleanDesc = sanitizeText(memory.description, 2000);
    const cleanDate = sanitizeText(memory.date, 50) || 'A special moment';
    const cleanLocation = sanitizeText(memory.location, 100);
    const cleanUrl = sanitizeText(memory.url, 1000);
    const cleanThumbnail = sanitizeText(memory.thumbnailUrl || memory.url, 1000);
    const cleanType = memory.type === 'video' ? 'video' : 'photo';
    const rawAspect = sanitizeText(memory.aspectRatio || 'landscape', 20);
    const cleanAspect: 'portrait' | 'landscape' | 'square' =
      rawAspect === 'portrait' || rawAspect === 'square' ? rawAspect : 'landscape';

    const cleanMemory: MemoryItem = {
      id: sanitizeText(memory.id, 64) || `mem-${Date.now()}`,
      title: cleanTitle,
      type: cleanType,
      url: cleanUrl,
      thumbnailUrl: cleanThumbnail,
      date: cleanDate,
      location: cleanLocation,
      description: cleanDesc,
      isFavorite: Boolean(memory.isFavorite),
      aspectRatio: cleanAspect,
      createdAt: memory.createdAt || new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('memories').upsert([
        {
          id: cleanMemory.id,
          title: cleanMemory.title,
          type: cleanMemory.type,
          url: cleanMemory.url,
          thumbnail_url: cleanMemory.thumbnailUrl,
          date: cleanMemory.date,
          location: cleanMemory.location,
          description: cleanMemory.description,
          is_favorite: cleanMemory.isFavorite,
          aspect_ratio: cleanMemory.aspectRatio,
          created_at: cleanMemory.createdAt,
        },
      ]);

      if (error) {
        console.warn('Supabase upsert memory warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, memory: cleanMemory });
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
