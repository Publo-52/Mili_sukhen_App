'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Home, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <main className="min-h-screen bg-[#06040a] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute w-96 h-96 bg-roseGlow-600/15 rounded-full blur-[140px] pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -bottom-20 -right-20" />

      <div className="relative z-10 max-w-lg space-y-6 px-4">
        {/* Animated Heart Centerpiece */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-roseGlow-500/20 blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-400 flex items-center justify-center shadow-glow backdrop-blur-md">
            <Heart className="w-10 h-10 fill-roseGlow-500/40 animate-pulse text-roseGlow-400" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-roseGlow-300 font-mono text-xs uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-roseGlow-400 animate-spin" />
            <span>Error 404 • Lost in the Cosmos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Oops… this memory doesn&apos;t exist yet. <span className="text-roseGlow-500">❤️</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300/80 font-light max-w-md mx-auto leading-relaxed">
            Perhaps it’s a romantic memory we haven’t made yet, or an old path swept away by the stardust.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-sm transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white font-medium text-sm shadow-[0_0_25px_rgba(244,63,94,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Take Me Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
