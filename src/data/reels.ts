import { ReelItem } from '@/types';

export const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel_1',
    title: 'Our Golden Sunset Walk 🌅',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnailUrl: '/images/hero/mili_hero_1.png',
    date: 'February 14, 2026',
    location: 'Sunset Boulevard',
    description: 'Every sunset is sweeter when I get to watch the golden light touch your face. You make the whole world feel peaceful. ❤️',
    isFavorite: true,
    aspectRatio: 'portrait',
    uploader: 'sukhen',
    likesCount: 142,
    createdAt: '2026-02-14T18:30:00.000Z',
  },
  {
    id: 'reel_2',
    title: 'That Unstoppable Laughter ✨',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: '/images/hero/mili_hero_2.png',
    date: 'January 1, 2026',
    location: 'Our Cozy Corner',
    description: 'Captured candidly — your smile is my favorite thing in this universe. No filter needed for pure magic! 💫',
    isFavorite: true,
    aspectRatio: 'portrait',
    uploader: 'mili',
    likesCount: 238,
    createdAt: '2026-01-01T20:15:00.000Z',
  },
  {
    id: 'reel_3',
    title: 'Starlight Dreamer 🌙',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: '/images/hero/mili_hero_3.jpg',
    date: 'December 25, 2025',
    location: 'Rooftop Under Starlight',
    description: 'Looking at the stars with you, realizing that the brightest star in my sky is sitting right next to me. 🌌',
    isFavorite: true,
    aspectRatio: 'portrait',
    uploader: 'both',
    likesCount: 189,
    createdAt: '2025-12-25T22:45:00.000Z',
  },
  {
    id: 'reel_4',
    title: 'Forever Hand in Hand 🌸',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnailUrl: '/images/hero/mili_hero_4.png',
    date: 'November 12, 2025',
    location: 'Garden of Memories',
    description: 'No matter where life takes us, walking beside you makes every road feel like coming home. 🌹',
    isFavorite: false,
    aspectRatio: 'portrait',
    uploader: 'sukhen',
    likesCount: 310,
    createdAt: '2025-11-12T16:20:00.000Z',
  },
];

// LocalStorage Keys
const REEL_LIKES_KEY = 'mili_reels_likes_v1';
const REEL_CUSTOM_KEY = 'mili_reels_custom_v1';

/**
 * Check if a reel has been liked by current user
 */
export function isReelLiked(reelId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(REEL_LIKES_KEY);
    if (!raw) return false;
    const likedIds: string[] = JSON.parse(raw);
    return Array.isArray(likedIds) && likedIds.includes(reelId);
  } catch {
    return false;
  }
}

/**
 * Toggle like status for a reel and return updated like state
 */
export function toggleReelLike(reelId: string, baseCount = 0): { liked: boolean; newCount: number } {
  if (typeof window === 'undefined') return { liked: false, newCount: baseCount };
  try {
    const raw = localStorage.getItem(REEL_LIKES_KEY);
    const likedIds: string[] = raw ? JSON.parse(raw) : [];
    const index = likedIds.indexOf(reelId);
    let liked = false;

    if (index >= 0) {
      likedIds.splice(index, 1);
      liked = false;
    } else {
      likedIds.push(reelId);
      liked = true;
    }

    localStorage.setItem(REEL_LIKES_KEY, JSON.stringify(likedIds));

    // Custom counts store
    const countKey = `mili_reel_count_${reelId}`;
    const storedCount = localStorage.getItem(countKey);
    let count = storedCount ? parseInt(storedCount, 10) : baseCount;
    count = liked ? count + 1 : Math.max(0, count - 1);
    localStorage.setItem(countKey, count.toString());

    return { liked, newCount: count };
  } catch {
    return { liked: false, newCount: baseCount };
  }
}

/**
 * Get current like count for a reel
 */
export function getReelLikeCount(reelId: string, baseCount = 0): number {
  if (typeof window === 'undefined') return baseCount;
  try {
    const countKey = `mili_reel_count_${reelId}`;
    const storedCount = localStorage.getItem(countKey);
    if (storedCount !== null) {
      const parsed = parseInt(storedCount, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return baseCount;
  } catch {
    return baseCount;
  }
}

/**
 * Save custom reel locally as fallback
 */
export function saveCustomReelLocally(reel: ReelItem): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(REEL_CUSTOM_KEY);
    const customList: ReelItem[] = raw ? JSON.parse(raw) : [];
    const filtered = customList.filter((r) => r.id !== reel.id);
    filtered.unshift(reel);
    localStorage.setItem(REEL_CUSTOM_KEY, JSON.stringify(filtered));
  } catch {}
}

/**
 * Get locally stored custom reels
 */
export function getCustomReelsLocally(): ReelItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REEL_CUSTOM_KEY);
    if (!raw) return [];
    const customList: ReelItem[] = JSON.parse(raw);
    return Array.isArray(customList) ? customList : [];
  } catch {
    return [];
  }
}
