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
  Maximize2,
  Minimize2,
  Scan,
} from 'lucide-react';
import { ReelItem } from '@/types';
import { toggleReelLike, isReelLiked, getReelLikeCount } from '@/data/reels';

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onShare?: (reel: ReelItem) => void;
  index: number;
  total: number;
}

export const ReelCard: React.FC<ReelCardProps> = ({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onShare,
  index,
  total,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(() => isReelLiked(reel.id));
  const [likesCount, setLikesCount] = useState(() =>
    getReelLikeCount(reel.id, reel.likesCount || 100 + index * 37)
  );
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showPlayStateIcon, setShowPlayStateIcon] = useState<'play' | 'pause' | null>(null);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isFitMode, setIsFitMode] = useState(true);

  const lastTapRef = useRef<number>(0);
  const playStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fullscreen support for viewing video in absolute full display
  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(() => {});
      } else if ((video as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (video as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }
    }
  };

  // Sync like state if reel ID changes
  useEffect(() => {
    setIsLiked(isReelLiked(reel.id));
    setLikesCount(getReelLikeCount(reel.id, reel.likesCount || 100 + index * 37));
  }, [reel.id, reel.likesCount, index]);

  // Autoplay when active, pause when inactive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      video.currentTime = 0;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Sync mute state changes to active video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Handle Video Time Update for progress bar
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(currentProgress);
  };

  // Toggle Play / Pause on Single Tap
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true));
      flashPlayIcon('play');
    } else {
      video.pause();
      setIsPlaying(false);
      flashPlayIcon('pause');
    }
  };

  const flashPlayIcon = (state: 'play' | 'pause') => {
    setShowPlayStateIcon(state);
    if (playStateTimeoutRef.current) clearTimeout(playStateTimeoutRef.current);
    playStateTimeoutRef.current = setTimeout(() => {
      setShowPlayStateIcon(null);
    }, 600);
  };

  // Handle Double-Tap (Instagram-style Like)
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
      // Single tap toggles playback after slight delay to distinguish from double-tap
      setTimeout(() => {
        if (lastTapRef.current === now) {
          togglePlayPause();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // Trigger Like
  const triggerLike = () => {
    const result = toggleReelLike(reel.id, likesCount);
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
    <div className="relative w-full aspect-[9/16] max-w-[310px] sm:max-w-[340px] h-[480px] sm:h-[510px] max-h-[58vh] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-[0_12px_45px_rgba(0,0,0,0.85)] border border-white/15 select-none group">
      {/* Background Ambient Video Blur (Ensures landscape/square videos look lush and fill the frame) */}
      <video
        src={reel.url}
        playsInline
        muted
        loop
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
      />

      {/* 1. Main HTML5 Video Player */}
      <video
        ref={videoRef}
        src={reel.url}
        poster={reel.thumbnailUrl}
        playsInline
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onLoadedData={() => setIsLoading(false)}
        onClick={handleTap}
        className={`w-full h-full relative z-10 cursor-pointer transition-all duration-300 ${
          isFitMode ? 'object-contain' : 'object-cover'
        }`}
      />

      {/* 2. Top Header Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 p-3 sm:p-3.5 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between z-20 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-[10px] sm:text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-roseGlow-500 animate-pulse" />
          <span>Reel {index + 1} of {total}</span>
        </div>

        {/* Floating Sound indicator button in header */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="pointer-events-auto p-1.5 sm:p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 border border-white/15 transition-transform active:scale-95 shadow-md"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-300" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
        </button>
      </div>

      {/* 3. Center Buffering / Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500/20 border-t-roseGlow-500 animate-spin" />
        </div>
      )}

      {/* 4. Center Play / Pause Pop Animation on Tap */}
      <AnimatePresence>
        {showPlayStateIcon && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white pointer-events-none z-30 shadow-2xl border border-white/20"
          >
            {showPlayStateIcon === 'play' ? (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            ) : (
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

      {/* 6. Right Side Action Bar (Facebook / Instagram Style) */}
      <div className="absolute right-2.5 bottom-12 sm:bottom-14 flex flex-col items-center gap-2 sm:gap-2.5 z-30">
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
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-80 shadow-lg ${
              isLiked
                ? 'bg-roseGlow-500/30 border border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-black/50 border border-white/20 hover:bg-black/70'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                isLiked
                  ? 'text-rose-500 fill-rose-500 animate-pulse scale-110'
                  : 'text-white'
              }`}
            />
          </div>
          <span className="text-[10px] font-mono text-white/90 font-medium mt-0.5 drop-shadow-md">
            {likesCount}
          </span>
        </button>

        {/* Audio Mute / Unmute Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="group flex flex-col items-center focus:outline-none"
          title={isMuted ? 'Turn Sound On' : 'Turn Sound Off'}
          aria-label={isMuted ? 'Turn Sound On' : 'Turn Sound Off'}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-80 shadow-lg">
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            )}
          </div>
          <span className="text-[9px] font-mono text-white/80 mt-0.5">
            {isMuted ? 'Mute' : 'Sound'}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShareClick}
          className="group flex flex-col items-center focus:outline-none relative"
          title="Share Reel"
          aria-label="Share Reel"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-80 shadow-lg">
            <Share2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[9px] font-mono text-white/80 mt-0.5">Share</span>

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

        {/* Fullscreen Expand Button */}
        <button
          onClick={handleToggleFullscreen}
          className="group flex flex-col items-center focus:outline-none"
          title="Watch Fullscreen"
          aria-label="Watch Fullscreen"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-80 shadow-lg">
            <Maximize2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[9px] font-mono text-white/80 mt-0.5">Full</span>
        </button>

        {/* Fit / Fill Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFitMode((prev) => !prev);
          }}
          className="group flex flex-col items-center focus:outline-none"
          title={isFitMode ? 'Full View (Fit)' : 'Zoomed View (Fill)'}
          aria-label={isFitMode ? 'Full View' : 'Zoomed View'}
        >
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all active:scale-80 shadow-lg ${
            isFitMode ? 'bg-black/50 border-white/20 text-emerald-300 hover:bg-black/70' : 'bg-roseGlow-600/60 border-rose-400 text-white'
          }`}>
            {isFitMode ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
          </div>
          <span className="text-[9px] font-mono text-white/80 mt-0.5">{isFitMode ? 'Fit' : 'Fill'}</span>
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
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border backdrop-blur-md flex items-center justify-center transition-all active:scale-80 shadow-lg ${
              isDescExpanded ? 'bg-purple-600/60 border-purple-400 text-white' : 'bg-black/50 border-white/20 text-slate-300 hover:bg-black/70'
            }`}>
              <Info className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-mono text-white/80 mt-0.5">Info</span>
          </button>
        )}
      </div>

      {/* 7. Bottom Overlay (Creator info, Caption, Music Ticker) */}
      <div className="absolute bottom-0 left-0 right-12 p-3 sm:p-3.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 pointer-events-auto">
        {/* Creator Identity */}
        <div className="flex items-center gap-1.5 mb-1">
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
        <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-md">
          {reel.title}
        </h3>

        {/* Expandable Description */}
        {reel.description && (
          <div className="mt-0.5">
            <p
              onClick={() => setIsDescExpanded((prev) => !prev)}
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
