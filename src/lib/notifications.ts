import webpush from 'web-push';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getVapidKeys } from '@/lib/vapid';

export type NotificationType =
  | 'photo'
  | 'video'
  | 'project'
  | 'turtle'
  | 'love_note'
  | 'message'
  | 'system';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  url: string;
  senderRole: 'sukhen' | 'mili' | 'system';
  senderName: string;
  image?: string;
  timestamp?: number;
}

export interface StoredPushSubscription {
  id: string;
  user_role: 'sukhen' | 'mili';
  user_name: string;
  endpoint: string;
  subscription: any;
  user_agent?: string;
  created_at?: string;
  updated_at?: string;
}

// Local filesystem fallback store for push subscriptions (safe for dev & resilient to DB delays)
const LOCAL_SUBS_FILE = path.join(process.cwd(), '.push_subscriptions.json');

function readLocalSubscriptions(): StoredPushSubscription[] {
  try {
    if (fs.existsSync(LOCAL_SUBS_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_SUBS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {
    // fallback
  }
  return [];
}

function writeLocalSubscriptions(subs: StoredPushSubscription[]) {
  try {
    fs.writeFileSync(LOCAL_SUBS_FILE, JSON.stringify(subs, null, 2), 'utf-8');
  } catch {
    // fallback
  }
}

/**
 * Save or update a Web Push subscription for a user role
 */
export async function savePushSubscription(params: {
  role: 'sukhen' | 'mili';
  name: string;
  subscription: any;
  userAgent?: string;
}): Promise<boolean> {
  const { role, name, subscription, userAgent } = params;
  const endpoint = subscription?.endpoint;
  if (!endpoint) return false;

  const id = `sub_${Buffer.from(endpoint).toString('base64url').slice(-32)}`;
  const record: StoredPushSubscription = {
    id,
    user_role: role,
    user_name: name,
    endpoint,
    subscription,
    user_agent: userAgent || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // 1. Save to local fallback file
  try {
    const local = readLocalSubscriptions().filter((s) => s.endpoint !== endpoint);
    local.push(record);
    writeLocalSubscriptions(local);
  } catch {}

  // 2. Save to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('push_subscriptions').upsert([
        {
          id: record.id,
          user_role: record.user_role,
          user_name: record.user_name,
          endpoint: record.endpoint,
          subscription: record.subscription,
          user_agent: record.user_agent,
          updated_at: record.updated_at,
        },
      ]);
      if (error) {
        console.warn('[Push Sub DB Warning] Supabase upsert note:', error.message);
      }
    } catch (err: any) {
      console.warn('[Push Sub DB Error]:', err?.message);
    }
  }

  return true;
}

/**
 * Get all push subscriptions for a target role
 */
export async function getSubscriptionsForRole(
  role: 'sukhen' | 'mili'
): Promise<StoredPushSubscription[]> {
  const map = new Map<string, StoredPushSubscription>();

  // 1. From local fallback
  readLocalSubscriptions()
    .filter((s) => s.user_role === role)
    .forEach((s) => map.set(s.endpoint, s));

  // 2. From Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_role', role);

      if (!error && Array.isArray(data)) {
        data.forEach((s) => {
          map.set(s.endpoint, {
            id: s.id,
            user_role: s.user_role,
            user_name: s.user_name,
            endpoint: s.endpoint,
            subscription: s.subscription,
            user_agent: s.user_agent,
          });
        });
      }
    } catch {
      // fallback to local map
    }
  }

  return Array.from(map.values());
}

/**
 * Remove an expired or unsubscribed endpoint
 */
export async function removePushSubscription(endpoint: string) {
  try {
    const local = readLocalSubscriptions().filter((s) => s.endpoint !== endpoint);
    writeLocalSubscriptions(local);
  } catch {}

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    } catch {}
  }
}

/**
 * Main Dispatcher:
 * 1. Broadcasts to active open tabs via Supabase Realtime (<50ms latency)
 * 2. Pushes to opposite user's devices via Web Push Service Worker (even if app is closed!)
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<{
  realtimeBroadcast: boolean;
  pushCount: number;
  errors: number;
}> {
  const fullPayload = {
    ...payload,
    timestamp: payload.timestamp || Date.now(),
  };

  let realtimeSuccess = false;

  // ── Step 1: Instant Supabase Realtime Broadcast ─────────────────────────────
  if (isSupabaseConfigured && supabase) {
    try {
      const channel = supabase.channel('mili-live-alerts');
      // Send broadcast
      await channel.send({
        type: 'broadcast',
        event: 'new_upload',
        payload: fullPayload,
      });
      realtimeSuccess = true;
    } catch (err: any) {
      console.warn('[Realtime Alert Error]:', err?.message);
    }
  }

  // ── Step 2: Web Push to Recipient (App Closed / Background) ─────────────────
  // Opposite role gets the alert:
  // If Sukhen uploaded -> Send to Mili
  // If Mili uploaded -> Send to Sukhen
  const targetRole: 'sukhen' | 'mili' =
    payload.senderRole === 'sukhen' ? 'mili' : 'sukhen';

  let pushCount = 0;
  let errorCount = 0;

  try {
    const vapid = getVapidKeys();
    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

    const subscriptions = await getSubscriptionsForRole(targetRole);

    if (subscriptions.length > 0) {
      const pushBody = JSON.stringify({
        title: fullPayload.title,
        body: fullPayload.body,
        url: fullPayload.url,
        type: fullPayload.type,
        icon: fullPayload.image || '/icon.png',
        badge: '/icon.png',
        timestamp: fullPayload.timestamp,
      });

      const promises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, pushBody, {
            TTL: 60 * 60 * 24, // 24 hours retention
            urgency: 'high',
          });
          pushCount++;
        } catch (pushErr: any) {
          errorCount++;
          // If status is 410 (Gone) or 404 (Not Found), remove dead subscription
          if (pushErr?.statusCode === 410 || pushErr?.statusCode === 404) {
            await removePushSubscription(sub.endpoint);
          }
        }
      });

      await Promise.allSettled(promises);
    }
  } catch (err: any) {
    console.warn('[Web Push Dispatch Error]:', err?.message);
  }

  return {
    realtimeBroadcast: realtimeSuccess,
    pushCount,
    errors: errorCount,
  };
}
