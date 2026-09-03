'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
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
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (forceShow) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [forceShow]);

  const handleDismiss = () => {
    setIntroSeen(true);
    setIsVisible(false);
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  if (!mounted || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#06040a] px-6 text-center select-none overflow-hidden"
      >
        {/* Full-Screen Seamless Infinite Scrolling Photo Wall (Bottom to Top Stream) */}
        <PhotoCollageBackground />

        {/* Soft Ambient Light Rays */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-roseGlow-600/15 blur-[130px] pointer-events-none animate-pulse-slow z-0" />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none -top-20 -left-20 z-0" />

        {/* Skip Intro Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-6 right-6 text-xs font-mono uppercase tracking-widest text-slate-300 hover:text-white px-4 py-2 rounded-full border border-white/20 hover:border-roseGlow-500/50 bg-black/40 hover:bg-black/60 backdrop-blur-xl shadow-lg transition-all duration-200 z-20 cursor-pointer"
        >
          Skip Intro
        </button>

        {/* Constant Centered Floating Intro Content (Logo removed, all elements permanently visible) */}
        <div className="max-w-xl w-full relative z-10 space-y-4 sm:space-y-6 text-center mx-auto px-4">
          {/* Main Title: "For Mili…" */}
          <h1 className="text-4xl sm:text-6xl font-serif font-light text-white tracking-wide drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            For <span className="text-roseGlow-400 font-normal italic drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">Mili</span>…
          </h1>

          {/* Subtitle & Categories */}
          <div className="space-y-2 sm:space-y-3">
            <p className="text-lg sm:text-2xl text-slate-100 font-light font-sans max-w-md sm:max-w-lg mx-auto leading-relaxed drop-shadow-[0_4px_14px_rgba(0,0,0,0.95)]">
              “A collection of everything I created for you.”
            </p>
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-rose-200 font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Websites • Python Art • Memories • Love Notes
            </p>
          </div>

          {/* Constant Enter Universe CTA Button */}
          <div className="pt-2 sm:pt-4">
            <button
              onClick={handleDismiss}
              className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-roseGlow-600 via-roseGlow-500 to-purple-600 text-white font-semibold text-base sm:text-lg shadow-[0_0_35px_rgba(244,63,94,0.6)] hover:shadow-[0_0_50px_rgba(244,63,94,0.8)] transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer border border-white/25"
            >
              <Sparkles className="w-5 h-5 text-amber-200 animate-spin-slow" />
              <span>Enter The Digital Universe</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Ambient bottom indicator */}
        <div className="absolute bottom-5 sm:bottom-8 text-[10px] sm:text-[11px] text-slate-300/80 font-mono tracking-wider drop-shadow-md">
          Suksharmi Universe • Crafted with love by Sukhen
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
