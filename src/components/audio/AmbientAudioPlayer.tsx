'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipBack, SkipForward, X } from 'lucide-react';
import { audioEngine, AudioTrack } from '@/lib/audio';

export const AmbientAudioPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(audioEngine.getCurrentTrack());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, track) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
    });
    return () => unsubscribe();
  }, []);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePlay = () => {
    if (audioEngine.getIsPlaying()) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none"
    >
      {/* Control Buttons (Shown ONLY when Song Icon is clicked) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="flex items-center gap-1.5 p-1.5 rounded-full glass-card border border-roseGlow-500/40 bg-obsidian-950/95 shadow-glow backdrop-blur-xl"
          >
            {/* Previous Track Button */}
            <button
              onClick={() => audioEngine.prevTrack()}
              className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-200"
              title="Previous Track"
              aria-label="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause Button */}
            <button
              onClick={togglePlay}
              className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 shadow-md ${
                isPlaying
                  ? 'bg-gradient-to-r from-roseGlow-600 to-purple-600 text-white shadow-glow'
                  : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/20'
              }`}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={() => audioEngine.nextTrack()}
              className="p-2.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all duration-200"
              title="Next Track"
              aria-label="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Song Icon Button (Click to reveal/hide buttons) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`p-3 rounded-full glass-card border transition-all duration-300 active:scale-90 shadow-2xl flex items-center justify-center ${
          isOpen
            ? 'border-roseGlow-500/70 bg-obsidian-900 text-roseGlow-400 shadow-glow'
            : isPlaying
            ? 'border-roseGlow-500/50 bg-obsidian-950/90 text-roseGlow-400 shadow-glow'
            : 'border-white/15 bg-obsidian-950/80 text-slate-300 hover:text-white hover:border-roseGlow-500/40'
        }`}
        title={isOpen ? 'Close Music Controls' : 'Music Player'}
        aria-label={isOpen ? 'Close Music Controls' : 'Music Player'}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-roseGlow-400" />
        ) : (
          <div className="relative flex items-center justify-center">
            {isPlaying && (
              <span className="absolute -inset-1 rounded-full bg-roseGlow-500/30 animate-ping" />
            )}
            <Music className={`w-5 h-5 ${isPlaying ? 'text-roseGlow-400 animate-pulse' : ''}`} />
          </div>
        )}
      </button>
    </div>
  );
};
