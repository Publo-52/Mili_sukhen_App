import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function calculateDaysTogether(startDateString: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
} {
  const start = new Date(startDateString).getTime();
  const now = new Date().getTime();
  const diffMs = Math.max(0, now - start);

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    days: totalDays,
    hours,
    minutes,
    seconds,
    totalDays,
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generates a bulletproof WhatsApp URL for web and mobile devices.
 * Automatically strips invalid symbols (+, -, spaces) and adds country code if missing.
 */
export function getWhatsAppUrl(phoneNumber: string | undefined, message?: string): string {
  if (!phoneNumber) return 'https://api.whatsapp.com/send';

  // Strip all non-digit characters
  let cleanNumber = phoneNumber.replace(/\D/g, '');

  // If number starts with 0 and has 11 digits (e.g. 09832695291), replace leading 0 with 91
  if (cleanNumber.startsWith('0') && cleanNumber.length === 11) {
    cleanNumber = '91' + cleanNumber.slice(1);
  }

  // If 10 digits without country code (e.g. 9832695291 or 9732934032), add India country code 91
  if (cleanNumber.length === 10) {
    cleanNumber = '91' + cleanNumber;
  }

  const encodedText = message ? encodeURIComponent(message) : '';
  const textParam = encodedText ? `&text=${encodedText}` : '';

  return `https://api.whatsapp.com/send?phone=${cleanNumber}${textParam}`;
}

