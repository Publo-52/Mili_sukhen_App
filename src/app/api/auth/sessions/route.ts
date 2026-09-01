import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, revokeSession, revokeAllSessions, getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';

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

  const sessions = getAllSessions();
  // Strip raw user-agent, expose only the friendly fields
  return NextResponse.json({
    sessions: sessions.map(s => ({
      id: s.id,
      userName: s.userName || 'Mili',
      userRole: s.userRole || 'mili',
      userEmail: s.userEmail || (s.userRole === 'sukhen' ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com'),
      avatar: s.avatar || '👑',
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
    return NextResponse.json({ success: true, message: 'All sessions revoked.' });
  }

  if (sessionId) {
    revokeSession(sessionId);
    return NextResponse.json({ success: true, message: `Session ${sessionId.slice(0, 8)}… revoked.` });
  }

  return NextResponse.json({ error: 'Provide sessionId or revokeAll.' }, { status: 400 });
}
