'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Sparkles, ArrowDown, BookOpen, Layers } from 'lucide-react';
import { ROMANTIC_QUOTES } from '@/data/config';
import { MemoryCounter } from './MemoryCounter';

interface HeroProps {
  onOpenSurprise?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenSurprise }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ROMANTIC_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex flex-col justify-center items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden"
    >
      {/* Soft Romantic Glow Centerpieces */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-roseGlow-600/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/12 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-7">
        {/* Mili Starlight Portrait Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-roseGlow-500 via-pink-400 to-purple-500 shadow-glow-lg group cursor-pointer"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-obsidian-950 border-2 border-obsidian-950 relative">
            <Image
              src="/images/mili_sketch.jpg"
              alt="Mili Sketch Portrait"
              width={128}
              height={128}
              priority
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-roseGlow-600 text-white flex items-center justify-center shadow-glow text-xs border border-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* Delicate Luxury Starlight Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-card border border-roseGlow-500/30 text-roseGlow-300 text-xs font-mono tracking-widest uppercase shadow-glow hover:border-roseGlow-500/60 transition-all cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-roseGlow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-roseGlow-500"></span>
          </span>
          <span>A Private Digital Universe • Crafted for Mili</span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold text-white tracking-tight leading-[1.1]">
            Everything I Created,
            <span className="block mt-2 bg-gradient-to-r from-roseGlow-400 via-pink-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              I Created With You In Mind <span className="inline-block text-roseGlow-500 animate-pulse">❤️</span>
            </span>
          </h1>
        </motion.div>

        {/* Subtitle & Story */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed"
        >
          Welcome to your personal sanctuary — every website, Python turtle artwork, memory, and love letter I have coded for you across our story together.
        </motion.p>

        {/* Dynamic Rotating Quotes Card */}
        <div className="h-16 flex items-center justify-center my-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="px-6 py-2.5 rounded-2xl glass-card border border-white/5 inline-block"
            >
              <p className="text-sm sm:text-base font-serif italic text-roseGlow-200">
                {ROMANTIC_QUOTES[quoteIndex]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <Layers className="w-4 h-4" />
            <span>Explore Creations</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </a>

          <a
            href="#love-notes"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-200 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-roseGlow-400" />
            <span>Read Love Notes</span>
          </a>

          {onOpenSurprise && (
            <button
              onClick={onOpenSurprise}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-white font-medium text-sm transition-all duration-300 hover:scale-105 shadow-glow-violet"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Special Surprise</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Memory & Relationship Live Counter */}
      <div className="w-full mt-14">
        <MemoryCounter />
      </div>
    </section>
  );
};
