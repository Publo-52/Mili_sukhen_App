'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Code2,
  Sparkles,
  Heart,
  Copy,
  Check,
  Play,
  RotateCcw,
  Terminal,
  Layers,
  Calendar,
  FileCode,
  Share2,
} from 'lucide-react';
import { TurtleCreation } from '@/types';
import { TurtleCanvasViewer } from './TurtleCanvasViewer';
import { formatDate } from '@/lib/utils';

interface FullscreenLightboxProps {
  creation: TurtleCreation | null;
  onClose: () => void;
}

type TabType = 'canvas' | 'code' | 'story';

export const FullscreenLightbox: React.FC<FullscreenLightboxProps> = ({
  creation,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('canvas');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (creation) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [creation]);

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!creation || !mounted) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(creation.pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const lineCount = creation.pythonScript ? creation.pythonScript.split('\n').length : 0;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-2xl overflow-y-auto">
        {/* Backdrop click to dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Studio Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[#0c0817] border border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-10 select-none my-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#120c22]/90 backdrop-blur-md shrink-0">
            {/* Title & Metadata */}
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-roseGlow-600 to-purple-600 flex items-center justify-center text-white shadow-glow shrink-0">
                <Terminal className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    {creation.title}
                  </h3>
                  <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-300">
                    {creation.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>Created {formatDate(creation.createdAt)}</span>
                </p>
              </div>
            </div>

            {/* Segmented Control & Close */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Tab Switcher */}
              <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-full p-1">
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'canvas'
                      ? 'bg-roseGlow-600 text-white font-bold shadow-glow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>Live Canvas</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'code'
                      ? 'bg-purple-600 text-white font-bold shadow-glow-violet'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Source Code</span>
                </button>

                <button
                  onClick={() => setActiveTab('story')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'story'
                      ? 'bg-pink-600 text-white font-bold shadow-glow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Heart className="w-3 h-3" />
                  <span>Story</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all active:scale-95"
                title="Close (Esc)"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="sm:hidden flex items-center justify-around bg-[#0e091b] border-b border-white/10 px-2 py-1.5">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 py-1.5 text-center text-xs font-mono rounded-lg transition-all ${
                activeTab === 'canvas'
                  ? 'bg-roseGlow-600/30 text-roseGlow-300 font-bold border border-roseGlow-500/40'
                  : 'text-slate-400'
              }`}
            >
              Live Canvas
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-1.5 text-center text-xs font-mono rounded-lg transition-all ${
                activeTab === 'code'
                  ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40'
                  : 'text-slate-400'
              }`}
            >
              Python Code
            </button>
            <button
              onClick={() => setActiveTab('story')}
              className={`flex-1 py-1.5 text-center text-xs font-mono rounded-lg transition-all ${
                activeTab === 'story'
                  ? 'bg-pink-600/30 text-pink-300 font-bold border border-pink-500/40'
                  : 'text-slate-400'
              }`}
            >
              Story
            </button>
          </div>

          {/* Body Content */}
          <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-130px)] space-y-4">
            {/* 1. Live Canvas Tab */}
            {activeTab === 'canvas' && (
              <div className="space-y-4">
                <TurtleCanvasViewer creation={creation} />

                {/* Inspiration snippet under canvas */}
                {creation.inspiration && (
                  <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-roseGlow-500/10 text-roseGlow-400 shrink-0 mt-0.5">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono uppercase text-roseGlow-300 tracking-wider font-bold">
                        Story & Inspiration
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                        {creation.inspiration}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tech specifications footer */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 flex-wrap gap-2 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Exact Mathematical Virtual Machine (60 FPS)</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-roseGlow-400 hover:text-roseGlow-300 underline transition-colors"
                  >
                    View Python Source ({lineCount} lines) →
                  </button>
                </div>
              </div>
            )}

            {/* 2. Python Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                {/* Code Header Bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Python 3.x • turtle, math, colorsys</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">{lineCount} lines</span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-semibold shadow-glow transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                  </button>
                </div>

                {/* Syntax Code Block */}
                <div className="relative rounded-2xl bg-[#080511] p-4 sm:p-5 border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[50vh] scrollbar-thin">
                  <pre className="text-emerald-400 font-mono">
                    <code>{creation.pythonScript}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* 3. Story & Inspiration Tab */}
            {activeTab === 'story' && (
              <div className="space-y-4 max-w-2xl mx-auto py-2">
                <div className="p-6 rounded-3xl bg-gradient-to-b from-roseGlow-950/40 via-purple-950/20 to-transparent border border-roseGlow-500/20 space-y-4 text-left">
                  <div className="flex items-center gap-2 text-roseGlow-400 font-mono text-xs uppercase tracking-wider">
                    <Heart className="w-4 h-4 fill-roseGlow-500" />
                    <span>Dedicated to Sharmili (Mili)</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif text-white font-bold tracking-tight">
                    {creation.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-200 font-light leading-relaxed">
                    {creation.description || creation.inspiration || 'A custom mathematical Python Turtle artwork created with pure love and dedicated to you.'}
                  </p>

                  {creation.inspiration && creation.description && (
                    <div className="pt-2 border-t border-white/10">
                      <h5 className="text-xs font-mono uppercase text-slate-400 mb-1">Behind The Code</h5>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                        {creation.inspiration}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {creation.tags && creation.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-2">
                      {creation.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
