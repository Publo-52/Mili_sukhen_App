import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

const VAPID_CACHE_FILE = path.join(process.cwd(), '.vapid_keys.json');
const DEFAULT_SUBJECT = 'mailto:sukhen.mili@universe.local';

let cachedKeys: VapidKeys | null = null;

export function getVapidKeys(): VapidKeys {
  if (cachedKeys) {
    return cachedKeys;
  }

  // 1. Check environment variables
  const envPublic = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const envPrivate = process.env.VAPID_PRIVATE_KEY;
  const envSubject = process.env.VAPID_SUBJECT || DEFAULT_SUBJECT;

  if (envPublic && envPrivate) {
    cachedKeys = {
      publicKey: envPublic.trim(),
      privateKey: envPrivate.trim(),
      subject: envSubject.trim(),
    };
    return cachedKeys;
  }

  // 2. Check persistent disk file
  try {
    if (fs.existsSync(VAPID_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(VAPID_CACHE_FILE, 'utf-8'));
      if (data.publicKey && data.privateKey) {
        cachedKeys = {
          publicKey: data.publicKey,
          privateKey: data.privateKey,
          subject: data.subject || DEFAULT_SUBJECT,
        };
        return cachedKeys;
      }
    }
  } catch (err) {
    console.warn('[VAPID Warning] Could not read .vapid_keys.json:', err);
  }

  // 3. Generate permanent keys if none exist
  try {
    const generated = webpush.generateVAPIDKeys();
    const newKeys: VapidKeys = {
      publicKey: generated.publicKey,
      privateKey: generated.privateKey,
      subject: DEFAULT_SUBJECT,
    };

    try {
      fs.writeFileSync(VAPID_CACHE_FILE, JSON.stringify(newKeys, null, 2), 'utf-8');
    } catch (saveErr) {
      console.warn('[VAPID Warning] Could not persist keys to .vapid_keys.json:', saveErr);
    }

    // Attempt to safely append to .env.local if present
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        if (!envContent.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY')) {
          fs.appendFileSync(
            envPath,
            `\n# ─── Web Push VAPID Keys ──────────────────────────────────────────────────────\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${newKeys.publicKey}\nVAPID_PRIVATE_KEY=${newKeys.privateKey}\nVAPID_SUBJECT=${newKeys.subject}\n`
          );
        }
      }
    } catch {
      // safe fallback
    }

    cachedKeys = newKeys;
    return cachedKeys;
  } catch (genErr) {
    console.error('[VAPID Error] Failed to generate VAPID keys:', genErr);
    // Hardcoded emergency fallback keypair (valid P-256 coordinates)
    cachedKeys = {
      publicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
      privateKey: 'DEV_EMERGENCY_FALLBACK_KEY_MUST_BE_OVERRIDDEN',
      subject: DEFAULT_SUBJECT,
    };
    return cachedKeys;
  }
}

export function getVapidPublicKey(): string {
  return getVapidKeys().publicKey;
}
