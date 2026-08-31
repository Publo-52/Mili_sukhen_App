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

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 48 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function deriveDeviceName(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  let device = 'Unknown Device';
  let os = '';
  let browser = '';

  // OS Detection
  if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone')) os = 'iPhone';
  else if (ua.includes('ipad')) os = 'iPad';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'Mac';
  else if (ua.includes('linux')) os = 'Linux';

  // Browser Detection
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  if (os && browser) return `${os} · ${browser}`;
  if (os) return os;
  return 'Unknown Device';
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
  userInfo: { userName?: string; userRole?: 'mili' | 'sukhen' | 'guest'; avatar?: string } = {},
  existingSessionId?: string
): { session: DeviceSession } | { error: string; sessions?: DeviceSession[] } {
  let active = getActiveSessions();

  // If there's an existing session token for this client, and it is currently active, refresh/replace it in place
  if (existingSessionId) {
    const existingIndex = active.findIndex(s => s.id === existingSessionId);
    if (existingIndex !== -1) {
      const now = new Date();
      const expires = new Date(now.getTime() + AUTH_CONFIG.sessionExpiryMs);
      const updatedSession: DeviceSession = {
        id: generateId(),
        userName: userInfo.userName || active[existingIndex].userName || 'Mili',
        userRole: userInfo.userRole || active[existingIndex].userRole || 'mili',
        avatar: userInfo.avatar || active[existingIndex].avatar || (userInfo.userRole === 'sukhen' ? '✨' : '👑'),
        deviceName: deriveDeviceName(userAgent),
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

  if (active.length >= AUTH_CONFIG.maxDevices) {
    return {
      error: `Maximum ${AUTH_CONFIG.maxDevices} devices are already logged in. Please log out from one of your existing devices first.`,
      sessions: active.map(s => ({ ...s, userAgent: '' })), // strip UA for privacy
    };
  }

  const now = new Date();
  const expires = new Date(now.getTime() + AUTH_CONFIG.sessionExpiryMs);

  const session: DeviceSession = {
    id: generateId(),
    userName: userInfo.userName || 'Mili',
    userRole: userInfo.userRole || 'mili',
    avatar: userInfo.avatar || (userInfo.userRole === 'sukhen' ? '✨' : '👑'),
    deviceName: deriveDeviceName(userAgent),
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
  const active = getActiveSessions();
  const idx = active.findIndex(s => s.id === token);
  if (idx === -1) return null;

  // Refresh lastSeenAt
  active[idx].lastSeenAt = new Date().toISOString();
  writeSessions(active);
  return active[idx];
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
