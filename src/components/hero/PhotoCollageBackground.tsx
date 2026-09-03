'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  const photos = INTRO_COLLAGE_PHOTOS.length > 0 ? INTRO_COLLAGE_PHOTOS : [];

  // Group photos across 6 multi-stream columns
  const columnsCount = 6;
  const columns: string[][] = Array.from({ length: columnsCount }, () => []);
  photos.forEach((photo, i) => {
    columns[i % columnsCount].push(photo);
  });

  // Speeds in seconds for each column (varied for rich organic parallax motion)
  const columnDurations = [42, 50, 36, 46, 39, 48];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Infinite Seamless Vertical Scrolling Photo Wall (Bottom to Top Loop) */}
      <div className="absolute -inset-4 sm:-inset-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 p-2 sm:p-3 opacity-90">
        {columns.map((colPhotos, colIndex) => {
          // Duplicate items to ensure 100% seamless, glitchless infinite loop
          const infinitePhotos = [...colPhotos, ...colPhotos, ...colPhotos];
          const duration = columnDurations[colIndex % columnDurations.length];

          return (
            <div key={`col-stream-${colIndex}`} className="overflow-hidden relative h-[140vh]">
              <motion.div
                animate={{
                  y: ['0%', '-50%'],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ willChange: 'transform', transform: 'translate3d(0, 0, 0)' }}
                className="flex flex-col gap-2 sm:gap-3"
              >
                {infinitePhotos.map((src, imgIndex) => {
                  const isTall = (colIndex + imgIndex) % 3 === 0;
                  const isWide = (colIndex + imgIndex) % 4 === 1;
                  const heightClass = isTall
                    ? 'h-48 sm:h-64'
                    : isWide
                    ? 'h-32 sm:h-40'
                    : 'h-40 sm:h-52';

                  return (
                    <div
                      key={`stream-${colIndex}-${imgIndex}-${src}`}
                      className={`relative w-full ${heightClass} shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-white/25 bg-slate-900/80 shadow-[0_6px_20px_rgba(0,0,0,0.6)]`}
                    >
                      <Image
                        src={src}
                        alt="Sukhen & Mili Memory"
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 33vw, 16vw"
                        className="object-cover filter brightness-100 contrast-105 saturate-105"
                        priority={imgIndex < 6}
                      />
                      {/* Gentle glass sheen overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
                    </div>
                  );
                })}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* 2. Soft Ambient Tint (Ensures photos are vivid while text floats with cinematic brilliance) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/40 via-black/25 to-[#06040a]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.15)_0%,rgba(6,4,10,0.5)_100%)] pointer-events-none" />

      {/* 3. Soft Rose & Purple Romantic Ambient Glow Rays */}
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] rounded-full bg-roseGlow-600/15 blur-[130px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none animate-pulse-slow" />
    </div>
  );
};
