import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { timingSafeCompare, checkRateLimit, recordFailedAttempt, clearRateLimit, getClientIp } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Rate Limit Defense: Check if this IP is temporarily locked out
    const rateCheck = await checkRateLimit(`admin_verify_${ip}`, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed admin attempts. For security, please wait ${rateCheck.waitSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const passcode = (body.passcode || '').trim();

    const serverPasscode =
      process.env.ADMIN_PASSCODE ||
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
      (process.env.NODE_ENV === 'production' ? '' : 'das@123');

    // Also check if user already has an authenticated session cookie
    const hasAdminSession = await isAuthorizedAdmin(request);

    if (hasAdminSession || (serverPasscode && timingSafeCompare(passcode, serverPasscode))) {
      clearRateLimit(`admin_verify_${ip}`);
      return NextResponse.json({ success: true });
    }

    // Record failed attempt
    recordFailedAttempt(`admin_verify_${ip}`, 5, 5 * 60 * 1000);

    return NextResponse.json({ error: 'Incorrect admin passcode' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
