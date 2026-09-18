import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Multi-tier storage paths: Local dev (.data) + Vercel Serverless (/tmp)
const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_LIKES_FILE = path.join(LOCAL_DATA_DIR, 'reel-likes.json');
const TMP_LIKES_FILE = path.join(os.tmpdir(), 'reel-likes.json');

// In-memory fallback
let inMemoryLikes: Record<string, number> = {};

async function loadLikes(): Promise<Record<string, number>> {
  // 1. Authoritative: Fetch from Supabase cloud so all devices & serverless instances share exact state
  if (isSupabaseConfigured && supabase) {
    // A. Check messages table (reliable across all Supabase schemas)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('message')
        .eq('id', '__system_reel_likes__')
        .maybeSingle();

      if (!error && data?.message) {
        const parsed = JSON.parse(data.message);
        if (parsed && typeof parsed === 'object') {
          inMemoryLikes = { ...parsed };
          return inMemoryLikes;
        }
      }
    } catch {}

    // B. Check audio_search_cache table
    try {
      const { data, error } = await supabase
        .from('audio_search_cache')
        .select('*')
        .or('id.eq.reel_likes_global,query_key.eq.reel_likes_global')
        .maybeSingle();

      if (!error && data) {
        const rawJson = data.results || data.video_id || data.message;
        if (rawJson) {
          const parsed = typeof rawJson === 'object' ? rawJson : JSON.parse(rawJson);
          if (parsed && typeof parsed === 'object') {
            inMemoryLikes = { ...parsed };
            return inMemoryLikes;
          }
        }
      }
    } catch {}
  }

  // 2. Try reading from local .data or /tmp
  try {
    if (fs.existsSync(LOCAL_LIKES_FILE)) {
      const raw = fs.readFileSync(LOCAL_LIKES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        inMemoryLikes = { ...parsed };
        return inMemoryLikes;
      }
    } else if (fs.existsSync(TMP_LIKES_FILE)) {
      const raw = fs.readFileSync(TMP_LIKES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        inMemoryLikes = { ...parsed };
        return inMemoryLikes;
      }
    }
  } catch {}

  return inMemoryLikes;
}

async function saveLikes(likes: Record<string, number>): Promise<void> {
  inMemoryLikes = { ...likes };
  const jsonStr = JSON.stringify(likes, null, 2);

  // 1. Persist to Supabase cloud
  if (isSupabaseConfigured && supabase) {
    // A. Save to messages table
    try {
      await supabase.from('messages').upsert([
        {
          id: '__system_reel_likes__',
          sender: 'System',
          message: jsonStr,
          mood: '❤️',
          read: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {}

    // B. Save to audio_search_cache table
    try {
      await supabase.from('audio_search_cache').upsert([
        {
          id: 'reel_likes_global',
          query: 'reel_likes_global',
          query_key: 'reel_likes_global',
          results: likes,
          video_id: jsonStr,
          expires_at: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          cached_at: new Date().toISOString(),
          searched_at: new Date().toISOString(),
        },
      ]);
    } catch {}
  }

  // 2. Persist locally to .data folder
  let savedLocal = false;
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_LIKES_FILE, jsonStr, 'utf8');
    savedLocal = true;
  } catch {}

  // 3. Fallback to /tmp directory
  if (!savedLocal) {
    try {
      fs.writeFileSync(TMP_LIKES_FILE, jsonStr, 'utf8');
    } catch {}
  }
}

export async function GET() {
  const likes = await loadLikes();
  return NextResponse.json(
    { likes },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Generous rate limit: max 120 like actions per minute per IP
    const rateCheck = await checkRateLimit(`reel_like_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.waitSeconds || 60) } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawReelId = typeof body?.reelId === 'string' ? body.reelId : '';
    const cleanReelId = sanitizeText(rawReelId, 64).replace(/[^a-zA-Z0-9_\-]/g, '');
    const action = body?.action === 'unlike' ? 'unlike' : 'like';

    if (!cleanReelId) {
      return NextResponse.json({ error: 'Valid reelId is required' }, { status: 400 });
    }

    const likes = await loadLikes();
    const currentCount = likes[cleanReelId] || 0;

    let newCount: number;
    if (action === 'unlike') {
      newCount = Math.max(0, currentCount - 1);
    } else {
      newCount = currentCount + 1;
    }

    likes[cleanReelId] = newCount;
    await saveLikes(likes);

    // Broadcast in real-time to all connected devices / users
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.channel('reels-live-likes-channel').send({
          type: 'broadcast',
          event: 'reel-like-updated',
          payload: { reelId: cleanReelId, likesCount: newCount },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      reelId: cleanReelId,
      likesCount: newCount,
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
