/**
 * Server-side session store using a local JSON file for persistence.
 * Supports maximum N concurrent device sessions.
 *
 * Sessions survive server restarts via .sessions.json in the project root.
 * In production, swap this out for a Supabase / Redis store.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { AUTH_CONFIG } from '@/data/config';

export interface DeviceSession {
  id: string;            // Unique session token (UUID-like)
  userName: string;      // "Mili" or "Sukhen"
  userRole: 'mili' | 'sukhen' | 'guest'; // Role identifier
  userEmail?: string;    // Logged in email
  avatar?: string;       // User avatar emoji/icon
  deviceName: string;    // Friendly derived device label
  userAgent: string;     // Raw user-agent string
  ip: string;            // Request IP address
  createdAt: string;     // ISO timestamp of login
  lastSeenAt: string;    // ISO timestamp of last activity
  expiresAt: string;     // ISO timestamp of expiry
}

const SESSIONS_FILE = join(process.cwd(), '.sessions.json');

// ── Persistence helpers ──────────────────────────────────────────────────────

function readSessions(): DeviceSession[] {
  try {
    if (!existsSync(SESSIONS_FILE)) return [];
    const raw = readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw) as DeviceSession[];
  } catch {
    return [];
  }
}

function writeSessions(sessions: DeviceSession[]): void {
  try {
    writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Sessions] Failed to persist sessions:', e);
  }
}

// ── Utilities ────────────────────────────────────────────────────────────────

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
    return `sess_${b64}`;
  } catch {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 48 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }
}

function decodeSessionToken(token: string): DeviceSession | null {
  try {
    if (!token.startsWith('sess_')) return null;
    const b64 = token.slice(5);
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
  const ua = userAgent.toLowerCase();
  let os = '';
  let browser = '';

  // OS Detection
  if (ua.includes('android')) os = 'Android Phone';
  else if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('windows')) os = 'Windows PC';
  else if (ua.includes('mac os') || ua.includes('macintosh')) os = 'Mac';
  else if (ua.includes('linux')) os = 'Linux';

  // Browser Detection
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  if (os && browser) return `${os} (${browser})`;
  if (os) return os;
  return 'Mobile / Web Browser';
}

function isExpired(session: DeviceSession): boolean {
  return new Date(session.expiresAt).getTime() < Date.now();
}

function getActiveSessions(): DeviceSession[] {
  const all = readSessions();
  // Prune expired sessions automatically
  const active = all.filter(s => !isExpired(s));
  if (active.length !== all.length) writeSessions(active);
  return active;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Attempt to create a new session for a device.
 * Returns the session if successful, or an error string.
 */
export function createSession(
  userAgent: string,
  ip: string,
  userInfo: { userName?: string; userRole?: 'mili' | 'sukhen' | 'guest'; userEmail?: string; avatar?: string } = {},
  existingSessionId?: string
): { session: DeviceSession } | { error: string; sessions?: DeviceSession[] } {
  let active = getActiveSessions();

  const now = new Date();
  const expires = new Date(now.getTime() + AUTH_CONFIG.sessionExpiryMs);
  const deviceName = deriveDeviceName(userAgent);

  const rawId = Math.random().toString(36).substring(2, 15);
  const userName = userInfo.userName || 'Mili';
  const userRole = userInfo.userRole || 'mili';
  const userEmail = userInfo.userEmail || (userRole === 'sukhen' ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com');
  const avatar = userInfo.avatar || (userRole === 'sukhen' ? '✨' : '👑');

  const tokenId = encodeSessionToken({
    id: rawId,
    userName,
    userRole,
    userEmail,
    avatar,
    deviceName,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  });

  // If there's an existing session token for this client, and it is currently active, refresh/replace it in place
  if (existingSessionId) {
    const existingIndex = active.findIndex(s => s.id === existingSessionId);
    if (existingIndex !== -1) {
      const updatedSession: DeviceSession = {
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
      active[existingIndex] = updatedSession;
      writeSessions(active);
      return { session: updatedSession };
    }
  }

  // Allow up to maxDevices; if full, remove oldest expired/least active session or return error
  if (active.length >= AUTH_CONFIG.maxDevices) {
    // If an old session is from the same IP or expired, clean it up
    const nonExpired = active.filter(s => !isExpired(s));
    if (nonExpired.length >= AUTH_CONFIG.maxDevices) {
      // Rotate out oldest session to prevent blocking user logins
      active = nonExpired.slice(1);
    } else {
      active = nonExpired;
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

  writeSessions([...active, session]);
  return { session };
}

/**
 * Validate a session token. Updates lastSeenAt if valid.
 */
export function validateSession(token: string): DeviceSession | null {
  if (!token) return null;
  const active = getActiveSessions();
  const idx = active.findIndex(s => s.id === token);
  if (idx !== -1) {
    // Refresh lastSeenAt
    active[idx].lastSeenAt = new Date().toISOString();
    writeSessions(active);
    return active[idx];
  }

  // Fallback: decode stateless self-contained token (for serverless instances)
  const decoded = decodeSessionToken(token);
  if (decoded) {
    writeSessions([...active, decoded]);
    return decoded;
  }

  return null;
}

/**
 * Validate session from request cookie
 */
export function getSessionFromRequest(request: Request): DeviceSession | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/mili_session=([^;]+)/);
  if (!match || !match[1]) return null;
  return validateSession(match[1]);
}

/**
 * Remove a specific session by token (logout).
 */
export function removeSession(token: string): void {
  const active = getActiveSessions();
  writeSessions(active.filter(s => s.id !== token));
}

/**
 * Get all active sessions (for admin dashboard).
 */
export function getAllSessions(): DeviceSession[] {
  return getActiveSessions();
}

/**
 * Force-remove a session by its ID (admin revoke).
 */
export function revokeSession(sessionId: string): void {
  const active = getActiveSessions();
  writeSessions(active.filter(s => s.id !== sessionId));
}

/**
 * Wipe all active sessions (admin force logout all).
 */
export function revokeAllSessions(): void {
  writeSessions([]);
}
