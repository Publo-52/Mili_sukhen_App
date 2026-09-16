'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Volume2,
  VolumeX,
  Share2,
  Play,
  Pause,
  MapPin,
  Calendar,
  Music2,
  Sparkles,
  Check,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { ReelItem } from '@/types';
import { toggleReelLike, isReelLiked, getReelLikeCount } from '@/data/reels';

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
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
  isMuted,
  onToggleMute,
  onBack,
  onShare,
  index,
  total,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(() => isReelLiked(reel.id));
  const [likesCount, setLikesCount] = useState(() =>
    getReelLikeCount(reel.id, reel.likesCount || 0)
  );
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showPlayStateIcon, setShowPlayStateIcon] = useState<'play' | 'pause' | 'sound' | 'mute' | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const lastTapRef = useRef<number>(0);
  const playStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync like state if reel ID changes
  useEffect(() => {
    setIsLiked(isReelLiked(reel.id));
    setLikesCount(getReelLikeCount(reel.id, reel.likesCount || 0));
  }, [reel.id, reel.likesCount]);

  // Autoplay instantly when active, pause when inactive
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
            // Autoplay with audio might be blocked by browser policy; retry muted
            video.muted = true;
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch(() => {
                setIsPlaying(false);
              });
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, reel.id, isMuted]);

  // Sync mute state changes to active video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Debounced buffering handlers to prevent flickers on instant swipe
  const handleWaiting = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(true);
    }, 200);
  };

  const handleCanPlay = () => {
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setIsLoading(false);
  };

  // Handle Video Time Update for progress bar
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(currentProgress);
  };

  // Toggle Play / Pause on Single Tap
  const flashPlayIcon = (state: 'play' | 'pause' | 'sound' | 'mute') => {
    setShowPlayStateIcon(state);
    if (playStateTimeoutRef.current) clearTimeout(playStateTimeoutRef.current);
    playStateTimeoutRef.current = setTimeout(() => {
      setShowPlayStateIcon(null);
    }, 600);
  };

  // Handle Double-Tap (Instagram-style Like) & Single-Tap (Toggle Sound)
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap triggered!
      triggerLike();
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      // Single tap toggles sound with pop animation (Instagram Reels style)
      setTimeout(() => {
        if (lastTapRef.current === now) {
          const video = videoRef.current;
          if (video && video.paused) {
            video.play().catch(() => {});
            setIsPlaying(true);
          }
          onToggleMute();
          flashPlayIcon(!isMuted ? 'mute' : 'sound');
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Trigger Like
  const triggerLike = () => {
    const result = toggleReelLike(reel.id, reel.likesCount || 0);
    setIsLiked(result.liked);
    setLikesCount(result.newCount);
  };

  // Handle Share
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
          text: reel.description || 'Watch our sweet love reel!',
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
    <div className="relative w-full h-[calc(100dvh-64px)] sm:h-[88vh] sm:max-h-[840px] max-w-[440px] sm:aspect-[9/16] mx-auto rounded-none sm:rounded-3xl overflow-hidden bg-black shadow-[0_12px_45px_rgba(0,0,0,0.85)] border-0 sm:border sm:border-white/15 select-none group flex flex-col justify-center">
      {/* Background Ambient Blur using poster/thumbnail or CSS backdrop (Zero duplicate video decoders) */}
      {reel.thumbnailUrl ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-cover bg-center blur-2xl opacity-35 scale-110 pointer-events-none"
          style={{ backgroundImage: `url(${reel.thumbnailUrl})` }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-gradient-to-b from-purple-950/40 via-black to-roseGlow-950/40 blur-xl pointer-events-none"
        />
      )}

      {/* 1. Main HTML5 Video Player */}
      <video
        ref={videoRef}
        src={reel.url}
        poster={reel.thumbnailUrl}
        preload="auto"
        playsInline
        autoPlay={isActive}
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
        onPlaying={handleCanPlay}
        onLoadedData={handleCanPlay}
        onCanPlay={handleCanPlay}
        onError={() => setIsLoading(false)}
        onClick={handleTap}
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
        className="w-full h-full relative z-10 cursor-pointer transition-all duration-200 object-contain"
      />

      {/* 2. Top Header with Back Button and Facebook-Style Sound Toggle */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-3.5 flex items-center justify-between z-20 pointer-events-none">
        {onBack ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="pointer-events-auto w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-transform active:scale-90 shadow-md flex items-center justify-center group"
            title="Back to Home"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <div />
        )}

        {/* Facebook-Style Small Sound Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="pointer-events-auto w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-transform active:scale-90 shadow-md flex items-center justify-center"
          title={isMuted ? 'Unmute' : 'Mute'}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-slate-300" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
          )}
        </button>
      </div>

      {/* 3. Center Buffering / Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500/20 border-t-roseGlow-500 animate-spin" />
        </div>
      )}

      {/* 4. Center Play / Pause / Sound Pop Animation on Tap */}
      <AnimatePresence>
        {showPlayStateIcon && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white pointer-events-none z-30 shadow-2xl border border-white/20"
          >
            {showPlayStateIcon === 'sound' && (
              <Volume2 className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            )}
            {showPlayStateIcon === 'mute' && (
              <VolumeX className="w-7 h-7 text-rose-300" />
            )}
            {showPlayStateIcon === 'play' && (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            )}
            {showPlayStateIcon === 'pause' && (
              <Pause className="w-7 h-7 fill-white" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Center Instagram-Style Heart Burst on Double Tap */}
      <AnimatePresence>
        {showHeartBurst && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
            animate={{ scale: [0.2, 1.4, 1.1], opacity: [0, 1, 0.9], rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: -40 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 m-auto w-24 h-24 flex items-center justify-center pointer-events-none z-40 drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]"
          >
            <Heart className="w-20 h-20 text-rose-500 fill-rose-500 stroke-[1.5]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Right Side Action Bar (Facebook / Instagram Style - Seamless Zero Box Shadows) */}
      <div className="absolute right-2.5 bottom-12 sm:bottom-14 flex flex-col items-center gap-2.5 sm:gap-3 z-30">
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerLike();
          }}
          className="group flex flex-col items-center focus:outline-none"
          title="Like Reel"
          aria-label="Like Reel"
        >
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all active:scale-80 ${
              isLiked
                ? 'bg-roseGlow-500/25 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-black/25 hover:bg-black/40 border border-white/10'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] ${
                isLiked
                  ? 'text-rose-500 fill-rose-500 animate-pulse scale-110'
                  : 'text-white'
              }`}
            />
          </div>
          <span className="text-[10px] font-mono text-white font-medium mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {likesCount}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="group flex flex-col items-center focus:outline-none relative"
          title="Share Reel"
          aria-label="Share Reel"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/25 hover:bg-black/40 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-80">
            <Share2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
          </div>
          <span className="text-[9px] font-mono text-white/90 mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Share</span>

          {/* Copied link toast */}
          <AnimatePresence>
            {showCopiedToast && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -45, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-0 px-2.5 py-1 rounded-lg bg-roseGlow-600 text-white text-[11px] font-sans font-medium whitespace-nowrap shadow-xl flex items-center gap-1 z-50 pointer-events-none"
              >
                <Check className="w-3 h-3" />
                <span>Copied! 💕</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Info Toggle Button */}
        {reel.description && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDescExpanded((prev) => !prev);
            }}
            className="group flex flex-col items-center focus:outline-none"
            title="Toggle Details"
            aria-label="Toggle Details"
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all active:scale-80 ${
              isDescExpanded ? 'bg-purple-600/40 border-purple-400/50 text-white' : 'bg-black/25 border-white/10 text-slate-200 hover:bg-black/40'
            }`}>
              <Info className="w-3.5 h-3.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
            </div>
            <span className="text-[9px] font-mono text-white/90 mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Info</span>
          </button>
        )}
      </div>

      {/* 7. Bottom Overlay (Creator info, Caption, Music Ticker) - Seamless full width with pr-14 */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-3.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-20 pointer-events-none">
        <div className="pr-14 sm:pr-16">
          {/* Creator Identity */}
          <div className="flex items-center gap-1.5 mb-1 pointer-events-auto">
            <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-tr from-roseGlow-600 via-pink-500 to-purple-600 p-0.5 shadow-glow">
              <div className="w-full h-full rounded-full bg-obsidian-950 flex items-center justify-center text-white text-[9px] font-bold">
                {uploaderLabel.charAt(0)}
              </div>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide drop-shadow-md">
              @{uploaderLabel}
            </span>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-roseGlow-500 text-white text-[8px] shadow-sm">
              ✓
            </span>
            {reel.isFavorite && (
              <span className="px-1.5 py-0.5 rounded-full bg-roseGlow-500/30 border border-rose-400/40 text-[8px] font-mono text-rose-300">
                Fav ❤️
              </span>
            )}
          </div>

          {/* Title & Caption */}
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md pointer-events-auto">
            {reel.title}
          </h3>

          {/* Expandable Description */}
          {reel.description && (
            <div className="mt-0.5 pointer-events-auto">
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded((prev) => !prev);
                }}
                className={`text-[11px] text-slate-200/90 leading-snug cursor-pointer ${
                  isDescExpanded ? 'line-clamp-none max-h-28 overflow-y-auto' : 'line-clamp-2'
                }`}
              >
                {reel.description}
              </p>
            </div>
          )}

          {/* Location & Date */}
          <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] font-mono text-slate-300">
            {reel.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-roseGlow-400" />
                <span>{reel.location}</span>
              </span>
            )}
            {reel.date && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Calendar className="w-2.5 h-2.5" />
                <span>{reel.date}</span>
              </span>
            )}
          </div>

          {/* Audio Ticker Marquee */}
          <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-mono text-roseGlow-200 max-w-full truncate">
            <Music2 className="w-2.5 h-2.5 text-roseGlow-400 animate-pulse flex-shrink-0" />
            <span className="truncate">Suksharmi Soundtrack • Original Audio</span>
          </div>
        </div>
      </div>

      {/* 8. Bottom Scrubber / Playback Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div
          className="h-full bg-gradient-to-r from-roseGlow-500 via-pink-400 to-purple-500 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
