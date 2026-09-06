import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/sessions';
import { dispatchNotification, NotificationType } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    const body = await request.json().catch(() => ({}));

    // Identify who is sending the test
    let senderRole: 'sukhen' | 'mili' = 'sukhen';
    let senderName = 'Sukhen';

    if (session) {
      if (session.userRole === 'mili') {
        senderRole = 'mili';
        senderName = 'Mili';
      } else {
        senderRole = 'sukhen';
        senderName = 'Sukhen';
      }
    } else if (body.senderRole === 'mili' || body.senderRole === 'sukhen') {
      senderRole = body.senderRole;
      senderName = body.senderRole === 'mili' ? 'Mili' : 'Sukhen';
    }

    const type: NotificationType = body.type || 'love_note';
    const targetName = senderRole === 'sukhen' ? 'Mili' : 'Sukhen';

    const testPayload = {
      type,
      title: body.title || `❤️ Test Alert from ${senderName}!`,
      body: body.body || `Hello ${targetName}! Instant Real-Time & Background notifications are working perfectly!`,
      url: body.url || '/',
      senderRole,
      senderName,
      image: '/icon.png',
      timestamp: Date.now(),
    };

    const result = await dispatchNotification(testPayload);

    return NextResponse.json({
      success: true,
      senderRole,
      senderName,
      targetRole: senderRole === 'sukhen' ? 'mili' : 'sukhen',
      result,
      message: `Test alert dispatched from ${senderName} to ${targetName}!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to dispatch test notification', details: err?.message },
      { status: 500 }
    );
  }
}
