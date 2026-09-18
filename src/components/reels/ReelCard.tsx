'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Volume2,
  VolumeX,
  Share2,
  MapPin,
  Calendar,
  Music2,
  Check,
  ArrowLeft,
  Play,
} from 'lucide-react';
import { ReelItem } from '@/types';
import { toggleReelLike, isReelLiked, getReelLikeCount } from '@/data/reels';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  isNearby?: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onBack?: () => void;
  onShare?: (reel: ReelItem) => void;
  index: number;
  total: number;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  isNearby = true,
  isMuted,
  onToggleMute,
  onBack,
  onShare,
  index,
  total,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressTrackRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(() => isReelLiked(reel.id));
  const [likesCount, setLikesCount] = useState(() =>
    getReelLikeCount(reel.id, reel.likesCount || 0)
  );
  const [likeAnimKey, setLikeAnimKey] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState<'play' | 'pause' | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  const lastTapRef = useRef<number>(0);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const playPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync like state if reel ID changes or server updates
  useEffect(() => {
    setIsLiked(isReelLiked(reel.id));
    setLikesCount(getReelLikeCount(reel.id, reel.likesCount || 0));

    const handleLikesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ reelId?: string; count?: number; liked?: boolean }>;
      if (!customEvent.detail || customEvent.detail.reelId === reel.id) {
        setIsLiked(isReelLiked(reel.id));
        setLikesCount(getReelLikeCount(reel.id, reel.likesCount || 0));
      }
    };

    window.addEventListener('mili-reels-likes-updated', handleLikesUpdated);
    return () => window.removeEventListener('mili-reels-likes-updated', handleLikesUpdated);
  }, [reel.id, reel.likesCount]);

  // Autoplay when active, pause when inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(() => {
            // Autoplay with sound blocked: fallback to muted autoplay
            video.muted = true;
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(() => setIsPlaying(false));
          });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive, reel.id, isMuted]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleWaiting = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => setIsLoading(true), 200);
  };

  const handleCanPlay = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setIsLoading(false);
  };

  const handleTimeUpdate = () => {
    if (isDraggingProgress) return;
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  // Trigger Like with instant animation & state change
  const triggerLike = useCallback(() => {
    const result = toggleReelLike(reel.id, reel.likesCount || 0);
    setIsLiked(result.liked);
    setLikesCount(result.newCount);
    setLikeAnimKey((k) => k + 1);
  }, [reel.id, reel.likesCount]);

  // Double-tap for Instagram Heart Burst & Like; Single-tap for Play/Pause
  const handleVideoTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected: Instagram Heart Burst & Like
      if (!isLiked) {
        triggerLike();
      }
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
      lastTapRef.current = 0;
      if (playPauseTimeoutRef.current) clearTimeout(playPauseTimeoutRef.current);
    } else {
      lastTapRef.current = now;
      playPauseTimeoutRef.current = setTimeout(() => {
        if (lastTapRef.current === now) {
          // Single tap: toggle Play / Pause
          const video = videoRef.current;
          if (video) {
            if (video.paused) {
              video.play().then(() => setIsPlaying(true)).catch(() => {});
              setShowPlayPauseIcon('play');
            } else {
              video.pause();
              setIsPlaying(false);
              setShowPlayPauseIcon('pause');
            }
            setTimeout(() => setShowPlayPauseIcon(null), 600);
          }
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Facebook-style Seek Bar Click & Drag handler
  const seekToPosition = (clientX: number) => {
    const track = progressTrackRef.current;
    const video = videoRef.current;
    if (!track || !video || !video.duration) return;

    const rect = track.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * video.duration;
    setProgress(pos * 100);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    seekToPosition(e.clientX);
  };

  const handleScrubStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDraggingProgress(true);

    const getX = (ev: MouseEvent | TouchEvent) => {
      if ('touches' in ev && ev.touches.length > 0) {
        return ev.touches[0].clientX;
      }
      return (ev as MouseEvent).clientX;
    };

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      seekToPosition(getX(ev));
    };

    const handleEnd = () => {
      setIsDraggingProgress(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  // Share handler
  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(reel);
      return;
    }

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}#reels` : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Suksharmi Reels: ${reel.title}`,
          text: reel.description || 'Watch our love reel!',
          url: shareUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch {}
  };

  const uploaderLabel =
    reel.uploader === 'mili'
      ? 'Mili'
      : reel.uploader === 'sukhen'
      ? 'Sukhen'
      : 'Sukhen & Mili';

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      {/* Ambient background blur for vertical fill */}
      {reel.thumbnailUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-25 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${optimizeCloudinaryUrl(reel.thumbnailUrl)})` }}
        />
      )}

      {/* Main Video element: 100% full view object-contain without cropping */}
      {(isActive || isNearby) ? (
        <video
          ref={videoRef}
          src={reel.url}
          poster={optimizeCloudinaryUrl(reel.thumbnailUrl)}
          preload={isActive ? 'auto' : 'metadata'}
          playsInline
          loop
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={handleWaiting}
          onPlaying={handleCanPlay}
          onLoadedData={handleCanPlay}
          onCanPlay={handleCanPlay}
          onError={() => setIsLoading(false)}
          onClick={handleVideoTap}
          style={{ willChange: 'transform', transform: 'translateZ(0)' }}
          className="absolute inset-0 w-full h-full object-contain z-10 cursor-pointer"
        />
      ) : reel.thumbnailUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={optimizeCloudinaryUrl(reel.thumbnailUrl)}
          alt={reel.title || 'Reel Preview'}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain z-10"
        />
      ) : null}

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {/* Play / Pause tap indicator icon */}
      <AnimatePresence>
        {showPlayPauseIcon && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white pointer-events-none z-30"
          >
            {showPlayPauseIcon === 'play' ? (
              <Play className="w-8 h-8 fill-white ml-1" />
            ) : (
              <div className="w-6 h-6 flex justify-between items-center px-1">
                <span className="w-2 h-6 bg-white rounded-sm" />
                <span className="w-2 h-6 bg-white rounded-sm" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram Double-Tap Center Heart Burst */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            key="heart-burst"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.35, 1.05], opacity: [0, 1, 0.95] }}
            exit={{ scale: 1.4, opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute inset-0 m-auto w-28 h-28 flex items-center justify-center pointer-events-none z-30"
            style={{ filter: 'drop-shadow(0 0 24px rgba(255,255,255,0.85))' }}
          >
            <Heart className="w-24 h-24 fill-white text-white stroke-[1]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP HEADER BAR: Back + Counter + Mute ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 pt-3 pointer-events-none">
        {onBack ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/15 active:scale-90 transition-transform"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="pointer-events-auto w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/15 active:scale-90 transition-transform"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* ── RIGHT-SIDE ACTION BAR: Clean floating icons (Zero background box, zero heavy shadow) ── */}
      <div className="absolute right-2.5 bottom-10 sm:bottom-12 flex flex-col items-center gap-4 z-30 pointer-events-auto select-none">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerLike();
          }}
          className="group flex flex-col items-center focus:outline-none cursor-pointer bg-transparent border-0 p-0 shadow-none"
          aria-label={isLiked ? 'Unlike' : 'Like'}
        >
          <motion.div
            key={likeAnimKey}
            animate={
              likeAnimKey > 0
                ? isLiked
                  ? { scale: [1, 1.45, 0.85, 1.15, 1], rotate: [0, -12, 10, -4, 0] }
                  : { scale: [1, 0.75, 1] }
                : {}
            }
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-0 bg-transparent shadow-none"
          >
            <Heart
              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-150 ${
                isLiked
                  ? 'fill-[#ff2752] text-[#ff2752]'
                  : 'fill-transparent text-white stroke-[2]'
              }`}
            />
          </motion.div>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={likesCount}
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 3 }}
              transition={{ duration: 0.15 }}
              className="text-[12px] sm:text-[13px] font-bold text-white leading-tight text-center min-w-[16px] mt-0.5"
            >
              {likesCount > 0 ? likesCount : ''}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="group flex flex-col items-center focus:outline-none cursor-pointer relative bg-transparent border-0 p-0 shadow-none"
          aria-label="Share"
        >
          <div className="p-0 active:scale-80 transition-transform bg-transparent shadow-none">
            <Share2
              className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[2]"
            />
          </div>
          <span className="text-[11px] sm:text-[12px] font-semibold text-white leading-tight mt-0.5">
            Share
          </span>

          {/* Copied toast indicator */}
          <AnimatePresence>
            {showCopiedToast && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.8 }}
                animate={{ opacity: 1, y: -45, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-0 bottom-0 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-medium whitespace-nowrap flex items-center gap-1 pointer-events-none shadow-2xl z-50"
              >
                <Check className="w-3 h-3" />
                Copied!
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── BOTTOM-LEFT OVERLAY: Creator info, caption, audio ── */}
      <div className="absolute bottom-2 left-0 right-14 z-20 bg-gradient-to-t from-black/50 via-transparent to-transparent px-3 pt-8 pb-2 pointer-events-none">
        {/* Creator row */}
        <div className="flex items-center gap-2 mb-1 pointer-events-auto">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 p-0.5 flex-shrink-0 shadow-sm">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-white text-[10px] font-bold">
              {uploaderLabel.charAt(0)}
            </div>
          </div>
          <span className="text-[13px] sm:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            @{uploaderLabel}
          </span>
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-bold shadow-sm">
            ✓
          </span>
          {reel.isFavorite && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 border border-rose-400/40 text-[9px] font-mono text-rose-300">
              Fav ❤️
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div className="pointer-events-auto max-w-sm">
          <p className="text-[13px] font-semibold text-white leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-2">
            {reel.title}
          </p>

          {reel.description && (
            <p
              onClick={(e) => {
                e.stopPropagation();
                setIsDescExpanded((prev) => !prev);
              }}
              className={`text-[11px] text-slate-200/90 leading-snug mt-0.5 cursor-pointer drop-shadow-sm ${
                isDescExpanded ? 'line-clamp-none max-h-24 overflow-y-auto' : 'line-clamp-1'
              }`}
            >
              {reel.description}
            </p>
          )}
        </div>

        {/* Location & Date */}
        <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {reel.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 text-rose-400" />
              {reel.location}
            </span>
          )}
          {reel.date && (
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-2.5 h-2.5" />
              {reel.date}
            </span>
          )}
        </div>

        {/* Audio ticker */}
        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-mono text-rose-300">
          <Music2 className="w-2.5 h-2.5 text-rose-400 animate-pulse" />
          <span>Suksharmi Soundtrack • Original Audio</span>
        </div>
      </div>

      {/* ── FACEBOOK-STYLE SLEEK PROGRESS / SEEK BAR (Clean white, no neon glow) ── */}
      <div
        ref={progressTrackRef}
        onClick={handleTrackClick}
        onMouseDown={handleScrubStart}
        onTouchStart={handleScrubStart}
        className="absolute bottom-0 left-0 right-0 h-2 py-1 -my-1 z-40 cursor-pointer group flex items-end select-none"
        title="Seek Video"
      >
        <div className="w-full h-[2px] group-hover:h-[4px] bg-white/25 transition-all duration-150 relative">
          <div
            className="h-full bg-white transition-[width] duration-75 ease-linear relative"
            style={{ width: `${progress}%` }}
          >
            {/* Scrubber thumb handle shown on hover/scrub */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};
