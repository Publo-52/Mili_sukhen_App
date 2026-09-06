'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Heart, RotateCcw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error safely without crashing or exposing sensitive internal details
    console.error('Captured by Root Error Boundary:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#06040a] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.3)]">
          <Heart className="w-8 h-8 fill-rose-500/30 animate-pulse text-rose-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
            A Momentary Pause in the Cosmos
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Something went momentarily quiet <span className="text-rose-500">✨</span>
          </h1>
          <p className="text-sm text-slate-400 font-light max-w-sm mx-auto">
            Don&apos;t worry, your memories and love notes are completely safe. Let&apos;s gently reconnect.
          </p>
        </div>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Go to Sanctuary</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
