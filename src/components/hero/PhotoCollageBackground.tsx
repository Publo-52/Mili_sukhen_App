'use client';

import React, { useMemo } from 'react';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

export const PhotoCollageBackground: React.FC = () => {
  // Use a curated set of 20 photos for smooth, high-fps infinite vertical stream without memory bloating
  const photos = useMemo(() => {
    if (INTRO_COLLAGE_PHOTOS.length <= 20) return INTRO_COLLAGE_PHOTOS;
    // Pick evenly distributed photos
    const step = Math.floor(INTRO_COLLAGE_PHOTOS.length / 20) || 1;
    return INTRO_COLLAGE_PHOTOS.filter((_, i) => i % step === 0).slice(0, 20);
  }, []);

  // Group photos across 4 multi-stream columns
  const columnsCount = 4;
  const columns: string[][] = Array.from({ length: columnsCount }, () => []);
  photos.forEach((photo, i) => {
    columns[i % columnsCount].push(photo);
  });

  // Speeds in seconds for each column
  const columnDurations = [42, 50, 38, 46];

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
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
      `}</style>

      {/* 1. Fully-Contained & Border-Framed Pure GPU Infinite Scrolling Photo Stream */}
      <div className="absolute inset-0 px-2 sm:px-4 md:px-6 py-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 opacity-90">
        {columns.map((colPhotos, colIndex) => {
          const streamPhotos = [...colPhotos, ...colPhotos];
          const duration = columnDurations[colIndex % columnDurations.length];

          return (
            <div
              key={`col-stream-${colIndex}`}
              className="overflow-hidden relative h-[140vh]"
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
                    className="relative w-full aspect-[4/5] shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 bg-slate-900/90 shadow-md"
                    style={{
                      contentVisibility: 'auto',
                      containIntrinsicSize: '200px',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt="Sukhen & Mili Memory"
                      loading={imgIndex < 3 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="w-full h-full object-cover filter brightness-100 contrast-105 pointer-events-none select-none"
                    />
                    {/* Subtle glass sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Soft Ambient Tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06040a]/40 via-black/25 to-[#06040a]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(6,4,10,0.5)_100%)] pointer-events-none" />

      {/* 3. Soft Rose & Purple Romantic Ambient Glow Rays (GPU-Optimized Radial Gradients) */}
      <div
        className="absolute top-1/3 left-1/3 w-[320px] h-[320px] rounded-full pointer-events-none animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/3 w-[320px] h-[320px] rounded-full pointer-events-none animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
