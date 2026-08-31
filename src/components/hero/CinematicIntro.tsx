'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';
import { isIntroSeen, setIntroSeen } from '@/lib/storage';

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
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!forceShow) {
      const alreadySeen = isIntroSeen();
      if (alreadySeen) {
        setIsVisible(false);
        if (onComplete) onComplete();
        return;
      }
    }

    // Sequence stages
    const timer1 = setTimeout(() => setStage(1), 800);  // "For Mili…"
    const timer2 = setTimeout(() => setStage(2), 2600); // "A collection of everything I created for you."
    const timer3 = setTimeout(() => setStage(3), 4800); // Enter button ready

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [forceShow, onComplete]);

  const handleDismiss = () => {
    setIntroSeen(true);
    setIsVisible(false);
    if (onComplete) onComplete();
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06040a] px-6 text-center select-none overflow-hidden"
      >
        {/* Soft Ambient Light Ray */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-roseGlow-600/10 blur-[120px] pointer-events-none animate-pulse-slow" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none -top-20 -left-20" />

        {/* Skip Intro Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-8 right-8 text-xs font-mono uppercase tracking-widest text-slate-400 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-roseGlow-500/40 bg-white/5 backdrop-blur-md transition-all duration-300 z-10"
        >
          Skip Intro
        </button>

        <div className="max-w-2xl relative z-10 space-y-8">
          {/* Glowing Heart Accent */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-400 shadow-glow mb-2"
          >
            <Heart className="w-8 h-8 fill-roseGlow-500/30 animate-pulse text-roseGlow-400" />
          </motion.div>

          {/* Stage 1: "For Mili…" */}
          {stage >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-4xl md:text-6xl font-serif font-light text-slate-100 tracking-wide">
                For <span className="text-roseGlow-400 font-normal italic">Mili</span>…
              </h1>
            </motion.div>
          )}

          {/* Stage 2: Subtitle */}
          {stage >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <p className="text-lg md:text-2xl text-slate-300 font-light font-sans max-w-xl mx-auto leading-relaxed">
                “A collection of everything I created for you.”
              </p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-mono">
                Websites • Python Art • Memories • Love Notes
              </p>
            </motion.div>
          )}

          {/* Stage 3: Enter Universe CTA */}
          {stage >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="pt-6"
            >
              <button
                onClick={handleDismiss}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-roseGlow-600 via-roseGlow-500 to-purple-600 text-white font-medium text-base shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>Enter The Digital Universe</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Ambient bottom indicator */}
        <div className="absolute bottom-8 text-[11px] text-slate-400 font-mono tracking-wider">
          Suksharmi Universe • Crafted with love by Sukhen
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
