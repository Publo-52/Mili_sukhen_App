'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Calendar,
  Download,
  Video,
  Play,
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react';
import { MemoryItem } from '@/types';
import { isMediaVideo, getOptimizedImageUrl } from '@/lib/utils';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
}

// Preloads an image URL in the browser background
function preloadImage(url: string) {
  if (typeof window === 'undefined' || !url) return;
  const img = new window.Image();
  img.src = url;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  isOpen,
  onClose,
  memories,
  currentIndex,
  onNavigate,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [imgLoaded, setImgLoaded] = useState(false);

  const currentItem = memories[currentIndex];
  const isVideo = isMediaVideo(currentItem);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // ---------- preload adjacent images ----------
  useEffect(() => {
    if (!isOpen || !memories.length) return;
    const nextIdx = (currentIndex + 1) % memories.length;
    const prevIdx = (currentIndex - 1 + memories.length) % memories.length;

    const preload = (item: MemoryItem) => {
      if (!isMediaVideo(item)) {
        preloadImage(getOptimizedImageUrl(item.url, { width: 1600, quality: 90 }));
      }
    };
    preload(memories[nextIdx]);
    preload(memories[prevIdx]);
  }, [currentIndex, isOpen, memories]);

  // Reset loaded state when image changes
  useEffect(() => {
    if (!isVideo) setImgLoaded(false);
  }, [currentIndex, isVideo]);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && memories.length > 1) navigate(1);
      if (e.key === 'ArrowLeft' && memories.length > 1) navigate(-1);
      if (e.key === ' ' && isVideo && videoRef.current) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex, memories.length, isVideo, onClose, onNavigate]);

  // Video auto-play on switch
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsBuffering(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => { setIsPlaying(true); setIsBuffering(false); })
          .catch(() => { setIsPlaying(false); setIsBuffering(false); });
      }
    }
  }, [currentIndex, isVideo, currentItem?.url]);

  const navigate = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    onNavigate((currentIndex + dir + memories.length) % memories.length);
  }, [currentIndex, memories.length, onNavigate]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => { setIsPlaying(true); setIsBuffering(false); }).catch(() => setIsPlaying(false));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Touch / swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      navigate(dx < 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!isOpen || !currentItem || !mounted) return null;

  const posterImage = getOptimizedImageUrl(currentItem.thumbnailUrl || currentItem.url, {
    width: 1200,
    quality: 'auto',
  });

  const optimizedSrc = getOptimizedImageUrl(currentItem.url, { width: 1600, quality: 90 });

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '30%' : '-30%', opacity: 0, scale: 0.94 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0, scale: 0.94 }),
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="viewer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/98 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── Top Controls Bar ── */}
        <div className="absolute top-0 left-0 right-0 z-[1000000] px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          {/* Counter + Badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-white/60 tabular-nums">
              {currentIndex + 1}
              <span className="text-white/30 mx-1">/</span>
              {memories.length}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-pink-300 font-medium flex items-center gap-1 border border-white/10">
              {isVideo ? (
                <><Video className="w-3 h-3 text-purple-400" /><span>Video</span></>
              ) : (
                <span>📸 Photo</span>
              )}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {isVideo && (
              <button
                onClick={toggleMute}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 active:scale-90"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(currentItem.id)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-pink-500/30 text-white/80 hover:text-pink-300 transition-all backdrop-blur-md border border-white/10 active:scale-90"
                title="Favourite"
              >
                <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'fill-pink-500 text-pink-500 scale-110' : ''}`} />
              </button>
            )}

            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 active:scale-90"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/30 text-white/80 hover:text-rose-300 transition-all backdrop-blur-md border border-white/10 active:scale-90"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Left Arrow ── */}
        {memories.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/15 backdrop-blur-md transition-all duration-150 active:scale-90 shadow-2xl group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform duration-150" />
          </button>
        )}

        {/* ── Media Container ── */}
        <div className="relative w-full h-full flex flex-col items-center justify-center px-16 sm:px-24 pb-28 sm:pb-32 pt-16 sm:pt-20">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 38, mass: 0.7 }}
              className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden"
            >
              {isVideo ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={currentItem.url}
                    poster={posterImage}
                    controls
                    playsInline
                    preload="auto"
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onWaiting={() => setIsBuffering(true)}
                    onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
                    className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
                  />

                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (videoRef.current) {
                          videoRef.current.play().then(() => { setIsPlaying(true); setIsBuffering(false); }).catch(() => {});
                        }
                      }}
                      className="absolute inset-0 bg-black/30 flex items-center justify-center z-20 cursor-pointer"
                      aria-label="Play video"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-2xl border border-white/20 transform hover:scale-110 active:scale-95 transition-transform">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white translate-x-0.5" />
                      </div>
                    </button>
                  )}

                  {isBuffering && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none z-30">
                      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Blurred background for portrait photos — fills letterbox area */}
                  <div
                    className="absolute inset-0 bg-center bg-cover blur-2xl opacity-20 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${optimizedSrc})` }}
                  />

                  {/* Skeleton shimmer while loading */}
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-pink-400 animate-spin" />
                    </div>
                  )}

                  <Image
                    src={optimizedSrc}
                    alt={currentItem.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 90vw"
                    className={`object-contain transition-opacity duration-200 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    priority
                    onLoad={() => setImgLoaded(true)}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Arrow ── */}
        {memories.length > 1 && (
          <button
            onClick={() => navigate(1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/15 backdrop-blur-md transition-all duration-150 active:scale-90 shadow-2xl group"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform duration-150" />
          </button>
        )}

        {/* ── Bottom Caption Bar ── */}
        <div className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="max-w-3xl mx-auto text-center space-y-1">
            <h3 className="text-sm sm:text-lg font-semibold text-white tracking-tight leading-snug">
              {currentItem.title}
            </h3>

            {currentItem.description && (
              <p className="text-[11px] sm:text-xs text-white/55 font-light max-w-xl mx-auto leading-relaxed">
                {currentItem.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 pt-0.5">
              {currentItem.date && (
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/40 font-mono">
                  <Calendar className="w-3 h-3 text-pink-400/70" />
                  <span>{currentItem.date}</span>
                </div>
              )}
              {currentItem.location && (
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-white/40 font-mono">
                  <MapPin className="w-3 h-3 text-purple-400/70" />
                  <span>{currentItem.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Thumbnail strip (bottom dot indicators) ── */}
        {memories.length > 1 && memories.length <= 60 && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center z-50 pointer-events-none">
            <div className="flex gap-1 px-4 overflow-hidden max-w-[200px] sm:max-w-sm">
              {memories.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === currentIndex
                      ? 'w-4 h-1.5 bg-pink-400'
                      : 'w-1.5 h-1.5 bg-white/25'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
