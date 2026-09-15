'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  ChevronUp,
  ChevronDown,
  Video,
} from 'lucide-react';
import { ReelItem, MemoryItem } from '@/types';
import { INITIAL_REELS, getCustomReelsLocally } from '@/data/reels';
import { ReelCard } from './ReelCard';
import { cachedFetch } from '@/lib/api-cache';
import { isMediaVideo } from '@/lib/utils';
import { audioEngine } from '@/lib/audio';

interface ReelsSectionProps {
  isActive?: boolean;
}

/**
 * Strict validator to guarantee ONLY real videos enter the Reels feed (never images)
 */
function isStrictVideoItem(item?: { type?: string; url?: string } | null): boolean {
  if (!item || !item.url) return false;
  // Reject all common image extensions
  if (item.url.match(/\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i)) return false;
  return item.type === 'video' || isMediaVideo(item);
}

export const ReelsSection: React.FC<ReelsSectionProps> = ({ isActive = true }) => {
  // Reels list state — initialized strictly with videos
  const [reels, setReels] = useState<ReelItem[]>(() => {
    const custom = getCustomReelsLocally().filter(isStrictVideoItem);
    return [...custom, ...INITIAL_REELS.filter(isStrictVideoItem)];
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Default muted to comply with browser autoplay policies

  // Auto-mute when user navigates away from Reels section
  useEffect(() => {
    if (!isActive) {
      setIsMuted(true);
    }
  }, [isActive]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next && typeof window !== 'undefined') {
        try {
          if (audioEngine.getIsPlaying()) {
            audioEngine.pause();
          }
        } catch {}
      }
      return next;
    });
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const isScrollingRef = useRef<boolean>(false);
  const touchStartYRef = useRef<number>(0);

  // Load and merge videos from /api/memories + custom local reels + initial reels
  // Whenever Sukhen or Mili uploads a video from Memories or Admin Studio, this automatically pulls it
  const fetchVideosFromMemories = useCallback(async (forceRefresh = false) => {
    try {
      const data = await cachedFetch<{ memories?: MemoryItem[] }>('/api/memories', {
        forceRefresh,
      });

      if (data?.memories && Array.isArray(data.memories)) {
        // Filter memories that are STRICTLY real videos (never photos or images)
        const videoMemories = data.memories.filter(isStrictVideoItem);

        const mappedUploaded: ReelItem[] = videoMemories.map((m) => ({
          ...m,
          type: 'video',
          aspectRatio: m.aspectRatio || 'portrait',
          uploader: (m as any).uploader || 'sukhen',
          likesCount: (m as any).likesCount || 150,
        }));

        const custom = getCustomReelsLocally().filter(isStrictVideoItem);

        // Deduplicate by ID and URL
        const seenIds = new Set<string>();
        const seenUrls = new Set<string>();
        const combined: ReelItem[] = [];

        [...custom, ...mappedUploaded, ...INITIAL_REELS.filter(isStrictVideoItem)].forEach((item) => {
          if (!seenIds.has(item.id) && !seenUrls.has(item.url)) {
            seenIds.add(item.id);
            seenUrls.add(item.url);
            combined.push(item);
          }
        });

        if (combined.length > 0) {
          setReels(combined);
        }
      }
    } catch {
      // Keep existing state on error
    }
  }, []);

  useEffect(() => {
    fetchVideosFromMemories();

    const handleMemoriesUpdated = () => {
      fetchVideosFromMemories(true);
    };

    window.addEventListener('mili-memories-updated', handleMemoriesUpdated);
    return () => {
      window.removeEventListener('mili-memories-updated', handleMemoriesUpdated);
    };
  }, [fetchVideosFromMemories]);

  // Navigate to specific reel index safely
  const navigateToReel = useCallback(
    (newIndex: number) => {
      if (reels.length === 0) return;
      const safeIndex = Math.max(0, Math.min(newIndex, reels.length - 1));
      setActiveIndex(safeIndex);
    },
    [reels.length]
  );

  // Next and Previous navigation handlers
  const handleNextReel = useCallback(() => {
    navigateToReel(activeIndex + 1);
  }, [activeIndex, navigateToReel]);

  const handlePrevReel = useCallback(() => {
    navigateToReel(activeIndex - 1);
  }, [activeIndex, navigateToReel]);

  // Keyboard navigation listener (Arrow keys, Space, M)
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevReel();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleNextReel, handlePrevReel, handleToggleMute]);

  // Mouse wheel snap throttling
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isScrollingRef.current) return;

      if (Math.abs(e.deltaY) > 40) {
        isScrollingRef.current = true;
        if (e.deltaY > 0) {
          handleNextReel();
        } else {
          handlePrevReel();
        }
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      }
    },
    [handleNextReel, handlePrevReel]
  );

  // Mobile Touch Swipe Listener
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diffY = touchStartYRef.current - touchEndY;

    if (Math.abs(diffY) > 50) {
      if (diffY > 0) {
        handleNextReel();
      } else {
        handlePrevReel();
      }
    }
  };

  const currentReel = reels[activeIndex];

  return (
    <section
      id="reels"
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[70vh] py-3 sm:py-6 px-3 max-w-4xl mx-auto flex flex-col items-center justify-center select-none"
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none opacity-25 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(147,51,234,0.18) 50%, transparent 70%)',
        }}
      />

      {/* Top Header Bar — Centered, matching half-screen Facebook Reels layout */}
      <div className="w-full max-w-[340px] flex items-center justify-center mb-2.5 sm:mb-3 px-1 text-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-roseGlow-600 to-purple-600 text-white shadow-glow">
            <Film className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Suksharmi Reels</span>
              <span className="text-roseGlow-400">✨</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
              Videos of Us • Swipe or arrows
            </p>
          </div>
        </div>
      </div>

      {/* Main Reels Viewer Viewport */}
      <div className="relative w-full flex items-center justify-center">
        {/* Desktop Previous / Next Buttons (Right beside the half-screen card) */}
        <div className="hidden md:flex flex-col items-center gap-2.5 absolute right-[calc(50%+185px)] top-1/2 -translate-y-1/2 z-20">
          <button
            onClick={handlePrevReel}
            disabled={activeIndex === 0}
            className={`p-2.5 rounded-full backdrop-blur-xl border transition-all ${
              activeIndex === 0
                ? 'bg-black/20 border-white/5 text-slate-600 cursor-not-allowed'
                : 'bg-black/60 border-white/20 text-white hover:bg-roseGlow-600/30 hover:border-rose-500/50 hover:scale-110 shadow-lg active:scale-90'
            }`}
            title="Previous Reel (Arrow Up)"
            aria-label="Previous Reel"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 select-none">
            {activeIndex + 1}/{reels.length}
          </span>
          <button
            onClick={handleNextReel}
            disabled={activeIndex === reels.length - 1}
            className={`p-2.5 rounded-full backdrop-blur-xl border transition-all ${
              activeIndex === reels.length - 1
                ? 'bg-black/20 border-white/5 text-slate-600 cursor-not-allowed'
                : 'bg-black/60 border-white/20 text-white hover:bg-roseGlow-600/30 hover:border-rose-500/50 hover:scale-110 shadow-lg active:scale-90'
            }`}
            title="Next Reel (Arrow Down)"
            aria-label="Next Reel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Reel Card (Facebook-Style Half Screen) */}
        {currentReel ? (
          <div className="w-full flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentReel.id}
                initial={{ opacity: 0.8, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0.8, y: -15, scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full flex justify-center"
              >
                <ReelCard
                  reel={currentReel}
                  isActive={isActive}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  index={activeIndex}
                  total={reels.length}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-14 px-6 rounded-3xl glass-card border border-white/10 max-w-sm">
            <Video className="w-10 h-10 text-roseGlow-400 mx-auto mb-2.5 animate-pulse" />
            <h3 className="text-base font-bold text-white mb-1">No Video Reels Yet</h3>
            <p className="text-xs text-slate-400">
              Upload video memories in the Memories section or Admin Studio to see them here!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
