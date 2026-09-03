'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  const photos = INTRO_COLLAGE_PHOTOS.length > 0 ? INTRO_COLLAGE_PHOTOS : [];

  // Group photos across multi-stream columns
  const columnsCount = 6;
  const columns: string[][] = Array.from({ length: columnsCount }, () => []);
  photos.forEach((photo, i) => {
    columns[i % columnsCount].push(photo);
  });

  // Speeds in seconds for each column (smooth organic parallax)
  const columnDurations = [48, 56, 42, 52, 45, 54];

  // Uniform height per column for 100% mathematical zero-blink seamless looping
  const columnCardHeights = [
    'h-44 sm:h-56',
    'h-36 sm:h-48',
    'h-48 sm:h-60',
    'h-40 sm:h-52',
    'h-44 sm:h-56',
    'h-38 sm:h-50',
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Fully-Contained & Border-Framed Infinite Scrolling Photo Stream (Left & Right Margins Adjusted) */}
      <div className="absolute inset-0 px-2.5 sm:px-5 md:px-6 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 opacity-90">
        {columns.map((colPhotos, colIndex) => {
          // Double duplicate: Set 1 + Set 2 (Identical sets guarantee exact 50% loop boundary without any blink/jump)
          const streamPhotos = [...colPhotos, ...colPhotos];
          const duration = columnDurations[colIndex % columnDurations.length];
          const heightClass = columnCardHeights[colIndex % columnCardHeights.length];

          return (
            <div
              key={`col-stream-${colIndex}`}
              className="overflow-hidden relative h-[150vh]"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translate3d(0,0,0)',
              }}
            >
              <motion.div
                animate={{
                  y: ['0%', '-50%'],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  willChange: 'transform',
                  transform: 'translate3d(0,0,0)',
                  WebkitTransform: 'translate3d(0,0,0)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
                className="flex flex-col gap-2 sm:gap-3"
              >
                {streamPhotos.map((src, imgIndex) => (
                  <div
                    key={`stream-${colIndex}-${imgIndex}-${src}`}
                    className={`relative w-full ${heightClass} shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/30 bg-slate-900/90 shadow-[0_6px_20px_rgba(0,0,0,0.6)]`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                  >
                    <img
                      src={src}
                      alt="Sukhen & Mili Memory"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover filter brightness-100 contrast-105 saturate-105 pointer-events-none select-none"
                    />
                    {/* Subtle glass sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
                  </div>
                ))}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* 2. Soft Ambient Tint (Crystal clear photo view with high text legibility) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/40 via-black/25 to-[#06040a]/55 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(6,4,10,0.5)_100%)] pointer-events-none" />

      {/* 3. Soft Rose & Purple Romantic Ambient Glow Rays */}
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] rounded-full bg-roseGlow-600/15 blur-[130px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none animate-pulse-slow" />
    </div>
  );
};
