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
  FileCode,
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
} from 'lucide-react';
import { TurtleCreation } from '@/types';
import { TurtleCanvasViewer } from './TurtleCanvasViewer';
import { formatDate } from '@/lib/utils';

interface FullscreenLightboxProps {
  creation: TurtleCreation | null;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (creation: TurtleCreation) => void;
  onDelete?: (id: string) => void;
}

type TabType = 'canvas' | 'code' | 'story';

export const FullscreenLightbox: React.FC<FullscreenLightboxProps> = ({
  creation,
  onClose,
  isAdmin = false,
  onEdit,
  onDelete,
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
      <div className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
        {/* Backdrop click to dismiss */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Studio Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-[#0c0817] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col z-10 select-none"
        >
          {/* Top Header Card */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#120c22]/90 shrink-0 space-y-3">
            {/* Row 1: Category Badge & Actions */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>{creation.category || 'Python Generative Art'}</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Admin Actions in Lightbox Header */}
                {isAdmin && (
                  <>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(creation)}
                        className="px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Edit Creation"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(creation.id)}
                        className="px-2.5 py-1 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Delete Creation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer ml-1"
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Artwork Title & Date */}
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug break-words">
                {creation.title}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Created {formatDate(creation.createdAt)}</span>
              </p>
            </div>

            {/* Row 3: Full-Width Segmented Tab Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.06] border border-white/10">
              <button
                onClick={() => setActiveTab('canvas')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'canvas'
                    ? 'bg-roseGlow-600 text-white shadow-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Live Canvas</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'code'
                    ? 'bg-purple-600 text-white shadow-glow-violet font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Source Code</span>
              </button>

              <button
                onClick={() => setActiveTab('story')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'story'
                    ? 'bg-pink-600 text-white shadow-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Story</span>
              </button>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="p-3 sm:p-5 overflow-y-auto max-h-[calc(88vh-180px)] space-y-4">
            {/* 1. Live Canvas View */}
            {activeTab === 'canvas' && (
              <div className="space-y-3.5">
                <TurtleCanvasViewer creation={creation} />

                {/* Story & Inspiration Note */}
                {creation.inspiration && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-roseGlow-500/10 text-roseGlow-400 shrink-0 mt-0.5">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-mono uppercase text-roseGlow-300 tracking-wider font-bold">
                        Behind The Artwork
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                        {creation.inspiration}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Python Code View */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                {/* Code Header Bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Python 3.x • turtle, math</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-400">{lineCount} lines</span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-semibold shadow-glow transition-all active:scale-95 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>

                {/* Syntax Code Block */}
                <div className="rounded-2xl bg-[#080511] p-4 sm:p-5 border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[50vh] scrollbar-thin">
                  <pre className="text-emerald-400 font-mono">
                    <code>{creation.pythonScript}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* 3. Story & Inspiration View */}
            {activeTab === 'story' && (
              <div className="space-y-4 max-w-xl mx-auto py-2">
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-roseGlow-950/40 via-purple-950/20 to-transparent border border-roseGlow-500/20 space-y-4 text-left">
                  <div className="flex items-center gap-2 text-roseGlow-400 font-mono text-xs uppercase tracking-wider">
                    <Heart className="w-4 h-4 fill-roseGlow-500" />
                    <span>Dedicated to Sharmili (Mili)</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif text-white font-bold tracking-tight">
                    {creation.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                    {creation.description || creation.inspiration || 'A custom mathematical Python Turtle artwork created with pure love and dedicated to you.'}
                  </p>

                  {creation.inspiration && creation.description && (
                    <div className="pt-3 border-t border-white/10">
                      <h5 className="text-xs font-mono uppercase text-slate-400 mb-1">Inspiration & Story</h5>
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
