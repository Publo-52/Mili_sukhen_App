'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Sparkles,
  BookOpen,
  Quote,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { LoveNote } from '@/types';

interface NoteReaderModalProps {
  note: LoveNote | null;
  allNotes?: LoveNote[];
  onClose: () => void;
  onNavigate?: (note: LoveNote) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (noteId: string) => void;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({
  note,
  allNotes = [],
  onClose,
  onNavigate,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  useEffect(() => {
    setMounted(true);
    if (note) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [note]);

  const currentIndex = allNotes.findIndex((n) => n.id === note?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allNotes.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev && onNavigate) {
      onNavigate(allNotes[currentIndex - 1]);
    }
  }, [hasPrev, onNavigate, allNotes, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onNavigate) {
      onNavigate(allNotes[currentIndex + 1]);
    }
  }, [hasNext, onNavigate, allNotes, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  const handleCopy = async () => {
    if (!note) return;
    try {
      const copyText = `💌 ${note.title}\n\n${note.fullMessage}\n\n— Forever & Always, Sukhen ❤️`;
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  if (!note || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-[#06040a]/90 backdrop-blur-xl flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-10 sm:pt-6 pb-20 sm:pb-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#130b24] to-[#0a0614] rounded-3xl border border-roseGlow-500/30 shadow-2xl z-[1000000] p-6 sm:p-10 my-auto flex flex-col max-h-[85vh] text-slate-200 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-roseGlow-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Actions Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-roseGlow-500/15 text-roseGlow-300 border border-roseGlow-500/30 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-roseGlow-400" />
                <span>{note.date || 'A heartfelt note'}</span>
              </span>

              {note.moodTag && (
                <span className="text-xs text-roseGlow-300 font-mono px-2.5 py-0.5 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/20 capitalize flex items-center gap-1">
                  <span>{note.moodTag}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Copy Letter Button */}
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                title="Copy Letter text"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 text-[11px]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              {/* Toggle Font Size */}
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                title="Toggle Reading Font Size"
              >
                {fontSize === 'normal' ? 'A+' : 'A-'}
              </button>

              {/* Favorite Toggle */}
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(note.id)}
                  className={`p-2 rounded-xl transition-all ${
                    isFavorite
                      ? 'bg-roseGlow-500/20 text-roseGlow-300 border border-roseGlow-500/40'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                  title={isFavorite ? 'Saved in Cherished' : 'Add to Cherished'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-roseGlow-400 text-roseGlow-400' : ''}`} />
                </button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors ml-1"
                aria-label="Close reading mode"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Letter Scrollable Body */}
          <div className="overflow-y-auto py-6 pr-2 space-y-6 flex-1 select-text scrollbar-thin scrollbar-thumb-white/10">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-snug">
              {note.title}
            </h2>

            {/* Snippet Highlight Quote Box */}
            {note.snippet && (
              <div className="relative p-4 rounded-2xl bg-roseGlow-500/10 border-l-4 border-roseGlow-500 text-roseGlow-200/90 font-serif italic text-base sm:text-lg leading-relaxed">
                <Quote className="w-5 h-5 text-roseGlow-400/40 absolute top-3 right-3" />
                <p>“{note.snippet}”</p>
              </div>
            )}

            {/* Letter Full Message */}
            <div
              className={`space-y-4 text-slate-200 font-serif leading-relaxed whitespace-pre-line ${
                fontSize === 'large' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
              }`}
            >
              {note.fullMessage}
            </div>
          </div>

          {/* Footer Signature & Pagination */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between shrink-0 text-xs text-slate-400 font-mono">
            {/* Previous / Next Letter Navigation inside Reader */}
            <div className="flex items-center gap-1.5">
              {hasPrev && (
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous Letter</span>
                </button>
              )}
              {hasNext && (
                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">Next Letter</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sukhen Signature */}
            <div className="flex items-center gap-1.5 text-roseGlow-300 ml-auto">
              <Heart className="w-3.5 h-3.5 fill-roseGlow-400 text-roseGlow-400" />
              <span className="font-serif italic font-semibold">For Mili, With Love — Sukhen</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
