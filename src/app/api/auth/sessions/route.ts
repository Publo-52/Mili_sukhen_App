import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, revokeSession, revokeAllSessions, getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Admin check for session management
function isAuthorizedAdmin(request: NextRequest): boolean {
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

// GET /api/auth/sessions — list all active sessions
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Try Supabase cloud sessions
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('device_sessions')
        .select('*')
        .order('last_seen_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          sessions: data.map(s => ({
            id: s.id,
            userName: s.user_name || 'Mili',
            userRole: s.user_role || 'mili',
            userEmail: s.user_email || (s.user_role === 'sukhen' ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com'),
            avatar: s.avatar || (s.user_role === 'sukhen' ? '✨' : '👑'),
            deviceName: s.device_name || 'Device',
            ip: s.ip || '127.0.0.1',
            createdAt: s.created_at,
            lastSeenAt: s.last_seen_at,
            expiresAt: s.expires_at,
          })),
          total: data.length,
        });
      }
    } catch (err) {
      console.warn('Supabase fetch sessions warning:', err);
    }
  }

  // 2. Fallback to local sessions
  const sessions = getAllSessions();
  return NextResponse.json({
    sessions: sessions.map(s => ({
      id: s.id,
      userName: s.userName || 'Mili',
      userRole: s.userRole || 'mili',
      userEmail: s.userEmail || (s.userRole === 'sukhen' ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com'),
      avatar: s.avatar || (s.userRole === 'sukhen' ? '✨' : '👑'),
      deviceName: s.deviceName,
      ip: s.ip,
      createdAt: s.createdAt,
      lastSeenAt: s.lastSeenAt,
      expiresAt: s.expiresAt,
    })),
    total: sessions.length,
  });
}

// DELETE /api/auth/sessions — revoke one or all sessions
export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { sessionId, revokeAll } = body as { sessionId?: string; revokeAll?: boolean };

  if (revokeAll) {
    revokeAllSessions();
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('device_sessions').delete().neq('id', 'null');
      } catch {}
    }
    return NextResponse.json({ success: true, message: 'All sessions revoked.' });
  }

  if (sessionId) {
    revokeSession(sessionId);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('device_sessions').delete().eq('id', sessionId);
      } catch {}
    }
    return NextResponse.json({ success: true, message: `Session ${sessionId.slice(0, 8)}… revoked.` });
  }

  return NextResponse.json({ error: 'Provide sessionId or revokeAll.' }, { status: 400 });
}
