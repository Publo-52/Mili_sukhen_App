import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/sessions';
import { savePushSubscription } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, role: requestedRole, name: requestedName } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid push subscription payload' },
        { status: 400 }
      );
    }

    // Determine user role and name from session
    const session = await getSessionFromRequest(request);
    let userRole: 'sukhen' | 'mili' = 'mili';
    let userName = 'Mili';

    if (session) {
      if (session.userRole === 'sukhen') {
        userRole = 'sukhen';
        userName = 'Sukhen';
      } else if (session.userRole === 'mili') {
        userRole = 'mili';
        userName = 'Mili';
      }
    } else if (requestedRole === 'sukhen' || requestedRole === 'mili') {
      userRole = requestedRole;
      userName = requestedName || (requestedRole === 'sukhen' ? 'Sukhen' : 'Mili');
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    const saved = await savePushSubscription({
      role: userRole,
      name: userName,
      subscription,
      userAgent,
    });

    return NextResponse.json({
      success: saved,
      role: userRole,
      name: userName,
      message: `Subscribed successfully for ${userName} (${userRole})`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to subscribe to push notifications', details: err?.message },
      { status: 500 }
    );
  }
}
