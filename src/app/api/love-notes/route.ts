import { NextResponse } from 'next/server';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { LoveNote } from '@/types';

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
        .from('love_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json(
          {
            notes: data.map((n) => ({
              id: n.id,
              title: n.title,
              snippet: n.snippet,
              fullMessage: n.full_message,
              date: n.date,
              moodTag: n.mood_tag || 'deep',
              isFavorite: Boolean(n.is_favorite),
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
    { notes: INITIAL_LOVE_NOTES },
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
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can add or edit love notes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const note: LoveNote = body.note;

    if (!note || !note.title || !note.fullMessage) {
      return NextResponse.json(
        { error: 'Note Title and Full Message are required.' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('love_notes').upsert([
          {
            id: note.id,
            title: note.title,
            snippet: note.snippet || note.fullMessage.slice(0, 80),
            full_message: note.fullMessage,
            date: note.date || new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            mood_tag: note.moodTag || 'deep',
            is_favorite: Boolean(note.isFavorite),
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.warn('Supabase upsert warning for love note:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase error for love note:', err?.message);
      }
    }

    return NextResponse.json({ success: true, note });
  } catch {
    return NextResponse.json({ error: 'Failed to save love note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can delete love notes.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('love_notes').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete warning for love note:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase delete error for love note:', err?.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Love note deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete love note' }, { status: 500 });
  }
}
