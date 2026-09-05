import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const passcode = (body.passcode || '').trim();

    const serverPasscode =
      process.env.ADMIN_PASSCODE ||
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
      (process.env.NODE_ENV === 'production' ? '' : 'das@123');

    // Also check if already has an authenticated session cookie
    const hasAdminSession = await isAuthorizedAdmin(request);

    if (hasAdminSession || (serverPasscode && passcode === serverPasscode)) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Incorrect admin passcode' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
