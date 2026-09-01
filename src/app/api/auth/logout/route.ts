import { NextRequest, NextResponse } from 'next/server';
import { removeSession } from '@/lib/sessions';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('mili_session')?.value;

  if (token) {
    removeSession(token);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('device_sessions').delete().eq('id', token);
      } catch (err) {
        console.warn('Supabase logout error:', err);
      }
    }
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
