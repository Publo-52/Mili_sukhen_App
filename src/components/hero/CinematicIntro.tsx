'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import { isIntroSeen, setIntroSeen } from '@/lib/storage';
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
  const [stage, setStage] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    if (forceShow) {
      setIsVisible(true);
      setStage(0);

      const timer1 = setTimeout(() => setStage(1), 400);
      const timer2 = setTimeout(() => setStage(2), 1600);
      const timer3 = setTimeout(() => setStage(3), 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
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
        exit={{ opacity: 0, transition: { duration: 0.6 } }}
        className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#06040a] px-6 text-center select-none overflow-hidden"
      >
        {/* Full-Screen Romantic Photo Collage Grid Background (38+ Photos of Sukhen & Mili) */}
        <PhotoCollageBackground />

        {/* Soft Ambient Light Rays */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-roseGlow-600/10 blur-[120px] pointer-events-none animate-pulse-slow z-0" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none -top-20 -left-20 z-0" />

        {/* Skip Intro Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-6 right-6 text-xs font-mono uppercase tracking-widest text-slate-300 hover:text-white px-4 py-2 rounded-full border border-white/20 hover:border-roseGlow-500/50 bg-black/40 hover:bg-black/60 backdrop-blur-xl shadow-lg transition-all duration-200 z-20 cursor-pointer"
        >
          Skip Intro
        </button>

        {/* Ultra-Sleek Frosted Glass Spotlight Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md sm:max-w-lg w-full relative z-10 space-y-4 sm:space-y-6 p-6 sm:p-8 rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(244,63,94,0.15)] mx-auto"
        >
          {/* Glowing Brand Logo Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 p-0.5 shadow-glow-lg mx-auto border border-white/25 overflow-hidden"
          >
            <div className="w-full h-full rounded-[14px] sm:rounded-[22px] bg-[#0c0817] flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Suksharmi Logo"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Stage 1: "For Mili…" */}
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-5xl font-serif font-light text-slate-100 tracking-wide">
                For <span className="text-roseGlow-400 font-normal italic">Mili</span>…
              </h1>
            </motion.div>
          )}

          {/* Stage 2: Subtitle */}
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-2 sm:space-y-3"
            >
              <p className="text-base sm:text-xl text-slate-200 font-light font-sans max-w-sm sm:max-w-md mx-auto leading-relaxed">
                “A collection of everything I created for you.”
              </p>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-rose-200/70 font-mono">
                Websites • Python Art • Memories • Love Notes
              </p>
            </motion.div>
          )}

          {/* Stage 3: Enter Universe CTA */}
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="pt-2 sm:pt-3"
            >
              <button
                onClick={handleDismiss}
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-roseGlow-600 via-roseGlow-500 to-purple-600 text-white font-medium text-sm sm:text-base shadow-glow hover:shadow-glow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Enter The Digital Universe</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Ambient bottom indicator */}
        <div className="absolute bottom-5 sm:bottom-8 text-[10px] sm:text-[11px] text-slate-300/80 font-mono tracking-wider drop-shadow-md">
          Suksharmi Universe • Crafted with love by Sukhen
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
