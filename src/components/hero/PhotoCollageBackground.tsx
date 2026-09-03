'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  const photos = INTRO_COLLAGE_PHOTOS.length > 0 ? INTRO_COLLAGE_PHOTOS : [];

  // Group photos into 6 columns for dense multi-column mosaic masonry
  const columns: string[][] = [[], [], [], [], [], []];
  photos.forEach((photo, i) => {
    columns[i % columns.length].push(photo);
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Full-Screen Bright & Vibrant Photo Collage Grid Wall */}
      <motion.div
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{
          opacity: 1,
          scale: [1.02, 1, 1.02],
          y: [0, -10, 0],
        }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 30, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
          y: { duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
        }}
        className="absolute -inset-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 p-2 sm:p-4 opacity-75 sm:opacity-80"
        style={{ willChange: 'transform' }}
      >
        {columns.map((colPhotos, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className={`flex flex-col gap-2 sm:gap-3 ${
              colIndex % 2 === 1 ? 'pt-4 sm:pt-8' : colIndex % 3 === 2 ? 'pt-2 sm:pt-4' : ''
            }`}
          >
            {colPhotos.map((src, imgIndex) => {
              // Vary aspect ratios dynamically for that authentic photo-album collage look
              const isTall = (colIndex + imgIndex) % 3 === 0;
              const isWide = (colIndex + imgIndex) % 4 === 1;
              const heightClass = isTall
                ? 'h-48 sm:h-64'
                : isWide
                ? 'h-32 sm:h-40'
                : 'h-40 sm:h-52';

              return (
                <div
                  key={`${src}-${imgIndex}`}
                  className={`relative w-full ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-900/80 shadow-[0_8px_25px_rgba(0,0,0,0.7)]`}
                >
                  <Image
                    src={src}
                    alt="Sukhen & Mili Memory"
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover filter brightness-100 contrast-105 saturate-110"
                    priority={imgIndex < 4}
                  />
                  {/* Subtle clean glass sheen over each photo tile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* 2. Soft Ambient Tint & Center Spotlight (Keeps photos brightly visible while focusing on center) */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,4,10,0.35)_0%,rgba(6,4,10,0.65)_70%,rgba(6,4,10,0.92)_100%)]" />

      {/* 3. Soft Rose & Purple Romantic Glow Accents */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-roseGlow-600/20 blur-[130px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-purple-600/20 blur-[130px] animate-pulse-slow" />
    </div>
  );
};
