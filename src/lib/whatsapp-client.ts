/**
 * Client-side WhatsApp Notification Dispatcher
 *
 * Receives the server's WhatsApp response from upload endpoints
 * and broadcasts a custom event for the UI toast/modal, or automatically
 * opens WhatsApp if the user has enabled auto-open.
 */

import { WhatsAppSendResult } from '@/lib/whatsapp';

export const WHATSAPP_DISPATCH_EVENT = 'mili-whatsapp-dispatch';
const AUTO_OPEN_STORAGE_KEY = 'mili_auto_open_whatsapp';

export function isAutoOpenEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUTO_OPEN_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAutoOpenEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTO_OPEN_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {}
}

export function dispatchWhatsAppResult(result: WhatsAppSendResult | null | undefined): void {
  if (!result || typeof window === 'undefined') return;

  // Broadcast to floating toast / modal listener
  try {
    const event = new CustomEvent<WhatsAppSendResult>(WHATSAPP_DISPATCH_EVENT, {
      detail: result,
    });
    window.dispatchEvent(event);
  } catch (e) {
    console.warn('[WhatsApp Dispatch Error]:', e);
  }

  // If auto-open is enabled by user and not already auto-sent by backend bot, open WhatsApp directly
  if (!result.autoSent && result.whatsappLink && isAutoOpenEnabled()) {
    try {
      window.open(result.whatsappLink, '_blank', 'noopener,noreferrer');
    } catch {
      // Browser popup blocker might require explicit user click
    }
  }
}

export function handleWhatsAppApiResponse(apiResponse: any): void {
  if (!apiResponse) return;
  if (apiResponse.whatsapp) {
    dispatchWhatsAppResult(apiResponse.whatsapp as WhatsAppSendResult);
  }
}
