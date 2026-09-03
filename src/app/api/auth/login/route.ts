import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/sessions';
import { AUTH_USERS, AUTH_CONFIG } from '@/data/config';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// ── Lightweight in-memory fallback (local dev / Supabase unavailable) ─────────
interface InMemoryRecord {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}
const inMemoryRateLimit = new Map<string, InMemoryRecord>();

// ── Supabase-backed rate limiting ─────────────────────────────────────────────

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; waitSeconds?: number }> {
  if (!isSupabaseConfigured || !supabase) {
    return checkInMemoryRateLimit(ip);
  }

  try {
    const { data } = await supabase
      .from('login_attempts')
      .select('attempt_count, locked_until, last_attempt_at')
      .eq('ip_address', ip)
      .maybeSingle();

    if (!data) return { allowed: true };

    const now = new Date();

    // Locked out?
    if (data.locked_until && new Date(data.locked_until) > now) {
      const waitSeconds = Math.ceil(
        (new Date(data.locked_until).getTime() - now.getTime()) / 1000
      );
      return { allowed: false, waitSeconds };
    }

    // Window expired (10 min) → clean slate
    if (now.getTime() - new Date(data.last_attempt_at).getTime() > 10 * 60 * 1000) {
      await supabase.from('login_attempts').delete().eq('ip_address', ip);
      return { allowed: true };
    }

    return { allowed: true };
  } catch {
    // Supabase unavailable — fall back to in-memory
    return checkInMemoryRateLimit(ip);
  }
}

async function recordFailedAttempt(ip: string, email: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    recordInMemoryFailedAttempt(ip);
    return;
  }

  try {
    const now = new Date();
    const nowISO = now.toISOString();

    const { data: existing } = await supabase
      .from('login_attempts')
      .select('attempt_count, first_attempt_at')
      .eq('ip_address', ip)
      .maybeSingle();

    const newCount = (existing?.attempt_count ?? 0) + 1;
    const lockedUntil =
      newCount >= 5
        ? new Date(now.getTime() + 5 * 60 * 1000).toISOString()
        : null;

    await supabase.from('login_attempts').upsert(
      {
        ip_address: ip,
        attempt_count: newCount,
        first_attempt_at: existing?.first_attempt_at ?? nowISO,
        last_attempt_at: nowISO,
        locked_until: lockedUntil,
        last_attempted_email: email,
      },
      { onConflict: 'ip_address' }
    );
  } catch {
    // Supabase unavailable — fall back to in-memory
    recordInMemoryFailedAttempt(ip);
  }
}

async function clearRateLimit(ip: string): Promise<void> {
  inMemoryRateLimit.delete(ip);
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('login_attempts').delete().eq('ip_address', ip);
  } catch {
    // Non-critical
  }
}

// ── In-memory fallback helpers ────────────────────────────────────────────────

function checkInMemoryRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = inMemoryRateLimit.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil > now) {
    return { allowed: false, waitSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
  }
  if (now - record.lastAttempt > 10 * 60 * 1000) {
    inMemoryRateLimit.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordInMemoryFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = inMemoryRateLimit.get(ip) || { attempts: 0, lockedUntil: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;
  if (record.attempts >= 6) {
    record.lockedUntil = now + 5 * 60 * 1000;
  }
  inMemoryRateLimit.set(ip, record);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Check anti-brute-force rate limit (Supabase-backed, cross-instance)
    const rateCheck = await checkRateLimit(ip);
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
      await recordFailedAttempt(ip, cleanEmail);
      return NextResponse.json(
        { error: 'Unrecognized email or phone number. Please enter your registered email or phone.' },
        { status: 401 }
      );
    }

    // Verify password (exact passcode match)
    const isPasswordValid = candidateUser.passwords.includes(cleanPass);

    if (!isPasswordValid) {
      await recordFailedAttempt(ip, cleanEmail);
      return NextResponse.json(
        { error: 'Incorrect password. Please verify and try again.' },
        { status: 401 }
      );
    }

    // Clear rate limit on successful authentication
    await clearRateLimit(ip);

    const authenticatedUser = candidateUser;
    const userAgent = request.headers.get('user-agent') || 'Unknown Browser';

    // Check if client already has an active session cookie (for refresh)
    const existingSessionId = request.cookies.get('mili_session')?.value;

    // Create / refresh session — persists directly to Supabase device_sessions
    const result = await createSession(
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

    // Set secure HttpOnly session cookie
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
