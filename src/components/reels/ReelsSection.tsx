'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { ReelItem, MemoryItem } from '@/types';
import { INITIAL_REELS, getCustomReelsLocally, syncGlobalReelLikes } from '@/data/reels';
import { ReelCard } from './ReelCard';
import { cachedFetch } from '@/lib/api-cache';
import { isMediaVideo } from '@/lib/utils';
import { audioEngine } from '@/lib/audio';
import { safeSetLocalStorage } from '@/lib/storage';

interface ReelsSectionProps {
  isActive?: boolean;
  onBack?: () => void;
}

function isStrictVideoItem(item?: { type?: string; url?: string } | null): boolean {
  if (!item || !item.url) return false;
  return isMediaVideo(item);
}

export const ReelsSection: React.FC<ReelsSectionProps> = ({ isActive = true, onBack }) => {
  const [reels, setReels] = useState<ReelItem[]>(() => {
    const custom = getCustomReelsLocally().filter(isStrictVideoItem);
    return [...custom, ...INITIAL_REELS.filter(isStrictVideoItem)];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // Scroll container ref — native CSS scroll-snap
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isWheelingRef = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pause ambient audio when reels section is active
  useEffect(() => {
    if (isActive) {
      try {
        if (audioEngine.getIsPlaying()) audioEngine.pause();
      } catch {}
      // Sync global likes from server on mount
      syncGlobalReelLikes();
    } else {
      setIsMuted(true);
    }
  }, [isActive]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        try {
          if (audioEngine.getIsPlaying()) audioEngine.pause();
        } catch {}
      }
      return next;
    });
  }, []);

  // Smooth scroll to a specific reel index
  const scrollToReel = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const targetIndex = Math.max(0, Math.min(reels.length - 1, index));
      const targetEl = itemRefs.current[targetIndex];

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveIndex(targetIndex);
      }
    },
    [reels.length]
  );

  // IntersectionObserver — accurately detect active reel in view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const idx = itemRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.55,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reels]);

  // Facebook-style Desktop Wheel Scrolling: smooth single-reel glide with momentum debounce
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // If user is scrolling significantly
      if (Math.abs(e.deltaY) < 25) return;

      e.preventDefault();
      if (isWheelingRef.current) return;

      isWheelingRef.current = true;
      if (e.deltaY > 0) {
        // Scroll down to next reel
        if (activeIndex < reels.length - 1) {
          scrollToReel(activeIndex + 1);
        }
      } else {
        // Scroll up to prev reel
        if (activeIndex > 0) {
          scrollToReel(activeIndex - 1);
        }
      }

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
      wheelTimeoutRef.current = setTimeout(() => {
        isWheelingRef.current = false;
      }, 450);
    },
    [activeIndex, reels.length, scrollToReel]
  );

  // Keyboard navigation (ArrowDown, ArrowUp, PageDown, PageUp, M, Esc)
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        scrollToReel(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        scrollToReel(activeIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, activeIndex, handleToggleMute, onBack, scrollToReel]);

  // Fetch videos from /api/memories & sync
  const fetchVideos = useCallback(async (forceRefresh = false) => {
    try {
      try {
        const raw = localStorage.getItem('mili_reels_custom_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(isStrictVideoItem);
            if (cleaned.length !== parsed.length) {
              safeSetLocalStorage('mili_reels_custom_v1', cleaned);
            }
          }
        }
      } catch {}

      const data = await cachedFetch<{ memories?: MemoryItem[] }>('/api/memories', {
        forceRefresh,
      });
      if (data?.memories && Array.isArray(data.memories)) {
        const videoMemories = data.memories.filter(isStrictVideoItem);
        const mapped: ReelItem[] = videoMemories.map((m) => ({
          ...m,
          type: 'video',
          aspectRatio: m.aspectRatio || 'portrait',
          uploader: (m as any).uploader || 'sukhen',
          likesCount: (m as any).likesCount || 0,
        }));

        const custom = getCustomReelsLocally().filter(isStrictVideoItem);
        const seenIds = new Set<string>();
        const seenUrls = new Set<string>();
        const combined: ReelItem[] = [];

        [...custom, ...mapped, ...INITIAL_REELS.filter(isStrictVideoItem)].forEach((item) => {
          if (!seenIds.has(item.id) && !seenUrls.has(item.url)) {
            seenIds.add(item.id);
            seenUrls.add(item.url);
            combined.push(item);
          }
        });

        if (combined.length > 0) setReels(combined);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchVideos();
    const handler = () => fetchVideos(true);
    window.addEventListener('mili-memories-updated', handler);
    return () => window.removeEventListener('mili-memories-updated', handler);
  }, [fetchVideos]);

  return (
    <section
      id="reels"
      className="relative w-full h-[calc(100dvh-64px)] md:h-[100dvh] bg-black overflow-hidden flex items-center justify-center select-none"
    >
      {/* Desktop Home Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="hidden sm:flex items-center gap-2 absolute top-4 left-4 z-40 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-medium backdrop-blur-xl transition-all hover:scale-105 active:scale-95 shadow-xl"
          title="Back to Home (Esc)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
      )}

      {reels.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center py-14 px-6 rounded-3xl border border-white/10 max-w-sm bg-white/5 backdrop-blur-md">
            <Video className="w-10 h-10 text-rose-400 mx-auto mb-2.5 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">No Video Reels Yet</h3>
            <p className="text-xs text-slate-400">
              Upload video memories in the Memories section to see them here!
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Native CSS Scroll-Snap Container with smooth wheel snapping */}
          <div
            ref={scrollRef}
            onWheel={handleWheel}
            className="w-full h-full overflow-y-scroll"
            style={{
              scrollSnapType: 'y mandatory',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {reels.map((reel, i) => (
              <div
                key={reel.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                className="w-full h-full flex-shrink-0 flex items-center justify-center"
                style={{
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                }}
              >
                {/* Facebook Reels Container: Full height, constrained width on desktop */}
                <div className="w-full h-full sm:max-w-[420px] mx-auto relative sm:rounded-2xl sm:overflow-hidden sm:my-2 sm:h-[calc(100%-16px)] sm:border sm:border-white/10 sm:shadow-2xl">
                  <ReelCard
                    reel={reel}
                    isActive={isActive && activeIndex === i}
                    isNearby={Math.abs(activeIndex - i) <= 1}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                    onBack={onBack}
                    index={i}
                    total={reels.length}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Facebook Desktop Floating Up & Down Navigation Buttons */}
          <div className="hidden lg:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-40">
            {activeIndex > 0 && (
              <button
                onClick={() => scrollToReel(activeIndex - 1)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/20 backdrop-blur-xl text-white flex items-center justify-center transition-all shadow-xl hover:scale-110"
                aria-label="Previous Reel"
                title="Previous Reel (Up Arrow)"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            )}

            {activeIndex < reels.length - 1 && (
              <button
                onClick={() => scrollToReel(activeIndex + 1)}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/20 backdrop-blur-xl text-white flex items-center justify-center transition-all shadow-xl hover:scale-110"
                aria-label="Next Reel"
                title="Next Reel (Down Arrow)"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
