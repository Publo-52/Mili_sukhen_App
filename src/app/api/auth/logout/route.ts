import { NextRequest, NextResponse } from 'next/server';
import { removeSession } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('mili_session')?.value;

  if (token) {
    await removeSession(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });

  // Clear the session cookie
  response.cookies.set('mili_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
