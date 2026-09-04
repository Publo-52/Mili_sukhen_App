'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { setIntroSeen } from '@/lib/storage';
import { PhotoCollageBackground } from './PhotoCollageBackground';

interface CinematicIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
  onClose?: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onComplete,
  forceShow = false,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(forceShow);

  useEffect(() => {
    setIsVisible(forceShow);
  }, [forceShow]);

  const handleDismiss = () => {
    setIntroSeen(true);
    setIsVisible(false);
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#06040a] px-4 text-center select-none overflow-hidden"
        >
          {/* Full-Screen Pure GPU 100% Zero-Blink Seamless Infinite Upward Scrolling Photo Wall */}
          <PhotoCollageBackground />

          {/* Soft Ambient Light Rays (GPU-Optimized Radial Gradients) */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full pointer-events-none animate-pulse-slow z-0"
            style={{
              background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full pointer-events-none -top-20 -left-20 z-0"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 70%)',
            }}
          />

          {/* Ultra-Translucent Crystal Glass Skip Intro Button (High Photo Visibility) */}
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 sm:top-6 sm:right-6 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-slate-200 hover:text-white px-3.5 py-1.5 rounded-full border border-white/15 hover:border-white/35 bg-black/10 hover:bg-black/30 backdrop-blur-xs transition-all duration-200 z-20 cursor-pointer shadow-sm"
          >
            Skip Intro
          </button>

          {/* Floating Centered Content — Gracefully Positioned Lower to Reveal Upper Photos */}
          <div className="max-w-md sm:max-w-lg w-full relative z-10 space-y-3 sm:space-y-4 text-center mx-auto px-4 mt-28 sm:mt-36 md:mt-44">
            {/* Main Title: "For Mili…" */}
            <h1 className="text-3xl sm:text-5xl font-serif font-light text-white tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              For <span className="text-roseGlow-400 font-normal italic drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">Mili</span>…
            </h1>

            {/* Subtitle & Categories */}
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-base sm:text-xl text-slate-100 font-light font-sans max-w-sm sm:max-w-md mx-auto leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
                “A collection of everything I created for you.”
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-rose-200/90 font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                Websites • Python Art • Memories • Love Notes
              </p>
            </div>

            {/* Ultra-Translucent Crystal Glass CTA Button (Shows Scrolling Photos Clearly Behind) */}
            <div className="pt-2">
              <button
                onClick={handleDismiss}
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-roseGlow-600/35 via-roseGlow-500/30 to-purple-600/35 hover:from-roseGlow-600/55 hover:to-purple-600/55 backdrop-blur-xs text-white font-medium text-xs sm:text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Enter The Digital Universe</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Ultra-Low-Opacity Crystal Glass Bottom Badge (100% Background Photo Visibility) */}
          <div className="absolute bottom-4 sm:bottom-6 z-20 flex items-center justify-center">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/10 border border-white/10 backdrop-blur-xs text-[11px] sm:text-xs font-mono tracking-wider shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200 font-semibold">
                Suksharmi Universe
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-slate-200">
                Crafted with <Heart className="w-3.5 h-3.5 text-roseGlow-400 fill-roseGlow-500 inline animate-pulse" /> by Sukhen
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
