import { NextRequest, NextResponse } from 'next/server';

// Public endpoints and assets that do NOT require authentication
const PUBLIC_PREFIXES = [
  '/login',
  '/404',
  '/not-found',
  '/_not-found',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/audio/search',
  '/api/reels/likes',
  '/api/health',
  '/_next',
  '/images',
  '/audio',
  '/icons',
  '/icon',
  '/icon.png',
  '/logo.png',
  '/favicon.ico',
  '/favicon.png',
  '/apple-icon.png',
  '/manifest.webmanifest',
  '/opengraph-image',
  '/robots.txt',
  '/sitemap.xml',
];

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  res.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=(), browsing-topics=(), interest-cohort=(), autoplay=*'
  );
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mili_session')?.value;

  // 1. Always allow direct access to /login page
  if (pathname === '/login') {
    return applySecurityHeaders(NextResponse.next());
  }

  // 2. Request Payload Size Protection (Edge DoS Mitigation)
  const method = request.method.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const bytes = parseInt(contentLength, 10);
      const isUploadRoute = pathname.startsWith('/api/cloudinary/upload');
      const maxAllowedBytes = isUploadRoute ? 65 * 1024 * 1024 : 1 * 1024 * 1024; // 65MB for uploads, 1MB for API

      if (!isNaN(bytes) && bytes > maxAllowedBytes) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Payload Too Large: Request body exceeds maximum allowable limit.' },
            { status: 413 }
          )
        );
      }
    }
  }

  // 3. CSRF Protection: Block any cross-origin state-mutating API requests
  if (pathname.startsWith('/api/')) {
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin) {
        try {
          const originHost = new URL(origin).host.toLowerCase();
          const expectedHost = host?.toLowerCase() || '';
          if (originHost !== expectedHost) {
            return applySecurityHeaders(
              NextResponse.json(
                { error: 'Forbidden: Cross-Site Request Forgery (CSRF) blocked.' },
                { status: 403 }
              )
            );
          }
        } catch {
          return applySecurityHeaders(
            NextResponse.json(
              { error: 'Forbidden: Invalid request origin.' },
              { status: 403 }
            )
          );
        }
      }
    }
  }

  // 4. Allow public static assets and auth endpoints
  const isPublic =
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    ) ||
    Boolean(pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico|json|txt|mp3|ogg|wav|mp4|webm)$/i));

  if (isPublic) {
    return applySecurityHeaders(NextResponse.next());
  }

  // 5. For ALL other pages and routes (Home '/', '/projects/...', '/admin', etc.), require authentication
  // Validate token structure: must start with 'sess_' and have valid payload/signature format
  const isValidTokenFormat = Boolean(
    sessionCookie &&
    sessionCookie.startsWith('sess_') &&
    sessionCookie.includes('.') &&
    sessionCookie.length > 20 &&
    sessionCookie.length < 500
  );

  if (!isValidTokenFormat) {
    // If it's an API request, return 401 Unauthorized JSON
    if (pathname.startsWith('/api/')) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Authentication required. Please log in to access this resource.' },
          { status: 401 }
        )
      );
    }

    // For web pages, redirect immediately to /login with redirect parameter
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - images, audio, favicon, icons, logo
     */
    '/((?!_next/static|_next/image|images|audio|favicon.ico|favicon.png|logo.png|icon.png|apple-icon.png|manifest.webmanifest).*)',
  ],
};
