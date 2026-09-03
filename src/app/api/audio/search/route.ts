import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, string>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  const query = (q || `${title} ${artist}`).trim();
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }

  const cacheKey = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cache.has(cacheKey)) {
    return NextResponse.json({ videoId: cache.get(cacheKey), cached: true });
  }

  try {
    const encoded = encodeURIComponent(`${query} audio`);
    const res = await fetch(`https://www.youtube.com/results?search_query=${encoded}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to search YouTube' }, { status: 502 });
    }

    const text = await res.text();
    const match = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = match ? match[1] : null;

    if (videoId) {
      cache.set(cacheKey, videoId);
      return NextResponse.json({ videoId, cached: false });
    }

    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
