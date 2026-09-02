'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, HeartHandshake } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Client Exception caught by Next.js Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#06040a] text-slate-100 flex items-center justify-center p-4 sm:p-6 select-none selection:bg-roseGlow-500 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-roseGlow-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 glass-card p-6 sm:p-8 rounded-3xl border border-roseGlow-500/30 shadow-2xl backdrop-blur-2xl">
        {/* Heart Icon Emblem */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-roseGlow-600 to-purple-600 p-0.5 shadow-glow mx-auto flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-[#0c0817] flex items-center justify-center text-roseGlow-400">
            <HeartHandshake className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Restoring Your Sanctuary
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
            A small moment slipped away, but our digital universe is always safe. Let&apos;s restore the page for you.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={() => {
              try {
                sessionStorage.clear();
                localStorage.removeItem('mili_active_tab');
              } catch {}
              window.location.reload();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-semibold shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Page</span>
          </button>

          <Link
            href="/login"
            onClick={() => {
              try {
                sessionStorage.clear();
              } catch {}
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-200 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5 text-roseGlow-400" />
            <span>Open Login Page</span>
          </Link>
        </div>

        {error?.message && process.env.NODE_ENV === 'development' && (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-[11px] font-mono text-red-300 text-left overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
