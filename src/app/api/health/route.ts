import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Health & Keep-Alive Heartbeat Endpoint
 * 
 * 1. Resets Supabase's 7-day inactivity timer to prevent project pausing on the free tier.
 * 2. Can be pinged by UptimeRobot, cron-job.org, or client app on load.
 */
export async function GET() {
  const startTime = Date.now();
  let supabaseStatus = 'not_configured';

  if (isSupabaseConfigured && supabase) {
    try {
      // Lightweight query to touch Supabase and keep it awake
      const { data, error } = await supabase
        .from('memories')
        .select('id')
        .limit(1);

      supabaseStatus = error ? `error: ${error.message}` : 'active';
    } catch (err: any) {
      supabaseStatus = `unreachable: ${err?.message || 'timeout'}`;
    }
  }

  const latencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: 'ok',
      service: 'suksharmi-universe',
      supabase: supabaseStatus,
      latencyMs,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
