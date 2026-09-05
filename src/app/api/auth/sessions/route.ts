import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSessions,
  revokeSession,
  revokeAllSessions,
} from '@/lib/sessions';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/auth/sessions — list all active sessions
export async function GET(request: NextRequest) {
  if (!await isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await getAllSessions();

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      userName: s.userName || 'Mili',
      userRole: s.userRole || 'mili',
      userEmail:
        s.userEmail ||
        (s.userRole === 'sukhen' ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com'),
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
  if (!await isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { sessionId, revokeAll } = body as { sessionId?: string; revokeAll?: boolean };

  if (revokeAll) {
    await revokeAllSessions();
    return NextResponse.json({ success: true, message: 'All sessions revoked.' });
  }

  if (sessionId) {
    await revokeSession(sessionId);
    return NextResponse.json({
      success: true,
      message: `Session revoked successfully.`,
    });
  }

  return NextResponse.json({ error: 'Provide sessionId or revokeAll.' }, { status: 400 });
}
