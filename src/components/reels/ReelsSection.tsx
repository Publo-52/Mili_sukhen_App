'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  ChevronUp,
  ChevronDown,
  Video,
  ArrowLeft,
} from 'lucide-react';
import { ReelItem, MemoryItem } from '@/types';
import { INITIAL_REELS, getCustomReelsLocally } from '@/data/reels';
import { ReelCard } from './ReelCard';
import { cachedFetch } from '@/lib/api-cache';
import { isMediaVideo } from '@/lib/utils';
import { audioEngine } from '@/lib/audio';

interface ReelsSectionProps {
  isActive?: boolean;
  onBack?: () => void;
}

/**
 * Strict validator to guarantee ONLY real videos enter the Reels feed (strictly excludes images)
 */
function isStrictVideoItem(item?: { type?: string; url?: string } | null): boolean {
  if (!item || !item.url) return false;
  return isMediaVideo(item);
}

const slideVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? '100%' : '-100%',
    opacity: 1,
    scale: 1,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      y: { type: 'spring', stiffness: 420, damping: 36, mass: 0.75 },
      opacity: { duration: 0.15 },
    },
  },
  exit: (direction: number) => ({
    y: direction > 0 ? '-100%' : '100%',
    opacity: 1,
    scale: 1,
    transition: {
      y: { type: 'spring', stiffness: 420, damping: 36, mass: 0.75 },
      opacity: { duration: 0.15 },
    },
  }),
};

export const ReelsSection: React.FC<ReelsSectionProps> = ({ isActive = true, onBack }) => {
  // Reels list state — initialized strictly with verified real videos only
  const [reels, setReels] = useState<ReelItem[]>(() => {
    const custom = getCustomReelsLocally().filter(isStrictVideoItem);
    return [...custom, ...INITIAL_REELS.filter(isStrictVideoItem)];
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isMuted, setIsMuted] = useState(true); // Default muted to comply with browser autoplay policies

  // Auto-pause background ambient audio when reels is active to prevent sound clash
  useEffect(() => {
    if (isActive) {
      if (audioEngine.getIsPlaying()) {
        try {
          audioEngine.pause();
        } catch {}
      }
    } else {
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

  // Load and merge videos from /api/memories + custom local reels + initial reels
  // Strictly filter out any images or non-video media
  const fetchVideosFromMemories = useCallback(async (forceRefresh = false) => {
    try {
      // Cleanup local custom storage if any photos leaked in
      try {
        const rawCustom = localStorage.getItem('mili_reels_custom_v1');
        if (rawCustom) {
          const parsed = JSON.parse(rawCustom);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(isStrictVideoItem);
            if (cleaned.length !== parsed.length) {
              localStorage.setItem('mili_reels_custom_v1', JSON.stringify(cleaned));
            }
          }
        }
      } catch {}

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
          likesCount: (m as any).likesCount || 0,
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

  // Navigate to specific reel index safely with direction tracking
  const navigateToReel = useCallback(
    (newIndex: number) => {
      if (reels.length === 0) return;
      const safeIndex = Math.max(0, Math.min(newIndex, reels.length - 1));
      if (safeIndex === activeIndex) return;
      setSlideDirection(newIndex > activeIndex ? 1 : -1);
      setActiveIndex(safeIndex);
    },
    [activeIndex, reels.length]
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
      } else if (e.key === 'Escape' && onBack) {
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleNextReel, handlePrevReel, handleToggleMute, onBack]);

  // Instant Mouse Wheel / Trackpad snap throttling (Facebook Reels desktop feel)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (isScrollingRef.current) return;

      if (Math.abs(e.deltaY) > 25) {
        isScrollingRef.current = true;
        if (e.deltaY > 0) {
          handleNextReel();
        } else {
          handlePrevReel();
        }
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 280);
      }
    },
    [handleNextReel, handlePrevReel]
  );

  const currentReel = reels[activeIndex];

  return (
    <section
      id="reels"
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-[calc(100dvh-64px)] sm:h-[92vh] max-w-5xl mx-auto flex flex-col items-center justify-center select-none p-0 sm:px-4 overflow-hidden"
    >
      {/* Background Ambient Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none opacity-25 blur-3xl -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(244,63,94,0.3) 0%, rgba(147,51,234,0.18) 50%, transparent 70%)',
        }}
      />

      {/* 0ms Instant Buffering Preloaders for Adjacent Reels (Active only when section is in view) */}
      {isActive && reels[activeIndex + 1] && (
        <video
          key={`preload-next-${reels[activeIndex + 1].id}`}
          src={reels[activeIndex + 1].url}
          preload="auto"
          muted
          playsInline
          className="hidden"
          aria-hidden="true"
        />
      )}
      {isActive && reels[activeIndex - 1] && (
        <video
          key={`preload-prev-${reels[activeIndex - 1].id}`}
          src={reels[activeIndex - 1].url}
          preload="auto"
          muted
          playsInline
          className="hidden"
          aria-hidden="true"
        />
      )}

      {/* Desktop Floating Back to Home Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="hidden sm:flex items-center gap-2 absolute top-4 left-4 z-30 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white text-xs font-medium backdrop-blur-xl transition-all hover:scale-105 active:scale-95 shadow-xl"
          title="Back to Home (Esc)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
      )}

      {/* Main Reels Viewer Viewport */}
      <div className="relative w-full h-full sm:h-auto flex items-center justify-center">
        {/* Desktop Previous / Next Buttons (Right beside the card) */}
        <div className="hidden md:flex flex-col items-center gap-2.5 absolute right-[calc(50%+230px)] top-1/2 -translate-y-1/2 z-20">
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

        {/* Current Active Reel Card with Real-Time Instant Drag & Facebook-Style Swipe Physics */}
        {currentReel ? (
          <div className="w-full h-full flex justify-center items-center overflow-hidden relative">
            <AnimatePresence mode="popLayout" custom={slideDirection} initial={false}>
              <motion.div
                key={currentReel.id}
                custom={slideDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="y"
                dragDirectionLock
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.25}
                dragSnapToOrigin
                onDragEnd={(e, info) => {
                  const { offset, velocity } = info;
                  const swipeDistance = 25; // Instant low threshold for effortless flick
                  const swipeVelocity = 160; // Gentle flick speed threshold

                  if (offset.y < -swipeDistance || velocity.y < -swipeVelocity) {
                    // Swiped UP -> Next reel
                    if (activeIndex < reels.length - 1) {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        try {
                          navigator.vibrate(10);
                        } catch {}
                      }
                      handleNextReel();
                    }
                  } else if (offset.y > swipeDistance || velocity.y > swipeVelocity) {
                    // Swiped DOWN -> Previous reel
                    if (activeIndex > 0) {
                      if (typeof navigator !== 'undefined' && navigator.vibrate) {
                        try {
                          navigator.vibrate(10);
                        } catch {}
                      }
                      handlePrevReel();
                    }
                  }
                }}
                style={{
                  touchAction: 'none',
                  willChange: 'transform',
                }}
                className="w-full h-full flex justify-center items-center will-change-transform cursor-grab active:cursor-grabbing select-none"
              >
                <ReelCard
                  reel={currentReel}
                  isActive={isActive}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  onBack={onBack}
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
