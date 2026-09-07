import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin, getAuthorizedAdminSession } from '@/lib/admin-auth';
import {
  timingSafeCompare,
  checkRateLimit,
  recordFailedAttempt,
  clearRateLimit,
  getClientIp,
} from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/verify
 * Silent, non-destructive check to verify if the current client request
 * already possesses an authorized admin session (Sukhen or Mili).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthorizedAdminSession(request);

    if (session) {
      return NextResponse.json(
        {
          success: true,
          authenticated: true,
          role: session.userRole,
          userName: session.userName,
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: 'No active authorized admin session.',
      },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Verification check failed.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/verify
 * Authenticates the admin passcode or confirms an active admin session.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitKey = `admin_verify_${ip}`;

    // 1. Rate Limit Defense: Prevent brute-force password guessing
    const rateCheck = await checkRateLimit(rateLimitKey, 5, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed admin attempts. For security, please wait ${rateCheck.waitSeconds} seconds before trying again.`,
          retryAfter: rateCheck.waitSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.waitSeconds || 300),
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // 2. Parse request payload safely
    const body = await request.json().catch(() => ({}));
    let passcode = typeof body?.passcode === 'string' ? body.passcode.trim() : '';

    // Support optional header token (for CLI, curl, automated scripts)
    if (!passcode) {
      const headerToken = request.headers.get('x-admin-token');
      if (headerToken) {
        passcode = headerToken.trim();
      }
    }

    // 3. Check existing authorized admin session
    const existingSession = await getAuthorizedAdminSession(request);

    // If caller sends an empty passcode:
    if (!passcode) {
      if (existingSession) {
        clearRateLimit(rateLimitKey);
        return NextResponse.json(
          {
            success: true,
            verifiedBy: 'session',
            role: existingSession.userRole,
            userName: existingSession.userName,
          },
          {
            headers: {
              'Cache-Control': 'no-store',
            },
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Admin passcode is required.',
        },
        { status: 400 }
      );
    }

    // 4. Resolve configured passcodes for both Sukhen (Admin) and Mili (Co-Admin)
    const adminPasscode = (
      process.env.ADMIN_PASSCODE ||
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
      (process.env.NODE_ENV === 'production' ? '' : 'das@123')
    ).trim();

    const sukhenPasscode = (
      process.env.SUKHEN_PASSWORD ||
      process.env.NEXT_PUBLIC_SUKHEN_PASSWORD ||
      adminPasscode ||
      (process.env.NODE_ENV === 'production' ? '' : 'das@123')
    ).trim();

    const miliPasscode = (
      process.env.MILI_PASSWORD ||
      process.env.NEXT_PUBLIC_MILI_PASSWORD ||
      (process.env.NODE_ENV === 'production' ? '' : 'mili@123')
    ).trim();

    // 5. Constant-time secure comparisons against valid credentials
    const isSukhenMatch = Boolean(
      (adminPasscode !== '' && timingSafeCompare(passcode, adminPasscode)) ||
      (sukhenPasscode !== '' && timingSafeCompare(passcode, sukhenPasscode))
    );

    const isMiliMatch = Boolean(
      miliPasscode !== '' && timingSafeCompare(passcode, miliPasscode)
    );

    // 6. Handle Match Success
    if (isSukhenMatch || isMiliMatch) {
      clearRateLimit(rateLimitKey);

      const matchedRole = isSukhenMatch ? 'sukhen' : 'mili';
      const matchedName = isSukhenMatch ? 'Sukhen' : 'Mili';

      return NextResponse.json(
        {
          success: true,
          verifiedBy: 'passcode',
          role: matchedRole,
          userName: matchedName,
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // 7. Handle Failure: Record attempt against IP
    recordFailedAttempt(rateLimitKey, 5, 5 * 60 * 1000);

    return NextResponse.json(
      {
        success: false,
        error: 'Incorrect admin passcode. Please verify and try again.',
      },
      {
        status: 401,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Verification failed. An unexpected server error occurred.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
