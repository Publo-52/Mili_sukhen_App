import { NextRequest, NextResponse } from 'next/server';

// Protected routes that strictly require authentication
const PROTECTED_PATHS = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('mili_session')?.value;

  // If already logged in and visiting /login, redirect to home
  if (pathname === '/login' && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check if route is protected
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|manifest.webmanifest).*)'],
};
