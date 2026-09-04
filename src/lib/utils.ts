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
 * Accurately detects whether a media item or URL is a video
 */
export function isMediaVideo(item?: { type?: string; url?: string } | string | null): boolean {
  if (!item) return false;
  if (typeof item === 'string') {
    return Boolean(
      item.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) ||
      item.includes('/video/upload/') ||
      item.includes('resource_type=video')
    );
  }
  if (item.type === 'video') return true;
  return Boolean(
    item.url?.match(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i) ||
    item.url?.includes('/video/upload/') ||
    item.url?.includes('resource_type=video')
  );
}

/**
 * Automatically transforms Cloudinary and Unsplash URLs into fast, compressed thumbnails
 * Converts massive 10MB-20MB raw photos down to ~35KB-60KB WebP images for instant 60fps scrolling
 */
export function getOptimizedImageUrl(
  url?: string,
  options: { width?: number; height?: number; quality?: string | number; crop?: string } = {}
): string {
  if (!url) return '';
  const { width = 800, quality = 'auto', crop = 'limit' } = options;

  if (url.includes('res.cloudinary.com')) {
    const isVideo = isMediaVideo(url);

    if (isVideo) {
      // For video poster thumbnail: replace video extension with .jpg and apply f_jpg
      let posterUrl = url.replace(/\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i, '.jpg');
      if (posterUrl.includes('/video/upload/')) {
        if (!posterUrl.includes('/video/upload/w_') && !posterUrl.includes('/video/upload/so_')) {
          posterUrl = posterUrl.replace(
            '/video/upload/',
            `/video/upload/so_0,w_${width},c_${crop},q_auto,f_jpg/`
          );
        }
      }
      return posterUrl;
    }

    // For standard images
    if (url.includes('/image/upload/')) {
      if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/w_')) {
        return url;
      }
      const transform = `f_auto,q_${quality},w_${width},c_${crop}`;
      return url.replace('/image/upload/', `/image/upload/${transform}/`);
    } else if (url.includes('/upload/')) {
      if (url.includes('/upload/f_auto') || url.includes('/upload/w_')) {
        return url;
      }
      const transform = `f_auto,q_${quality},w_${width},c_${crop}`;
      return url.replace('/upload/', `/upload/${transform}/`);
    }
  }

  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=80`;
  }

  return url;
}

/**
 * Accurately formats a date string to a full legible date & time with seconds
 * e.g. "Sep 4, 2026, 06:45:12 PM"
 */
export function formatDetailedDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString || '—';
  }
}

/**
 * Formats a timestamp into a live ticking relative description:
 * e.g. "Just now", "8s ago", "2m 14s ago", "1h 5m ago", "3d ago"
 */
export function formatLiveRelativeTime(
  dateString?: string | null,
  currentTimestamp: number = Date.now()
): string {
  if (!dateString) return '—';
  try {
    const time = new Date(dateString).getTime();
    if (isNaN(time)) return dateString;

    const diffMs = currentTimestamp - time;
    if (diffMs < 0) return 'Just now';

    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 5) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;

    const diffMin = Math.floor(diffSec / 60);
    const remSec = diffSec % 60;
    if (diffMin < 5) return `${diffMin}m ${remSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;

    const diffHours = Math.floor(diffMin / 60);
    const remMin = diffMin % 60;
    if (diffHours < 24) {
      return remMin > 0 ? `${diffHours}h ${remMin}m ago` : `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;

    return formatDate(dateString);
  } catch {
    return dateString || '—';
  }
}

export type SessionActivityState = 'online' | 'idle' | 'away' | 'expired';

export interface SessionActivityInfo {
  state: SessionActivityState;
  label: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

/**
 * Calculates live activity status based on lastSeenAt and expiresAt
 */
export function getSessionActivityStatus(
  lastSeenAt?: string | null,
  expiresAt?: string | null,
  currentTimestamp: number = Date.now()
): SessionActivityInfo {
  if (!lastSeenAt || !expiresAt) {
    return {
      state: 'away',
      label: 'Offline',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-500/10',
      badgeBorder: 'border-slate-500/20',
      badgeText: 'text-slate-400',
    };
  }

  const expiryTime = new Date(expiresAt).getTime();
  if (!isNaN(expiryTime) && expiryTime <= currentTimestamp) {
    return {
      state: 'expired',
      label: 'Expired',
      dotColor: 'bg-red-500',
      badgeBg: 'bg-red-500/10',
      badgeBorder: 'border-red-500/20',
      badgeText: 'text-red-400',
    };
  }

  const seenTime = new Date(lastSeenAt).getTime();
  if (isNaN(seenTime)) {
    return {
      state: 'away',
      label: 'Offline',
      dotColor: 'bg-slate-400',
      badgeBg: 'bg-slate-500/10',
      badgeBorder: 'border-slate-500/20',
      badgeText: 'text-slate-400',
    };
  }

  const diffMs = Math.max(0, currentTimestamp - seenTime);
  const diffSec = Math.floor(diffMs / 1000);

  // Online if active within last 2 minutes (120 seconds)
  if (diffSec <= 120) {
    return {
      state: 'online',
      label: 'Online Now',
      dotColor: 'bg-emerald-400',
      badgeBg: 'bg-emerald-500/10',
      badgeBorder: 'border-emerald-500/25',
      badgeText: 'text-emerald-400',
    };
  }

  // Idle if active within last 15 minutes (900 seconds)
  if (diffSec <= 900) {
    return {
      state: 'idle',
      label: 'Idle',
      dotColor: 'bg-amber-400',
      badgeBg: 'bg-amber-500/10',
      badgeBorder: 'border-amber-500/25',
      badgeText: 'text-amber-300',
    };
  }

  // Away / Offline but session is still valid
  return {
    state: 'away',
    label: 'Inactive',
    dotColor: 'bg-slate-400',
    badgeBg: 'bg-white/5',
    badgeBorder: 'border-white/10',
    badgeText: 'text-slate-300',
  };
}

