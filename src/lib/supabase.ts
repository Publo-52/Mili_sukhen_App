import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getSanitizedUrl(): string {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

const supabaseUrl = getSanitizedUrl();
const isServer = typeof window === 'undefined';

// On the server, use SUPABASE_SERVICE_ROLE_KEY if provided to bypass RLS securely;
// On the client (browser), always use the public ANON key.
const supabaseKey = isServer
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  !supabaseUrl.includes('your-project-id')
);

function initSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (err) {
    console.warn('[Supabase Init Warning] Could not initialize client:', err);
    return null;
  }
}

export const supabase = initSupabase();
