import { NextRequest, NextResponse } from 'next/server';

// Public endpoints and assets that do NOT require authentication
const PUBLIC_PREFIXES = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/_next',
  '/images',
  '/audio',
  '/icons',
  '/logo.png',
  '/favicon.ico',
  '/icon.png',
  '/apple-icon.png',
  '/manifest.webmanifest',
  '/opengraph-image',
  '/robots.txt',
  '/sitemap.xml',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mili_session')?.value;

  // 1. If already logged in and visiting /login, redirect to home
  if (pathname === '/login') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow public static assets and auth endpoints
  const isPublic =
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    ) ||
    Boolean(pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico|json|txt|mp3|ogg|wav|mp4|webm)$/i));

  if (isPublic) {
    return NextResponse.next();
  }

  // 3. For ALL other pages and routes (Home '/', '/projects/...', '/admin', etc.), require authentication
  if (!sessionCookie) {
    // If it's an API request, return 401 Unauthorized JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to access this resource.' },
        { status: 401 }
      );
    }

    // For web pages, redirect immediately to /login with redirect parameter
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
