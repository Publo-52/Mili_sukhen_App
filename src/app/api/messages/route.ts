import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { DirectMessage } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(request: Request): boolean {
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
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json(
          {
            messages: data.map((m) => ({
              id: m.id,
              sender: m.sender || 'Mili',
              message: m.message,
              mood: m.mood || '❤️',
              read: Boolean(m.read),
              reply: m.reply,
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
    { messages: [] },
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
    const body = await request.json();
    const { id, sender, message, mood } = body as {
      id?: string;
      sender?: string;
      message?: string;
      mood?: string;
    };

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message content cannot be empty' }, { status: 400 });
    }

    const messageId = id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const msgRecord: DirectMessage = {
      id: messageId,
      sender: sender || 'Mili',
      message: message.trim(),
      mood: mood || '❤️',
      read: false,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').insert([
          {
            id: msgRecord.id,
            sender: msgRecord.sender,
            message: msgRecord.message,
            mood: msgRecord.mood,
            read: false,
            created_at: msgRecord.createdAt,
          },
        ]);

        if (error) {
          console.warn('Supabase messages insert warning:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase messages error:', err?.message);
      }
    }

    return NextResponse.json({ success: true, message: msgRecord });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, read, reply } = body as { id: string; read?: boolean; reply?: string };

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const updates: any = {};
        if (typeof read === 'boolean') updates.read = read;
        if (typeof reply === 'string') updates.reply = reply;

        const { error } = await supabase.from('messages').update(updates).eq('id', id);
        if (error) {
          console.warn('Supabase update warning:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase update error:', err?.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete warning:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase delete error:', err?.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Message deleted successfully.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
