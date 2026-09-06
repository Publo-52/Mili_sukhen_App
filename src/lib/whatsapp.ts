import { APP_CONFIG } from '@/data/config';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type UploadContentType =
  | 'photo'
  | 'video'
  | 'project'
  | 'turtle'
  | 'love_note'
  | 'message';

export interface WhatsAppNotificationParams {
  type: UploadContentType;
  title: string;
  body?: string;
  url?: string;
  senderRole: 'sukhen' | 'mili';
  senderName?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  targetRole: 'sukhen' | 'mili';
  targetName: string;
  targetPhone: string;
  messageText: string;
  whatsappLink: string;
  autoSent: boolean;
  error?: string;
}

// Phone numbers from configuration
const SUKHEN_WHATSAPP =
  process.env.SUKHEN_WHATSAPP ||
  APP_CONFIG.socials?.creatorWhatsapp ||
  '919832695291';

const MILI_WHATSAPP =
  process.env.MILI_WHATSAPP ||
  APP_CONFIG.socials?.recipientWhatsapp ||
  '919732934032';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://mili-universe.vercel.app');

/**
 * Format the romantic WhatsApp message based on upload category and sender
 */
export function formatWhatsAppMessage(params: WhatsAppNotificationParams): {
  targetRole: 'sukhen' | 'mili';
  targetName: string;
  targetPhone: string;
  text: string;
} {
  const isSukhenSender = params.senderRole === 'sukhen';
  const targetRole: 'sukhen' | 'mili' = isSukhenSender ? 'mili' : 'sukhen';
  const targetName = isSukhenSender ? 'মিলি' : 'সুখেন';
  const senderName = isSukhenSender ? 'সুখেন' : 'মিলি';
  const targetPhone = isSukhenSender ? MILI_WHATSAPP : SUKHEN_WHATSAPP;

  const contentUrl = params.url
    ? params.url.startsWith('http')
      ? params.url
      : `${SITE_URL}${params.url.startsWith('/') ? '' : '/'}${params.url}`
    : SITE_URL;

  let text = '';

  switch (params.type) {
    case 'photo':
      text =
        `❤️ *হ্যালো ${targetName}!* \n\n` +
        `📸 *${senderName}* তোমার জন্য ওয়েবসাইটে একটি নতুন স্মৃতি ছবি আপলোড করেছে!\n\n` +
        `✨ *শিরোনাম:* ${params.title}\n` +
        (params.body ? `📍 *বিবরণ:* ${params.body}\n` : '') +
        `\n🔗 *এখনই দেখতে ক্লিক করো:*\n${contentUrl}`;
      break;

    case 'video':
      text =
        `❤️ *হ্যালো ${targetName}!* \n\n` +
        `🎥 *${senderName}* তোমার জন্য একটি নতুন সুন্দর ভিডিও আপলোড করেছে!\n\n` +
        `✨ *শিরোনাম:* ${params.title}\n` +
        (params.body ? `📍 *বিবরণ:* ${params.body}\n` : '') +
        `\n🔗 *এখনই দেখতে ক্লিক করো:*\n${contentUrl}`;
      break;

    case 'love_note':
      text =
        `💌 *প্রিয় ${targetName}!* \n\n` +
        `💖 *${senderName}* তোমার জন্য একটি নতুন গভীর ভালোবাসার নোট লিখেছে!\n\n` +
        `📜 *চিঠির শিরোনাম:* ${params.title}\n` +
        (params.body ? `💬 "${params.body.slice(0, 120)}..."\n` : '') +
        `\n🔗 *সম্পূর্ণ চিঠিটি পড়তে ক্লিক করো:*\n${contentUrl}`;
      break;

    case 'project':
      text =
        `🚀 *হ্যালো ${targetName}!* \n\n` +
        `💻 *${senderName}* একটি নতুন ডিজিটাল প্রজেক্ট তৈরি করে আপলোড করেছে!\n\n` +
        `🌟 *প্রজেক্ট:* ${params.title}\n` +
        (params.body ? `📝 *বিবরণ:* ${params.body}\n` : '') +
        `\n🔗 *লাইভ দেখতে ক্লিক করো:*\n${contentUrl}`;
      break;

    case 'turtle':
      text =
        `🎨 *হ্যালো ${targetName}!* \n\n` +
        `✨ *${senderName}* তোমার জন্য একটি নতুন পাইথন টার্টল আর্ট তৈরি করেছে!\n\n` +
        `🖼️ *আর্টওয়ার্ক:* ${params.title}\n` +
        (params.body ? `🪄 *বিবরণ:* ${params.body}\n` : '') +
        `\n🔗 *আর্টটি দেখতে ক্লিক করো:*\n${contentUrl}`;
      break;

    case 'message':
    default:
      text =
        `💬 *হ্যালো ${targetName}!* \n\n` +
        `💌 *${senderName}* তোমাকে একটি মিষ্টি মেসেজ পাঠিয়েছে:\n\n` +
        `"${params.title}"\n` +
        (params.body ? `\n${params.body}\n` : '') +
        `\n🔗 *রিপ্লাই দিতে বা দেখতে ভিজিট করো:*\n${contentUrl}`;
      break;
  }

  return {
    targetRole,
    targetName,
    targetPhone,
    text,
  };
}

/**
 * Generate a direct WhatsApp Web/Mobile link (wa.me)
 */
export function getWhatsAppDirectUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Main Dispatcher:
 * 1. Formats the message
 * 2. Saves an in-app message record in Supabase
 * 3. Sends via automated WhatsApp Gateway if configured (CallMeBot / Webhook)
 * 4. Returns the ready-to-use WhatsApp Direct URL
 */
export async function sendWhatsAppNotification(
  params: WhatsAppNotificationParams
): Promise<WhatsAppSendResult> {
  const { targetRole, targetName, targetPhone, text } = formatWhatsAppMessage(params);
  const whatsappLink = getWhatsAppDirectUrl(targetPhone, text);

  let autoSent = false;
  let sendError: string | undefined;

  // 1. Auto-save an in-app direct message so it's always recorded
  try {
    if (isSupabaseConfigured && supabase) {
      const senderDisplayName = params.senderRole === 'sukhen' ? 'Sukhen' : 'Mili';
      await supabase.from('messages').insert([
        {
          id: `wa_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          sender: senderDisplayName,
          message: text,
          mood: '❤️',
          read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  } catch {
    // safe fallback
  }

  // 2. Automated background WhatsApp dispatch via CallMeBot API (if apikey is set)
  const callMeBotKey =
    targetRole === 'mili'
      ? process.env.MILI_CALLMEBOT_APIKEY
      : process.env.SUKHEN_CALLMEBOT_APIKEY;

  if (callMeBotKey) {
    try {
      const cleanPhone = targetPhone.startsWith('+') ? targetPhone : `+${targetPhone}`;
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
        cleanPhone
      )}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(callMeBotKey)}`;

      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        autoSent = true;
      } else {
        sendError = `CallMeBot HTTP ${res.status}`;
      }
    } catch (err: any) {
      sendError = err?.message;
    }
  }

  // 3. Automated background WhatsApp dispatch via custom Webhook (if set)
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
  if (!autoSent && webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          targetName,
          senderRole: params.senderRole,
          text,
          whatsappLink,
        }),
      });
      if (res.ok) {
        autoSent = true;
      }
    } catch (err: any) {
      sendError = err?.message;
    }
  }

  return {
    success: true,
    targetRole,
    targetName,
    targetPhone,
    messageText: text,
    whatsappLink,
    autoSent,
    error: sendError,
  };
}
