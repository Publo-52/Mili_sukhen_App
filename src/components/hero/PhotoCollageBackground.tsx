'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  // Ensure we have a dense mosaic grid by repeating or tiling if needed
  const photos = INTRO_COLLAGE_PHOTOS.length > 0 ? INTRO_COLLAGE_PHOTOS : [];

  // Group photos into 6 columns for dense multi-column mosaic masonry
  const columns: string[][] = [[], [], [], [], [], []];
  photos.forEach((photo, i) => {
    columns[i % columns.length].push(photo);
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Full-Screen Photo Collage Grid with Subtle Ambient Floating Drift */}
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{
          scale: [1.05, 1, 1.03],
          y: [0, -12, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        className="absolute -inset-10 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3 p-4 opacity-35 sm:opacity-40"
        style={{ willChange: 'transform' }}
      >
        {columns.map((colPhotos, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className={`flex flex-col gap-2.5 sm:gap-3 ${
              colIndex % 2 === 1 ? 'pt-6 sm:pt-10' : colIndex % 3 === 2 ? 'pt-3 sm:pt-5' : ''
            }`}
          >
            {colPhotos.map((src, imgIndex) => {
              // Vary aspect ratios dynamically for that authentic photo-album collage look
              const isTall = (colIndex + imgIndex) % 3 === 0;
              const isWide = (colIndex + imgIndex) % 4 === 1;
              const heightClass = isTall
                ? 'h-44 sm:h-56'
                : isWide
                ? 'h-28 sm:h-36'
                : 'h-36 sm:h-44';

              return (
                <motion.div
                  key={`${src}-${imgIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: (colIndex * 0.08 + imgIndex * 0.05) % 0.8,
                  }}
                  className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-[0_8px_20px_rgba(0,0,0,0.6)] backdrop-blur-xs`}
                >
                  <Image
                    src={src}
                    alt="Sukhen & Mili Memory"
                    fill
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover transition-transform duration-700 hover:scale-110 filter brightness-95 contrast-105 saturate-110"
                    priority={imgIndex < 3}
                    loading={imgIndex < 3 ? 'eager' : 'lazy'}
                  />
                  {/* Subtle glass reflection gradient over each photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
                </motion.div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* 2. Romantic Radial Vignette Overlay (Ensures text in center is super readable and glowing) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06040a] via-[#06040a]/70 to-[#06040a]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,4,10,0.45)_0%,rgba(6,4,10,0.85)_65%,#06040a_100%)]" />

      {/* 3. Soft Rose & Purple Ambient Glow Rays */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-roseGlow-600/15 blur-[140px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[140px] animate-pulse-slow" />
    </div>
  );
};
