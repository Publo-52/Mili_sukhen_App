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

// Silently preloads image into browser cache
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

  // Preload adjacent images for instant navigation
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

  // Reset image loaded state on navigation
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

  // Video auto-play when switching
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
      videoRef.current.play()
        .then(() => { setIsPlaying(true); setIsBuffering(false); })
        .catch(() => setIsPlaying(false));
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

  // Swipe gesture support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
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
    enter: (dir: number) => ({ x: dir > 0 ? '18%' : '-18%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-18%' : '18%', opacity: 0 }),
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="viewer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[999999] bg-black select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ── TOP BAR ── */}
        <div className="absolute top-0 left-0 right-0 z-[1000000] flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-b from-black/75 to-transparent">

          {/* Left: Counter + type badge */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-white tabular-nums tracking-wide">
              {currentIndex + 1}
              <span className="text-white/35 font-light mx-1">/</span>
              <span className="text-white/60 font-normal">{memories.length}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/12 backdrop-blur-sm text-white/75 font-medium border border-white/10">
              {isVideo
                ? <><Video className="w-3 h-3 text-violet-400" /><span>Video</span></>
                : <span>📸 Photo</span>
              }
            </span>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            {isVideo && (
              <button
                onClick={toggleMute}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-150"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(currentItem.id)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-rose-500/20 active:scale-90 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 transition-all duration-150"
                title="Favourite"
              >
                <Heart className={`w-5 h-5 transition-all duration-200 ${isFavorite ? 'fill-rose-500 text-rose-400 scale-110' : 'hover:text-rose-300'}`} />
              </button>
            )}

            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all duration-150"
              title="Download"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>

            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-rose-600/30 active:scale-90 border border-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-rose-300 transition-all duration-150"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── LEFT ARROW ── */}
        {memories.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/22 active:scale-90 border border-white/12 backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all duration-150 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-px transition-transform duration-150" />
          </button>
        )}

        {/* ── MEDIA AREA ── */}
        <div className="absolute inset-0 flex items-center justify-center px-14 sm:px-20 pt-14 sm:pt-16 pb-28 sm:pb-32">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 350, damping: 35, mass: 0.8 }}
              className="relative w-full h-full flex items-center justify-center"
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
                    className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
                  />

                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (videoRef.current) {
                          videoRef.current.play()
                            .then(() => { setIsPlaying(true); setIsBuffering(false); })
                            .catch(() => {});
                        }
                      }}
                      className="absolute inset-0 bg-black/25 flex items-center justify-center z-20"
                      aria-label="Play video"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 active:scale-95 transition-all">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white text-white translate-x-0.5" />
                      </div>
                    </button>
                  )}

                  {isBuffering && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                      <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Subtle ambient blur fill for letterboxed images */}
                  <div
                    className="absolute inset-0 bg-center bg-cover opacity-[0.12] scale-110 pointer-events-none"
                    style={{
                      backgroundImage: `url(${optimizedSrc})`,
                      filter: 'blur(28px)',
                    }}
                  />

                  {/* Loading spinner */}
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <Loader2 className="w-9 h-9 text-white/40 animate-spin" />
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

        {/* ── RIGHT ARROW ── */}
        {memories.length > 1 && (
          <button
            onClick={() => navigate(1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/22 active:scale-90 border border-white/12 backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all duration-150 group"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-px transition-transform duration-150" />
          </button>
        )}

        {/* ── BOTTOM CAPTION ── */}
        <div className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-20 sm:pb-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto text-center space-y-1.5">

            <h3 className="text-base sm:text-xl font-bold text-white leading-snug tracking-tight">
              {currentItem.title}
            </h3>

            {currentItem.description && (
              <p className="text-xs sm:text-sm text-white/50 font-light max-w-lg mx-auto leading-relaxed">
                {currentItem.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 pt-1">
              {currentItem.date && (
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/40 font-mono">
                  <Calendar className="w-3 h-3 text-rose-400/60 flex-shrink-0" />
                  <span>{currentItem.date}</span>
                </div>
              )}
              {currentItem.location && (
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-white/40 font-mono">
                  <MapPin className="w-3 h-3 text-violet-400/60 flex-shrink-0" />
                  <span>{currentItem.location}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
