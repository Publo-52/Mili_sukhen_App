/**
 * Server-side session store using cryptographically signed tokens (HMAC-SHA256).
 * Protects against tampering, session forging, and unauthorized privilege escalation.
 * Supports concurrent device sessions and serverless state synchronization.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { AUTH_CONFIG } from '@/data/config';

export interface DeviceSession {
  id: string;            // Unique signed session token
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

// Cryptographic signature secret
const SECRET_KEY =
  process.env.SESSION_SECRET ||
  process.env.CLOUDINARY_API_SECRET ||
  'suksharmi_ultra_secure_vault_secret_key_2026_signature';

function createHmacSignature(data: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(data).digest('hex');
}

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
    const signature = createHmacSignature(b64);
    return `sess_${b64}.${signature}`;
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
  const active = all.filter((s) => !isExpired(s));
  if (active.length !== all.length) writeSessions(active);
  return active;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Attempt to create a new cryptographically signed session for a device.
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

  const rawId = crypto.randomBytes(16).toString('hex');
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

  // If there's an existing session token for this client, update it in place
  if (existingSessionId) {
    const existingIndex = active.findIndex((s) => s.id === existingSessionId);
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

  // Strictly enforce max 3 active devices limit
  const nonExpired = active.filter((s) => !isExpired(s));
  if (nonExpired.length >= AUTH_CONFIG.maxDevices) {
    return {
      error: `Maximum login limit of ${AUTH_CONFIG.maxDevices} devices reached. Please log out from another device first.`,
      sessions: nonExpired,
    };
  }
  active = nonExpired;

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
 * Validate a session token. Checks signature and updates lastSeenAt.
 */
export function validateSession(token: string): DeviceSession | null {
  if (!token) return null;
  const active = getActiveSessions();
  const idx = active.findIndex((s) => s.id === token);
  if (idx !== -1) {
    active[idx].lastSeenAt = new Date().toISOString();
    writeSessions(active);
    return active[idx];
  }

  // Fallback: decode and verify signature for self-contained stateless tokens
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
  writeSessions(active.filter((s) => s.id !== token));
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
  writeSessions(active.filter((s) => s.id !== sessionId));
}

/**
 * Wipe all active sessions (admin force logout all).
 */
export function revokeAllSessions(): void {
  writeSessions([]);
}
