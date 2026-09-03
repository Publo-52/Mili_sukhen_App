import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Route Handlers do not support next.revalidate — removed (Issue #13).
// Cache is handled explicitly below via Supabase persistent cache + in-process fallback.
export const dynamic = 'force-dynamic';

// ── In-process memory cache (per serverless instance, short-lived) ─────────────
const memCache = new Map<string, { videoId: string; cachedAt: number }>();
const MEM_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function normalizeCacheKey(query: string): string {
  return query.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 100);
}

// ── Persistent Supabase cache (audio_search_cache table from Phase 1) ─────────
async function getFromSupabaseCache(cacheKey: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('audio_search_cache')
      .select('video_id, expires_at')
      .eq('query_key', cacheKey)
      .single();
    if (error || !data) return null;
    if (new Date(data.expires_at) < new Date()) {
      // Expired — delete silently
      await supabase.from('audio_search_cache').delete().eq('query_key', cacheKey);
      return null;
    }
    return data.video_id;
  } catch {
    return null;
  }
}

async function saveToSupabaseCache(cacheKey: string, videoId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    await supabase.from('audio_search_cache').upsert([
      {
        query_key: cacheKey,
        video_id: videoId,
        expires_at: expiresAt,
        searched_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // Cache save failure is non-fatal
  }
}

// ── Invidious Fallback Helper ────────────────────────────────────────────────
const INVIDIOUS_INSTANCES = [
  'https://invidious.io',
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
];

async function searchWithInvidious(searchQuery: string): Promise<string | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const apiUrl = new URL(`${instance}/api/v1/search`);
      apiUrl.searchParams.set('q', searchQuery);
      apiUrl.searchParams.set('type', 'video');
      apiUrl.searchParams.set('page', '1');

      const res = await fetch(apiUrl.toString(), {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const items = Array.isArray(data) ? data : [];
      if (items.length > 0 && items[0]?.videoId) {
        return items[0].videoId;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  // ── Query validation ────────────────────────────────────────────────────────
  const rawQuery = (q || `${title} ${artist}`).trim();
  if (!rawQuery) {
    return NextResponse.json(
      { error: 'Query parameter required. Use ?q=song+name or ?title=...&artist=...' },
      { status: 400 }
    );
  }
  if (rawQuery.length > 200) {
    return NextResponse.json({ error: 'Query too long. Maximum 200 characters.' }, { status: 400 });
  }

  const cacheKey = normalizeCacheKey(rawQuery);

  // ── 1. In-process memory cache ──────────────────────────────────────────────
  const memHit = memCache.get(cacheKey);
  if (memHit && Date.now() - memHit.cachedAt < MEM_CACHE_TTL_MS) {
    return NextResponse.json({ videoId: memHit.videoId, cached: true, source: 'memory' });
  }

  // ── 2. Persistent Supabase cache ────────────────────────────────────────────
  const supabaseHit = await getFromSupabaseCache(cacheKey);
  if (supabaseHit) {
    memCache.set(cacheKey, { videoId: supabaseHit, cachedAt: Date.now() });
    return NextResponse.json({ videoId: supabaseHit, cached: true, source: 'database' });
  }

  const searchQuery = `${rawQuery} audio`;

  // ── 3. YouTube Data API v3 (Official Google API) ───────────────────────────
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const apiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
      apiUrl.searchParams.set('part', 'id');
      apiUrl.searchParams.set('q', searchQuery);
      apiUrl.searchParams.set('type', 'video');
      apiUrl.searchParams.set('videoCategoryId', '10'); // Music category
      apiUrl.searchParams.set('maxResults', '1');
      apiUrl.searchParams.set('key', apiKey);

      const res = await fetch(apiUrl.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const items = data?.items ?? [];
        const videoId: string | undefined = items[0]?.id?.videoId;

        if (videoId) {
          memCache.set(cacheKey, { videoId, cachedAt: Date.now() });
          await saveToSupabaseCache(cacheKey, videoId);
          return NextResponse.json({ videoId, cached: false, source: 'youtube_api' });
        }
      } else {
        console.warn(`[audio/search] YouTube API returned status ${res.status}, falling back to Invidious`);
      }
    } catch (err: any) {
      console.warn('[audio/search] YouTube API fetch error:', err?.message);
    }
  }

  // ── 4. Invidious Fallback (if YouTube API is unconfigured or rate limited) ───
  const fallbackVideoId = await searchWithInvidious(searchQuery);
  if (fallbackVideoId) {
    memCache.set(cacheKey, { videoId: fallbackVideoId, cachedAt: Date.now() });
    await saveToSupabaseCache(cacheKey, fallbackVideoId);
    return NextResponse.json({ videoId: fallbackVideoId, cached: false, source: 'invidious_fallback' });
  }

  return NextResponse.json(
    { error: 'No results found or search is temporarily unavailable.', code: 'NOT_FOUND' },
    { status: 404 }
  );
}
