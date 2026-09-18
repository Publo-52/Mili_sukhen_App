'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, RotateCcw, Home, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Captured by Root Error Boundary:', error?.message, error?.stack, error?.digest);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
        // Clear transient caches without deleting protected user data
        localStorage.removeItem('mili_admin_authenticated');
        localStorage.removeItem('mili_admin_logged_in');
        localStorage.removeItem('mili_active_tab');
        window.location.href = '/';
      }
    } catch {
      window.location.reload();
    }
  };

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
            Don&apos;t worry, your memories and love notes are completely safe.
          </p>
        </div>

        {/* Diagnostic info (if available) */}
        {error?.message && (
          <div className="text-left bg-obsidian-900/80 border border-white/10 rounded-xl p-3 text-xs text-rose-300/80 font-mono break-words max-h-32 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Diagnostic Details:</span>
            </div>
            <div>{error.message}</div>
            {error.digest && <div className="text-slate-500 text-[10px] mt-1">Digest: {error.digest}</div>}
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleClearCacheAndReload}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Sanctuary</span>
          </button>

          <button
            onClick={() => {
              try { reset(); } catch { window.location.reload(); }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-xs sm:text-sm transition-all hover:scale-105 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </main>
  );
}
