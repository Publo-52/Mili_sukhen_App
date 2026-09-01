'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MapPin, Calendar, Download, Maximize2, Sparkles, Video, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { MemoryItem } from '@/types';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorite?: boolean;
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
  const currentItem = memories[currentIndex];
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && memories.length > 1) onNavigate((currentIndex + 1) % memories.length);
      if (e.key === 'ArrowLeft' && memories.length > 1) onNavigate((currentIndex - 1 + memories.length) % memories.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, memories.length, onClose, onNavigate]);

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl select-none">
        {/* Top Controls Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">
              {currentIndex + 1} / {memories.length}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-roseGlow-300 font-mono">
              {currentItem.type === 'video' ? '🎬 Video' : '📸 Photo'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(currentItem.id)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-roseGlow-400 transition-colors"
                title="Toggle Favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-roseGlow-500 text-roseGlow-500' : ''}`} />
              </button>
            )}

            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              title="Open Original / Download"
            >
              <Download className="w-5 h-5" />
            </a>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-400 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Previous Button */}
        {memories.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex - 1 + memories.length) % memories.length)}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md z-40"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Media Container */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-12 pb-24 sm:pb-28">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-5xl max-h-[70vh] w-full h-full flex items-center justify-center rounded-2xl overflow-hidden"
          >
            {currentItem.type === 'video' ? (
              <video
                src={currentItem.url}
                controls
                autoPlay
                className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentItem.url}
                  alt={currentItem.title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </motion.div>
        </div>

        {/* Next Button */}
        {memories.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex + 1) % memories.length)}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md z-40"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Bottom Caption & Details Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-40">
          <div className="max-w-4xl mx-auto space-y-1.5 text-center">
            <h3 className="text-base sm:text-xl font-bold text-white tracking-tight">
              {currentItem.title}
            </h3>

            {currentItem.description && (
              <p className="text-xs sm:text-sm text-slate-300 font-light max-w-2xl mx-auto">
                {currentItem.description}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
              {currentItem.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-roseGlow-400" />
                  <span>{currentItem.date}</span>
                </div>
              )}
              {currentItem.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>{currentItem.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
