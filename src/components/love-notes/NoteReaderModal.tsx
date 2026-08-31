'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, BookOpen, Quote } from 'lucide-react';
import { LoveNote } from '@/types';

interface NoteReaderModalProps {
  note: LoveNote | null;
  onClose: () => void;
}

export const NoteReaderModal: React.FC<NoteReaderModalProps> = ({ note, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (note) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [note]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!note || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-[#06040a] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-12 sm:pt-6 pb-20 sm:pb-6 overflow-y-auto">
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] bg-[#0e091b] rounded-3xl overflow-hidden flex flex-col border border-roseGlow-500/20 shadow-2xl z-[1000000] p-6 sm:p-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close reading mode"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-roseGlow-400 text-xs font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{note.date}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {note.title}
            </h2>
          </div>

          {/* Reading body */}
          <div className="overflow-y-auto pr-2 space-y-4 text-slate-200 font-serif text-lg sm:text-xl leading-relaxed whitespace-pre-line select-text">
            {note.fullMessage}
          </div>

          {/* Footer signature */}
          <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1 text-roseGlow-400">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Forever & Always, Sukhen</span>
            </div>
            <span className="italic">For Mili ❤️</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
