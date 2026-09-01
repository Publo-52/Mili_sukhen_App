import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions';
import { AUTH_USERS, AUTH_CONFIG } from '@/data/config';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

// In-memory rate limiting map for brute force prevention
const rateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true };
  }

  // Check if IP is currently locked out
  if (record.lockedUntil > now) {
    const waitSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, waitSeconds };
  }

  // Reset if window has expired (10 minutes)
  if (now - record.lastAttempt > 10 * 60 * 1000) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;

  // Lock out for 5 minutes after 6 failed attempts
  if (record.attempts >= 6) {
    record.lockedUntil = now + 5 * 60 * 1000;
  }

  rateLimitMap.set(ip, record);
}

function clearRateLimit(ip: string) {
  rateLimitMap.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Check anti-brute-force rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. For security, please wait ${rateCheck.waitSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      return NextResponse.json(
        { error: 'Please enter your email address.' },
        { status: 400 }
      );
    }

    if (!cleanPass) {
      return NextResponse.json(
        { error: 'Please enter your password.' },
        { status: 400 }
      );
    }

    let candidateUser: typeof AUTH_USERS['mili'] | typeof AUTH_USERS['sukhen'] | null = null;

    // Check Sukhen email / phone
    const isSukhenEmail =
      AUTH_USERS.sukhen.emails.some((e) => cleanEmail === e.toLowerCase()) ||
      cleanEmail === '9832695291' ||
      cleanEmail === '+919832695291' ||
      cleanEmail === 'dassukhen@gmail.com';

    // Check Mili email / phone
    const isMiliEmail =
      AUTH_USERS.mili.emails.some((e) => cleanEmail === e.toLowerCase()) ||
      cleanEmail === '9732934032' ||
      cleanEmail === '+919732934032' ||
      cleanEmail === 'mandalsharmili06@gmail.com';

    if (isSukhenEmail) {
      candidateUser = AUTH_USERS.sukhen;
    } else if (isMiliEmail) {
      candidateUser = AUTH_USERS.mili;
    } else {
      // If email doesn't match standard prefixes, check if password matches one of the accounts
      if (cleanPass === 'das@123') {
        candidateUser = AUTH_USERS.sukhen;
      } else if (cleanPass === 'mili@123') {
        candidateUser = AUTH_USERS.mili;
      } else {
        recordFailedAttempt(ip);
        return NextResponse.json(
          { error: 'Unrecognized email or phone number. Please use your registered credentials.' },
          { status: 401 }
        );
      }
    }

    // Verify Password for the candidate user (exact passcode match)
    const isPasswordValid = candidateUser.passwords.includes(cleanPass);

    if (!isPasswordValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: `Incorrect password for ${candidateUser.name}. Please try again.` },
        { status: 401 }
      );
    }

    // Clear rate limit on successful authentication
    clearRateLimit(ip);

    const authenticatedUser = candidateUser;

    // Get client info
    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    // Check if client already has an active session cookie
    const existingSessionId = request.cookies.get('mili_session')?.value;

    // Try to create/refresh session with user info
    const result = createSession(
      userAgent,
      ip,
      {
        userName: authenticatedUser.name,
        userRole: authenticatedUser.role,
        userEmail: cleanEmail || authenticatedUser.defaultEmail,
        avatar: authenticatedUser.avatar,
      },
      existingSessionId
    );

    if ('error' in result) {
      return NextResponse.json(
        {
          error: result.error,
          code: 'MAX_DEVICES',
          sessions: result.sessions,
        },
        { status: 403 }
      );
    }

    // Persist session to Supabase cloud database
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('device_sessions').upsert([
          {
            id: result.session.id,
            user_name: result.session.userName,
            user_role: result.session.userRole,
            user_email: result.session.userEmail,
            avatar: result.session.avatar,
            device_name: result.session.deviceName,
            user_agent: userAgent,
            ip: ip,
            created_at: result.session.createdAt,
            last_seen_at: result.session.lastSeenAt,
            expires_at: result.session.expiresAt,
          },
        ]);
      } catch (err: any) {
        console.warn('Supabase device_session error:', err?.message);
      }
    }

    // Set session token in HTTP-only cookie for security
    const response = NextResponse.json({
      success: true,
      user: {
        id: authenticatedUser.id,
        name: authenticatedUser.name,
        role: authenticatedUser.role,
        title: authenticatedUser.title,
        avatar: authenticatedUser.avatar,
        greeting: authenticatedUser.greeting,
      },
      sessionId: result.session.id,
      deviceName: result.session.deviceName,
      expiresAt: result.session.expiresAt,
    });

    response.cookies.set('mili_session', result.session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: AUTH_CONFIG.sessionExpiryMs / 1000,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
