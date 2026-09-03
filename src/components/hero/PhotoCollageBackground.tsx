'use client';

import React from 'react';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  const photos = INTRO_COLLAGE_PHOTOS.length > 0 ? INTRO_COLLAGE_PHOTOS : [];

  // Group photos across 6 multi-stream columns
  const columnsCount = 6;
  const columns: string[][] = Array.from({ length: columnsCount }, () => []);
  photos.forEach((photo, i) => {
    columns[i % columnsCount].push(photo);
  });

  // Speeds in seconds for each column
  const columnDurations = [46, 54, 40, 50, 44, 52];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      <style>{`
        @keyframes streamScrollUp {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(0, -50%, 0);
          }
        }
        .stream-column {
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
      `}</style>

      {/* 1. Fully-Contained & Border-Framed Pure GPU Infinite Scrolling Photo Stream (Zero JS Blinking) */}
      <div className="absolute inset-0 px-2 sm:px-4 md:px-6 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 opacity-95">
        {columns.map((colPhotos, colIndex) => {
          // Double duplicate: Set 1 + Set 2 with uniform aspect-[4/5] box for 100% mathematical zero-blink loop
          const streamPhotos = [...colPhotos, ...colPhotos];
          const duration = columnDurations[colIndex % columnDurations.length];

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
              <div
                className="flex flex-col gap-2 sm:gap-3 stream-column"
                style={{
                  animation: `streamScrollUp ${duration}s linear infinite`,
                }}
              >
                {streamPhotos.map((src, imgIndex) => (
                  <div
                    key={`stream-${colIndex}-${imgIndex}-${src}`}
                    className="relative w-full aspect-[4/5] shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white/30 bg-slate-900/90 shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/15 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Soft Ambient Tint (Crystal clear photo view with high text legibility) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/35 via-black/20 to-[#06040a]/45 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(6,4,10,0.45)_100%)] pointer-events-none" />

      {/* 3. Soft Rose & Purple Romantic Ambient Glow Rays */}
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] rounded-full bg-roseGlow-600/15 blur-[130px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[450px] h-[450px] rounded-full bg-purple-600/15 blur-[130px] pointer-events-none animate-pulse-slow" />
    </div>
  );
};
