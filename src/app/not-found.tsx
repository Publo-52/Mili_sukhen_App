import React from 'react';
import Link from 'next/link';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-roseGlow-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-400 flex items-center justify-center mx-auto shadow-glow">
          <Heart className="w-8 h-8 fill-roseGlow-500/30 animate-pulse text-roseGlow-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
            Error 404 • Lost in the Cosmos
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Oops… this memory doesn&apos;t exist yet. <span className="text-roseGlow-500">❤️</span>
          </h1>
          <p className="text-sm text-slate-400 font-light max-w-sm mx-auto">
            Perhaps it’s a memory we haven’t made yet, or an old path in the stardust.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white font-medium text-sm shadow-glow transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Take Me Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
