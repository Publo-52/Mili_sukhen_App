import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/sessions';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('mili_session')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 200 });
  }

  const session = validateSession(token);

  if (!session) {
    return NextResponse.json({ authenticated: false, session: null }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: session.userName || 'Mili',
      role: session.userRole || 'mili',
      avatar: session.avatar || (session.userRole === 'sukhen' ? '✨' : '👑'),
    },
    session: {
      id: session.id,
      userName: session.userName || 'Mili',
      userRole: session.userRole || 'mili',
      avatar: session.avatar || '👑',
      deviceName: session.deviceName,
      createdAt: session.createdAt,
      lastSeenAt: session.lastSeenAt,
      expiresAt: session.expiresAt,
    },
  });
}
