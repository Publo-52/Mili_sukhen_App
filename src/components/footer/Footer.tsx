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
    <footer className="relative border-t border-white/10 bg-obsidian-950 pt-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-roseGlow-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Logo & Brand */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 p-0.5 shadow-glow-lg border border-white/20 overflow-hidden group">
            <div className="w-full h-full rounded-[22px] bg-[#0c0817] flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Suksharmi Logo"
                width={64}
                height={64}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
          <span className="text-3xl sm:text-4xl font-stylish text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
            Suksharmi
          </span>
        </div>

        {/* Emotional Message */}
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
            A Digital Universe Made with <span className="text-roseGlow-500">❤️</span> for {APP_CONFIG.recipientName}
          </h3>
          <p className="text-sm sm:text-base font-serif italic text-roseGlow-200/80 max-w-md mx-auto">
            “Every project here started with a single thought of you.”
          </p>
        </div>

        {/* Quick Footer Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono uppercase tracking-wider text-slate-400">
          <a href="#hero" className="hover:text-roseGlow-400 transition-colors">
            Home
          </a>
          <a href="#projects" className="hover:text-roseGlow-400 transition-colors">
            Projects
          </a>
          <a href="#python-art" className="hover:text-roseGlow-400 transition-colors">
            Python Art
          </a>
          <a href="#memories" className="hover:text-roseGlow-400 transition-colors">
            Memories
          </a>
          <a href="#love-notes" className="hover:text-roseGlow-400 transition-colors">
            Love Notes
          </a>
        </div>

        {/* Interactive Controls */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-mono">
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
            >
              <Film className="w-3.5 h-3.5" />
              <span>Replay Intro</span>
            </button>
          )}

          {onOpenSurprise && (
            <button
              onClick={onOpenSurprise}
              className="inline-flex items-center gap-1.5 hover:text-roseGlow-400 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Special Surprise</span>
            </button>
          )}

          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Copyright & Signoff */}
        <div className="pt-6 border-t border-white/5 text-[11px] font-mono text-slate-500">
          © {currentYear} Suksharmi • Designed & Built with All My Love by Sukhen for Mili
        </div>
      </div>
    </footer>
  );
};
