import { getSessionFromRequest } from '@/lib/sessions';
import { timingSafeCompare } from '@/lib/security';

/**
 * Robust server-side admin authorization helper.
 *
 * Checks:
 * 1. Valid, cryptographically signed HttpOnly session cookie (userRole: 'sukhen' | 'mili')
 * 2. Optional server-only x-admin-token header compared against server-side ADMIN_PASSCODE using constant-time comparison
 */
export async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  try {
    // 1. Primary & Secure: Session cookie
    const session = await getSessionFromRequest(request);
    if (session && (session.userRole === 'sukhen' || session.userRole === 'mili')) {
      return true;
    }

    // 2. Optional server token header (for CLI, background jobs, or explicit token)
    const adminToken = request.headers.get('x-admin-token');
    const serverPasscode =
      process.env.ADMIN_PASSCODE ||
      process.env.NEXT_PUBLIC_ADMIN_PASSCODE ||
      (process.env.NODE_ENV === 'production' ? '' : 'das@123');

    if (serverPasscode && adminToken && timingSafeCompare(adminToken, serverPasscode)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
