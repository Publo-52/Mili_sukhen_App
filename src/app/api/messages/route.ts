import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { DirectMessage } from '@/types';

// In-memory persistent fallback store during runtime
let inMemoryMessages: DirectMessage[] = [
  {
    id: "msg-init-1",
    sender: "Sukhen",
    senderRole: "sukhen",
    senderPhone: "+91 98326 95291",
    message: "Hi Mili! ❤️ I built this entire universe just for you. How are you liking it?",
    mood: "❤️",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: true,
  },
  {
    id: "msg-init-2",
    sender: "Mili",
    senderRole: "mili",
    senderPhone: "+91 97329 34032",
    message: "Sukhen! This is the most beautiful thing ever 🥺 I love the Python artworks & projects so much 💕",
    mood: "🥺",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
];

export async function GET(request: Request) {
  // Gracefully handle auth: if logged in, we know the user. If not logged in, still serve messages so WhatsApp widget is active.
  const session = getSessionFromRequest(request);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          messages: data.map((m) => ({
            id: m.id,
            sender: m.sender,
            senderRole: m.sender_role || (m.sender?.toLowerCase().includes('sukhen') ? 'sukhen' : 'mili'),
            senderPhone: m.sender_phone || (m.sender?.toLowerCase().includes('sukhen') ? '+91 98326 95291' : '+91 97329 34032'),
            message: m.message,
            mood: m.mood || '❤️',
            read: m.read || false,
            reply: m.reply,
            replyToId: m.reply_to_id,
            replyToText: m.reply_to_text,
            reaction: m.reaction,
            isVoiceNote: m.is_voice_note,
            voiceDuration: m.voice_duration,
            mediaUrl: m.media_url,
            mediaType: m.media_type,
            createdAt: m.created_at,
          })),
        });
      }
    } catch (e) {
      console.warn('[Supabase Messages Fetch Fallback]', e);
    }
  }

  // Return in-memory fallback messages
  return NextResponse.json({
    success: true,
    messages: inMemoryMessages,
  });
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    const body = await request.json();
    const {
      sender,
      senderRole: explicitSenderRole,
      senderPhone: explicitSenderPhone,
      message,
      mood,
      replyToId,
      replyToText,
      reaction,
      isVoiceNote,
      voiceDuration,
      mediaUrl,
      mediaType,
    } = body;

    if (!message && !mediaUrl && !isVoiceNote) {
      return NextResponse.json(
        { error: 'Message content or media is required.' },
        { status: 400 }
      );
    }

    const currentRole: 'sukhen' | 'mili' = session
      ? (session.userRole === 'sukhen' ? 'sukhen' : 'mili')
      : (explicitSenderRole || (sender?.toLowerCase().includes('sukhen') ? 'sukhen' : 'mili'));
    const currentName = session?.userName || sender || (currentRole === 'sukhen' ? 'Sukhen' : 'Mili');
    const currentPhone = explicitSenderPhone || (currentRole === 'sukhen' ? '+91 98326 95291' : '+91 97329 34032');

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sender: currentName,
      senderRole: currentRole,
      senderPhone: currentPhone,
      message: (message || '').trim(),
      mood: mood || '❤️',
      createdAt: new Date().toISOString(),
      read: false,
      replyToId,
      replyToText,
      reaction,
      isVoiceNote,
      voiceDuration,
      mediaUrl,
      mediaType,
    };

    // Add to in-memory cache
    inMemoryMessages.push(newMsg);
    if (inMemoryMessages.length > 200) {
      inMemoryMessages = inMemoryMessages.slice(-200);
    }

    // If Supabase is configured, persist directly to PostgreSQL database
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').insert([
          {
            id: newMsg.id,
            sender: newMsg.sender,
            sender_role: newMsg.senderRole,
            sender_phone: newMsg.senderPhone,
            message: newMsg.message,
            mood: newMsg.mood,
            read: newMsg.read,
            reply_to_id: newMsg.replyToId,
            reply_to_text: newMsg.replyToText,
            reaction: newMsg.reaction,
            is_voice_note: newMsg.isVoiceNote,
            voice_duration: newMsg.voiceDuration,
            media_url: newMsg.mediaUrl,
            media_type: newMsg.mediaType,
            created_at: newMsg.createdAt,
          },
        ]);
      } catch (dbError) {
        console.error('[Supabase Message Insert Error]', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Message delivered successfully ❤️',
      data: newMsg,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process message.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = getSessionFromRequest(request);


    const body = await request.json();
    const { id, read, reply, reaction } = body as {
      id: string;
      read?: boolean;
      reply?: string;
      reaction?: string;
    };

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    // Update in-memory
    const targetMsg = inMemoryMessages.find((m) => m.id === id);
    if (targetMsg) {
      if (typeof read === 'boolean') targetMsg.read = read;
      if (typeof reply === 'string') targetMsg.reply = reply;
      if (reaction !== undefined) targetMsg.reaction = reaction;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const updateData: Record<string, unknown> = {};
        if (typeof read === 'boolean') updateData.read = read;
        if (typeof reply === 'string') updateData.reply = reply;
        if (reaction !== undefined) updateData.reaction = reaction;

        await supabase.from('messages').update(updateData).eq('id', id);
      } catch (err) {
        console.error('[Supabase Update Error]', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Message updated' });
  } catch {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.userRole !== 'sukhen') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    inMemoryMessages = inMemoryMessages.filter((m) => m.id !== id);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('messages').delete().eq('id', id);
      } catch (err) {
        console.error('[Supabase Delete Error]', err);
      }
    }

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
