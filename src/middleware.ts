import { NextRequest, NextResponse } from 'next/server';

// Routes that are always public (do not require login)
const PUBLIC_PATHS = [
  '/login',
  '/api/',
  '/_next',
  '/images',
  '/favicon',
  '/icon',
  '/apple-icon',
  '/manifest',
  '/robots.txt',
  '/mili.jpg',
  '/mili_sketch.jpg',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const sessionCookie = request.cookies.get('mili_session')?.value;

  // If user is on /login and is already logged in with valid cookie, send them to home
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If it's a public path, allow through
  if (isPublic) {
    return NextResponse.next();
  }

  // All other pages require login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|manifest).*)'],
};
