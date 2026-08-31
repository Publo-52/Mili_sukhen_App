'use client';

import React from 'react';
import Link from 'next/link';
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
        {/* Heart Logo Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-400 shadow-glow">
          <Heart className="w-6 h-6 fill-roseGlow-500/40 animate-pulse text-roseGlow-400" />
        </div>

        {/* Emotional Message */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold font-sans text-white tracking-tight">
            Made with <span className="text-roseGlow-500">❤️</span> for {APP_CONFIG.recipientName}
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
          <a href="#contact" className="hover:text-roseGlow-400 transition-colors">
            Contact
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
        <div className="pt-6 border-t border-white/5 text-[11px] font-mono text-slate-600">
          © {currentYear} Sukhen • Designed & Built Exclusively for Mili
        </div>
      </div>
    </footer>
  );
};
