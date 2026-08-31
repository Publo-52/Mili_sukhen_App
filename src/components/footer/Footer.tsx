'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Sparkles, Film, Shield, ArrowUp } from 'lucide-react';
import { APP_CONFIG } from '@/data/config';

interface FooterProps {
  onReplayIntro?: () => void;
  onOpenSurprise?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onReplayIntro, onOpenSurprise }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative border-t border-white/10 bg-obsidian-950/90 pt-6 pb-20 md:pb-8 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[350px] h-[100px] bg-roseGlow-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-3 relative z-10">
        {/* Compact Logo & Brand */}
        <div className="inline-flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 p-0.5 shadow-glow border border-white/20 overflow-hidden">
            <div className="w-full h-full rounded-[10px] bg-[#0c0817] flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Suksharmi Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-xl sm:text-2xl font-stylish text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300">
            Suksharmi
          </span>
          <span className="text-slate-500 text-xs font-mono">•</span>
          <span className="text-xs text-slate-300 font-sans">
            Made with <span className="text-roseGlow-500">❤️</span> for {APP_CONFIG.recipientName}
          </span>
        </div>

        {/* Action Controls in Single Compact Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-slate-400 font-mono">
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
            >
              <Film className="w-3 h-3 text-roseGlow-400" />
              <span>Replay Intro</span>
            </button>
          )}

          {onOpenSurprise && (
            <button
              onClick={onOpenSurprise}
              className="inline-flex items-center gap-1 hover:text-roseGlow-300 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Surprise</span>
            </button>
          )}

          <Link
            href="/admin"
            className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <Shield className="w-3 h-3 text-slate-400" />
            <span>Admin</span>
          </Link>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 hover:text-slate-200 transition-colors"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Top</span>
          </button>
        </div>

        {/* Minimal Copyright */}
        <p className="pt-2 border-t border-white/5 text-[10px] sm:text-[11px] font-mono text-slate-500">
          © {currentYear} Suksharmi • Designed & Built with Love by Sukhen for Mili
        </p>
      </div>
    </footer>
  );
};
