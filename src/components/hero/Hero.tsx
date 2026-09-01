'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowDown, BookOpen, Layers } from 'lucide-react';
import { ROMANTIC_QUOTES } from '@/data/config';
import { MemoryCounter } from './MemoryCounter';
import { SectionType } from '@/types';

interface HeroProps {
  onOpenSurprise?: () => void;
  onSelectSection?: (section: SectionType) => void;
}

const HERO_AVATAR_IMAGES = [
  { src: '/images/hero/mili_hero_1.png', alt: 'Mili in Saree' },
  { src: '/images/hero/mili_hero_2.png', alt: 'Mili with Plush' },
  { src: '/images/hero/mili_hero_3.jpg', alt: 'Sukhen & Mili' },
  { src: '/images/hero/mili_hero_4.png', alt: 'Mili at Beach' },
  { src: '/images/hero/mili_hero_5.jpg', alt: 'Sukhen & Mili Love' },
];

export const Hero: React.FC<HeroProps> = ({ onOpenSurprise, onSelectSection }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [avatarIndex, setAvatarIndex] = useState(0);

  // Quote rotating interval (6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ROMANTIC_QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Avatar looping interval (strictly 5 seconds with ultra-smooth easing)
  useEffect(() => {
    const avatarTimer = setInterval(() => {
      setAvatarIndex((prev) => (prev + 1) % HERO_AVATAR_IMAGES.length);
    }, 5000);
    return () => clearInterval(avatarTimer);
  }, []);

  return (
    <section
      id="hero"
      className="relative flex flex-col justify-center items-center pt-24 sm:pt-28 md:pt-32 pb-4 px-3 sm:px-6 lg:px-8 text-center overflow-hidden w-full max-w-full"
    >
      {/* Soft Romantic Glow Centerpieces */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[550px] h-[320px] sm:h-[550px] bg-roseGlow-600/12 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] bg-purple-600/10 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto space-y-5 sm:space-y-6 w-full max-w-full">
        {/* Mili Starlight Portrait Avatar with 5s Smooth Looping Transitions */}
        <div
          onClick={() => setAvatarIndex((prev) => (prev + 1) % HERO_AVATAR_IMAGES.length)}
          className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-[2px] bg-gradient-to-tr from-roseGlow-500 via-pink-400 to-purple-500 shadow-glow group cursor-pointer animate-fade-in transition-all duration-300 hover:shadow-[0_0_35px_rgba(244,63,94,0.45)]"
          title="Click to cycle photo"
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-obsidian-950 border-[1px] border-obsidian-950 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={avatarIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-full relative"
              >
                <Image
                  src={HERO_AVATAR_IMAGES[avatarIndex].src}
                  alt={HERO_AVATAR_IMAGES[avatarIndex].alt}
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
                  priority
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-roseGlow-600 text-white flex items-center justify-center shadow-glow text-xs border border-white/20 z-10 transition-transform duration-300 group-hover:scale-110">
            <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
          </div>
        </div>

        {/* Delicate Luxury Starlight Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-roseGlow-500/30 text-roseGlow-300 text-[10px] sm:text-xs font-mono uppercase shadow-glow max-w-[88vw] mx-auto text-center animate-fade-in">
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-roseGlow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-roseGlow-500"></span>
          </span>
          <span className="truncate">Suksharmi • Private Digital Universe</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-2 px-1 animate-fade-in">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-sans font-extrabold text-white tracking-tight leading-[1.2] break-words max-w-full">
            Everything I Created,
            <span className="block mt-1 bg-gradient-to-r from-roseGlow-400 via-pink-200 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              I Created With You In Mind <span className="inline-block text-roseGlow-500 animate-pulse">❤️</span>
            </span>
          </h1>
        </div>

        {/* Subtitle & Story */}
        <p className="text-xs sm:text-base text-slate-300 font-light max-w-lg mx-auto leading-relaxed px-3 animate-fade-in">
          Welcome to your personal sanctuary — every website, Python turtle artwork, memory, and love letter I have coded for you across our story together.
        </p>

        {/* Dynamic Rotating Quotes Card */}
        <div className="min-h-[48px] flex items-center justify-center my-1 px-2 w-full">
          <div className="px-3.5 py-1.5 rounded-xl glass-card border border-white/5 inline-block max-w-[85vw] animate-fade-in">
            <p className="text-[11px] sm:text-sm font-serif italic text-roseGlow-200 text-center leading-normal line-clamp-2">
              “{ROMANTIC_QUOTES[quoteIndex]}”
            </p>
          </div>
        </div>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1 w-full max-w-xs sm:max-w-none mx-auto px-4 animate-fade-in">
          <button
            onClick={() => onSelectSection ? onSelectSection('projects') : window.location.assign('#projects')}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-glow transition-all active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Explore Creations</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>

          <button
            onClick={() => onSelectSection ? onSelectSection('love-notes') : window.location.assign('#love-notes')}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-200 hover:text-white font-medium text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-roseGlow-400" />
            <span>Read Love Notes</span>
          </button>

          {onOpenSurprise && (
            <button
              onClick={onOpenSurprise}
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-purple-500/10 border border-purple-500/30 hover:border-purple-500/60 text-purple-300 hover:text-white font-medium text-xs sm:text-sm transition-all shadow-glow-violet cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Special Surprise</span>
            </button>
          )}
        </div>
      </div>

      {/* Memory & Relationship Live Counter */}
      <div className="w-full mt-4 sm:mt-6 max-w-full">
        <MemoryCounter />
      </div>
    </section>
  );
};
