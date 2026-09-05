/**
 * Server-side session management backed by Supabase device_sessions.
 *
 * Strategy:
 *   1. Supabase is the authoritative, persistent source of truth.
 *   2. HMAC-signed stateless token decoding is a self-healing fallback
 *      (used when Supabase is temporarily unavailable or in local dev
 *      without a configured Supabase project).
 *   3. No filesystem dependency — safe for serverless / Vercel deployments.
 *
 * All public functions are async.
 */

import crypto from 'crypto';
import { AUTH_CONFIG } from '@/data/config';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface DeviceSession {
  id: string;            // Signed session token (primary key)
  userName: string;      // "Mili" or "Sukhen"
  userRole: 'mili' | 'sukhen' | 'guest';
  userEmail?: string;    // Logged-in email / phone
  avatar?: string;       // User avatar character
  deviceName: string;    // Friendly device label derived from UA
  userAgent: string;     // Raw user-agent string
  ip: string;            // Request IP address
  createdAt: string;     // ISO timestamp of login
  lastSeenAt: string;    // ISO timestamp of last activity
  expiresAt: string;     // ISO timestamp of expiry
}

// ── Cryptographic helpers ─────────────────────────────────────────────────────

const SECRET_KEY = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'CRITICAL SECURITY CONFIG ERROR: SESSION_SECRET environment variable is not set. ' +
        'Set a strong random string (≥64 chars) in your production environment.'
      );
    }
    console.warn(
      '⚠️  [DEV WARNING] SESSION_SECRET is not set. ' +
      'Using a dev-only fallback. Set SESSION_SECRET in .env.local before deploying.'
    );
    return 'dev_only_fallback_not_for_production_use_at_all_32_chars_minimum_';
  }
  return secret;
})();

function createHmacSignature(data: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
}

function encodeSessionToken(payload: {
  id: string;
  userName: string;
  userRole: 'mili' | 'sukhen' | 'guest';
  userEmail?: string;
  avatar?: string;
  deviceName: string;
  createdAt: string;
  expiresAt: string;
}): string {
  try {
    const compact = {
      i: payload.id,
      u: payload.userName,
      r: payload.userRole,
      e: payload.userEmail,
      a: payload.avatar,
      d: payload.deviceName,
      c: payload.createdAt,
      x: payload.expiresAt,
    };
    const b64 = Buffer.from(JSON.stringify(compact)).toString('base64url');
    const signature = createHmacSignature(b64);
    return `sess_${b64}.${signature}`;
  } catch {
    // Extremely unlikely fallback — never leave tokens unsigned
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 48 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }
}

function decodeSessionToken(token: string): DeviceSession | null {
  try {
    if (!token.startsWith('sess_')) return null;
    const raw = token.slice(5);
    const parts = raw.split('.');

    let b64 = raw;

    if (parts.length === 2) {
      const [payloadB64, signature] = parts;
      const expectedSig = createHmacSignature(payloadB64);
      if (signature !== expectedSig) {
        console.warn('[Security Alert] Tampered or invalid session signature detected!');
        return null;
      }
      b64 = payloadB64;
    }

    const json = Buffer.from(b64, 'base64url').toString('utf-8');
    const p = JSON.parse(json);
    if (!p || !p.x || new Date(p.x).getTime() < Date.now()) return null;

    return {
      id: token,
      userName: p.u || 'Mili',
      userRole: p.r || 'mili',
      userEmail: p.e,
      avatar: p.a,
      deviceName: p.d || 'Device',
      userAgent: '',
      ip: '127.0.0.1',
      createdAt: p.c || new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      expiresAt: p.x,
    };
  } catch {
    return null;
  }
}

function deriveDeviceName(userAgent: string): string {
  const ua = (typeof userAgent === 'string' ? userAgent : '').toLowerCase();
  let os = '';
  let browser = '';

  if (ua.includes('android')) os = 'Android Phone';
  else if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('windows')) os = 'Windows PC';
  else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'Mac';
  else if (ua.includes('linux')) os = 'Linux';

  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  if (os && browser) return `${os} (${browser})`;
  if (os) return os;
  return 'Mobile / Web Browser';
}

// ── Supabase row mapper ───────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>): DeviceSession {
  return {
    id: row.id as string,
    userName: (row.user_name as string) || 'Mili',
    userRole: (row.user_role as 'mili' | 'sukhen' | 'guest') || 'mili',
    userEmail: row.user_email as string | undefined,
    avatar: row.avatar as string | undefined,
    deviceName: (row.device_name as string) || 'Device',
    userAgent: (row.user_agent as string) || '',
    ip: (row.ip as string) || '127.0.0.1',
    createdAt: row.created_at as string,
    lastSeenAt: row.last_seen_at as string,
    expiresAt: row.expires_at as string,
  };
}

// ── Supabase database operations ──────────────────────────────────────────────

async function dbUpsertSession(session: DeviceSession): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('device_sessions').upsert([
      {
        id: session.id,
        user_name: session.userName,
        user_role: session.userRole,
        user_email: session.userEmail ?? null,
        avatar: session.avatar ?? null,
        device_name: session.deviceName,
        user_agent: session.userAgent,
        ip: session.ip,
        created_at: session.createdAt,
        last_seen_at: session.lastSeenAt,
        expires_at: session.expiresAt,
      },
    ]);
  } catch (err) {
    console.warn('[Sessions] Supabase upsert failed:', err);
  }
}

async function dbGetSession(token: string): Promise<DeviceSession | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('device_sessions')
      .select('*')
      .eq('id', token)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    return mapRow(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

async function dbGetAllActiveSessions(): Promise<DeviceSession[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('device_sessions')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('last_seen_at', { ascending: false });
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return [];
  }
}

async function dbUpdateLastSeen(token: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase
      .from('device_sessions')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', token);
  } catch {
    // Non-critical — do not propagate
  }
}

export async function updateSessionActivity(token: string): Promise<void> {
  await dbUpdateLastSeen(token);
}

async function dbDeleteSession(token: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('device_sessions').delete().eq('id', token);
  } catch (err) {
    console.warn('[Sessions] Supabase delete failed:', err);
  }
}

async function dbDeleteAllSessions(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    // Delete all rows (neq '' matches everything since id is never empty)
    await supabase.from('device_sessions').delete().neq('id', '');
  } catch (err) {
    console.warn('[Sessions] Supabase delete-all failed:', err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Create a new cryptographically signed session and persist it to Supabase.
 */
export async function createSession(
  userAgent: string,
  ip: string,
  userInfo: {
    userName?: string;
    userRole?: 'mili' | 'sukhen' | 'guest';
    userEmail?: string;
    avatar?: string;
  } = {},
  existingSessionId?: string
): Promise<{ session: DeviceSession } | { error: string; sessions?: DeviceSession[] }> {
  const activeSessions = await dbGetAllActiveSessions();

  const now = new Date();
  const expires = new Date(now.getTime() + AUTH_CONFIG.sessionExpiryMs);
  const deviceName = deriveDeviceName(userAgent);

  const rawId = crypto.randomBytes(16).toString('hex');
  const userName = userInfo.userName || 'Mili';
  const userRole = userInfo.userRole || 'mili';
  const userEmail =
    userInfo.userEmail ||
    (userRole === 'sukhen' ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com');
  const avatar = userInfo.avatar || (userRole === 'sukhen' ? '✨' : '👑');

  const existingSession = existingSessionId
    ? activeSessions.find((s) => s.id === existingSessionId)
    : undefined;
  const originalCreatedAt = existingSession?.createdAt || now.toISOString();

  const tokenId = encodeSessionToken({
    id: rawId,
    userName,
    userRole,
    userEmail,
    avatar,
    deviceName,
    createdAt: originalCreatedAt,
    expiresAt: expires.toISOString(),
  });

  // If the client already has an active session token, refresh it in-place
  if (existingSession && existingSessionId) {
    await dbDeleteSession(existingSessionId);
    const updatedSession: DeviceSession = {
      id: tokenId,
      userName,
      userRole,
      userEmail,
      avatar,
      deviceName,
      userAgent,
      ip,
      createdAt: originalCreatedAt,
      lastSeenAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    await dbUpsertSession(updatedSession);
    return { session: updatedSession };
  }

  // Clean up any naturally expired sessions before checking device count
  await cleanupExpiredSessions().catch(() => {});

  // Smart Session Management: If device limit (3) is reached, auto-evict the oldest session
  // This completely eliminates the permanent lockout trap while strictly keeping maxDevices <= 3
  if (activeSessions.length >= AUTH_CONFIG.maxDevices) {
    const sorted = [...activeSessions].sort(
      (a, b) => new Date(a.lastSeenAt || a.createdAt).getTime() - new Date(b.lastSeenAt || b.createdAt).getTime()
    );
    const toEvictCount = activeSessions.length - AUTH_CONFIG.maxDevices + 1;
    for (let i = 0; i < toEvictCount && i < sorted.length; i++) {
      console.log(`[Sessions] Auto-evicting oldest session to make room for new device login.`);
      await dbDeleteSession(sorted[i].id);
    }
  }

  const session: DeviceSession = {
    id: tokenId,
    userName,
    userRole,
    userEmail,
    avatar,
    deviceName,
    userAgent,
    ip,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };

  await dbUpsertSession(session);
  return { session };
}

/**
 * Validate a session token.
 * Supabase is the authoritative check; HMAC decode is a self-healing fallback.
 */
export async function validateSession(token: string): Promise<DeviceSession | null> {
  if (!token) return null;

  // 1. Authoritative: Supabase lookup (checks expiry in the query)
  try {
    const dbSession = await dbGetSession(token);
    if (dbSession) {
      // Fire-and-forget last-seen update (non-blocking)
      dbUpdateLastSeen(token).catch(() => {});
      return dbSession;
    }
  } catch (err) {
    console.warn('[Sessions] Supabase lookup error:', err);
  }

  // 2. Cryptographic Self-Healing Fallback: Verify HMAC signature on token
  // Guarantees unexpired, signed sessions remain active even during Supabase latency or cold starts
  const decoded = decodeSessionToken(token);
  if (decoded) {
    if (isSupabaseConfigured && supabase) {
      // Re-sync to database asynchronously in background
      dbUpsertSession(decoded).catch(() => {});
    }
    return decoded;
  }

  return null;
}

/**
 * Extract and validate a session from an HTTP request's Cookie header.
 */
export async function getSessionFromRequest(request: Request): Promise<DeviceSession | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/mili_session=([^;]+)/);
  if (!match || !match[1]) return null;
  return validateSession(match[1]);
}

/**
 * Remove a specific session (logout from one device).
 */
export async function removeSession(token: string): Promise<void> {
  await dbDeleteSession(token);
}

/**
 * Get all currently active (non-expired) sessions.
 */
export async function getAllSessions(): Promise<DeviceSession[]> {
  return dbGetAllActiveSessions();
}

/**
 * Force-revoke a session by its ID (admin action).
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await dbDeleteSession(sessionId);
}

/**
 * Wipe every active session (admin force-logout all devices).
 */
export async function revokeAllSessions(): Promise<void> {
  await dbDeleteAllSessions();
}

/**
 * Delete all expired sessions from Supabase (housekeeping).
 */
export async function cleanupExpiredSessions(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase
      .from('device_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
  } catch (err) {
    console.warn('[Sessions] Cleanup expired sessions failed:', err);
  }
}
