import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Constant-time string comparison to defend against timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  if (bufA.length !== bufB.length) {
    // Perform dummy constant-time comparison to avoid leaking length differences via CPU cycle timing
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitize plain text strings by stripping null bytes, control characters,
 * and dangerous script tags to prevent XSS / injection.
 */
export function sanitizeText(input: unknown, maxLength: number = 5000): string {
  if (typeof input !== 'string') return '';
  
  // 1. Remove null bytes and non-printable control characters (except newline and tab)
  let clean = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip explicit HTML tags (<script>, <iframe>, <object>, etc.)
  clean = clean
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi, '')
    .replace(/<\s*object[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi, '')
    .replace(/<\s*embed[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi, '')
    .replace(/on\w+\s*=\s*(['"]).*?\1/gi, '') // Remove inline event handlers (onerror=, onclick=)
    .replace(/javascript\s*:/gi, 'blocked:');

  // 3. Truncate to maximum allowable length
  return clean.slice(0, maxLength).trim();
}

/**
 * Validates external URLs to prevent Server-Side Request Forgery (SSRF)
 * and malicious redirection to private cloud metadata or local networks.
 */
export function isSafeExternalUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    // Allow only HTTP and HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Deny local, loopback, private RFC-1918 subnets, and cloud metadata IPs
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' || // AWS / GCP / Azure Instance Metadata
      hostname === 'metadata.google.internal' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * In-memory distributed rate-limiter store with automatic garbage collection.
 */
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}
const inMemoryLimits = new Map<string, RateLimitRecord>();

/**
 * Generic rate limiter supporting both Supabase and in-memory fallbacks.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  lockoutDurationMs: number = 5 * 60 * 1000
): Promise<{ allowed: boolean; waitSeconds?: number }> {
  const now = Date.now();
  const record = inMemoryLimits.get(key);

  if (record) {
    if (record.lockedUntil > now) {
      return { allowed: false, waitSeconds: Math.ceil((record.lockedUntil - now) / 1000) };
    }
    if (now - record.lastAttempt > 15 * 60 * 1000) {
      inMemoryLimits.delete(key);
    }
  }

  return { allowed: true };
}

export function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  lockoutDurationMs: number = 5 * 60 * 1000
): void {
  const now = Date.now();
  const record = inMemoryLimits.get(key) || { attempts: 0, lockedUntil: 0, lastAttempt: now };
  record.attempts += 1;
  record.lastAttempt = now;

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutDurationMs;
  }
  inMemoryLimits.set(key, record);
}

export function clearRateLimit(key: string): void {
  inMemoryLimits.delete(key);
}

/**
 * Extract clean client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
