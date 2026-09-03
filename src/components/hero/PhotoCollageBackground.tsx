'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  const photos = INTRO_COLLAGE_PHOTOS.length > 0 ? INTRO_COLLAGE_PHOTOS : [];

  // Group photos into 5-6 columns for clean, high-density photo grid
  const columns: string[][] = [[], [], [], [], [], []];
  photos.forEach((photo, i) => {
    columns[i % columns.length].push(photo);
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Full-Screen Photo Collage Grid with Soft Floating Motion */}
      <motion.div
        initial={{ opacity: 0, scale: 1.01 }}
        animate={{
          opacity: 1,
          scale: [1.01, 1.04, 1.01],
          y: [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
          y: { duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
        }}
        className="absolute -inset-4 sm:-inset-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5 p-2 sm:p-4 opacity-85 sm:opacity-90"
        style={{ willChange: 'transform' }}
      >
        {columns.map((colPhotos, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className={`flex flex-col gap-2 sm:gap-2.5 ${
              colIndex % 2 === 1 ? 'pt-4 sm:pt-6' : colIndex % 3 === 2 ? 'pt-2 sm:pt-3' : ''
            }`}
          >
            {colPhotos.map((src, imgIndex) => {
              const isTall = (colIndex + imgIndex) % 3 === 0;
              const isWide = (colIndex + imgIndex) % 4 === 1;
              const heightClass = isTall
                ? 'h-44 sm:h-56'
                : isWide
                ? 'h-28 sm:h-36'
                : 'h-36 sm:h-48';

              return (
                <div
                  key={`${src}-${imgIndex}`}
                  className={`relative w-full ${heightClass} rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 bg-slate-900/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)]`}
                >
                  <Image
                    src={src}
                    alt="Sukhen & Mili Memory"
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover filter brightness-95 contrast-105 saturate-105"
                    priority={imgIndex < 4}
                  />
                  {/* Subtle glass sheen on each photo tile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
                </div>
              );
            })}
          </div>
        ))}
      </motion.div>

      {/* 2. Soft Ambient Tint (Perfect balance: images clearly visible, yet text remains high contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/40 via-black/30 to-[#06040a]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0%,rgba(6,4,10,0.55)_100%)] pointer-events-none" />

      {/* 3. Soft Rose & Purple Ambient Glow */}
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-roseGlow-600/15 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none animate-pulse-slow" />
    </div>
  );
};
