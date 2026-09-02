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
