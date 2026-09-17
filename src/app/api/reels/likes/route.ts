import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import os from 'os';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Multi-tier storage paths: Local dev (.data) + Vercel Serverless (/tmp)
const LOCAL_DATA_DIR = path.join(process.cwd(), '.data');
const LOCAL_LIKES_FILE = path.join(LOCAL_DATA_DIR, 'reel-likes.json');
const TMP_LIKES_FILE = path.join(os.tmpdir(), 'reel-likes.json');

// In-memory cache
let inMemoryLikes: Record<string, number> = {};
let isInitialized = false;

async function loadLikes(): Promise<Record<string, number>> {
  if (isInitialized) return inMemoryLikes;

  // 1. Try Supabase cloud persistence (authoritative for Vercel/serverless)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase
        .from('audio_search_cache')
        .select('video_id')
        .eq('query_key', 'reel_likes_global')
        .maybeSingle();

      if (data?.video_id) {
        inMemoryLikes = JSON.parse(data.video_id);
        isInitialized = true;
        return inMemoryLikes;
      }
    } catch {}
  }

  // 2. Try reading from local .data or /tmp
  try {
    if (fs.existsSync(LOCAL_LIKES_FILE)) {
      const raw = fs.readFileSync(LOCAL_LIKES_FILE, 'utf8');
      inMemoryLikes = JSON.parse(raw);
    } else if (fs.existsSync(TMP_LIKES_FILE)) {
      const raw = fs.readFileSync(TMP_LIKES_FILE, 'utf8');
      inMemoryLikes = JSON.parse(raw);
    }
  } catch {
    inMemoryLikes = {};
  }

  isInitialized = true;
  return inMemoryLikes;
}

async function saveLikes(likes: Record<string, number>): Promise<void> {
  inMemoryLikes = likes;
  const jsonStr = JSON.stringify(likes, null, 2);

  // 1. Persist to Supabase cloud asynchronously (survives Vercel cold restarts)
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('audio_search_cache').upsert([
        {
          query_key: 'reel_likes_global',
          video_id: jsonStr,
          expires_at: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          searched_at: new Date().toISOString(),
        },
      ]);
    } catch {}
  }

  // 2. Try writing to local .data folder
  let savedLocal = false;
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_LIKES_FILE, jsonStr, 'utf8');
    savedLocal = true;
  } catch {}

  // 3. Fallback to /tmp directory if local filesystem is read-only (standard Vercel Lambda)
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
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    // Rate limit: max 40 like actions per minute per IP
    const rateCheck = await checkRateLimit(`reel_like_${ip}`, 40, 60 * 1000);
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

    return NextResponse.json({
      success: true,
      reelId: cleanReelId,
      likesCount: newCount,
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
