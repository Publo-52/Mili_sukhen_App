import { NextResponse } from 'next/server';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { LoveNote } from '@/types';
import { markNoteDeletedOnServer, isNoteDeletedOnServer } from '@/lib/server-deleted-tracker';
import { sanitizeText } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('love_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data !== null) {
        const filtered = data
          .filter((n) => !isNoteDeletedOnServer(n.id))
          .map((n) => ({
            id: n.id,
            title: n.title,
            snippet: n.snippet,
            fullMessage: n.full_message,
            date: n.date,
            moodTag: n.mood_tag || 'deep',
            isFavorite: Boolean(n.is_favorite),
          }));

        return NextResponse.json(
          { notes: filtered },
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

  const baselineFiltered = INITIAL_LOVE_NOTES.filter((n) => !isNoteDeletedOnServer(n.id));

  return NextResponse.json(
    { notes: baselineFiltered },
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
        { error: 'Unauthorized. Only Admins can add or edit love notes.' },
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

    const cleanTitle = sanitizeText(note.title, 200);
    const cleanSnippet = sanitizeText(note.snippet, 300) || cleanTitle.slice(0, 80);
    const cleanFullMessage = sanitizeText(note.fullMessage, 10000);
    const cleanDate = sanitizeText(note.date || '', 50) || new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const cleanMoodTag = sanitizeText(note.moodTag || 'deep', 30);
    const cleanId = sanitizeText(note.id, 64) || `note-${Date.now()}`;

    const cleanNote: LoveNote = {
      id: cleanId,
      title: cleanTitle,
      snippet: cleanSnippet,
      fullMessage: cleanFullMessage,
      date: cleanDate,
      moodTag: cleanMoodTag,
      isFavorite: Boolean(note.isFavorite),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('love_notes').upsert([
          {
            id: cleanNote.id,
            title: cleanNote.title,
            snippet: cleanNote.snippet,
            full_message: cleanNote.fullMessage,
            date: cleanNote.date,
            mood_tag: cleanNote.moodTag,
            is_favorite: cleanNote.isFavorite,
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

    return NextResponse.json({ success: true, note: cleanNote });
  } catch {
    return NextResponse.json({ error: 'Failed to save love note' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins can delete love notes.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }

    // Permanently register deletion on server
    markNoteDeletedOnServer(id);

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

    return NextResponse.json({ success: true, id, message: 'Love note permanently deleted.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete love note' }, { status: 500 });
  }
}
