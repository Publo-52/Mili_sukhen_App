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
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60)) / (1000 * 60));
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
 * Automatically transforms Cloudinary and Unsplash URLs into fast, compressed thumbnails
 * Converts massive 10MB-20MB raw photos down to ~35KB-60KB WebP images for instant 60fps scrolling
 */
export function getOptimizedImageUrl(
  url?: string,
  options: { width?: number; height?: number; quality?: string | number; crop?: string } = {}
): string {
  if (!url) return '';
  const { width = 800, quality = 'auto', crop = 'limit' } = options;

  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If it's a video file URL, convert to JPG thumbnail first
    let processedUrl = url;
    if (url.match(/\.(mp4|mov|webm|avi|mkv|m4v)$/i)) {
      processedUrl = url.replace(/\.(mp4|mov|webm|avi|mkv|m4v)$/i, '.jpg');
    }

    if (processedUrl.includes('/upload/f_auto') || processedUrl.includes('/upload/w_')) {
      return processedUrl;
    }
    const transform = `f_auto,q_${quality},w_${width},c_${crop}`;
    return processedUrl.replace('/upload/', `/upload/${transform}/`);
  }

  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=80`;
  }

  return url;
}
