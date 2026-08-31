'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Shuffle, ArrowLeft, ArrowRight, Maximize2, BookOpen, Lock } from 'lucide-react';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';
import { LoveNote } from '@/types';
import { getFavoriteNoteIds, toggleFavoriteNote } from '@/lib/storage';
import { NoteReaderModal } from './NoteReaderModal';

export const LoveNotesVault: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [readingNote, setReadingNote] = useState<LoveNote | null>(null);

  useEffect(() => {
    setFavoriteIds(getFavoriteNoteIds());
  }, []);

  const currentNote = INITIAL_LOVE_NOTES[currentIndex];
  const isFavorite = favoriteIds.includes(currentNote.id);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % INITIAL_LOVE_NOTES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + INITIAL_LOVE_NOTES.length) % INITIAL_LOVE_NOTES.length);
  };

  const handleRandom = () => {
    let nextIdx = Math.floor(Math.random() * INITIAL_LOVE_NOTES.length);
    if (nextIdx === currentIndex && INITIAL_LOVE_NOTES.length > 1) {
      nextIdx = (nextIdx + 1) % INITIAL_LOVE_NOTES.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleToggleFavorite = () => {
    const updated = toggleFavoriteNote(currentNote.id);
    setFavoriteIds(updated);
  };

  return (
    <section id="love-notes" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono tracking-widest uppercase">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Private Love Notes Vault</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Letters & Notes for Mili
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light">
          Words written on quiet nights and ordinary mornings. A personal collection of thoughts, promises, and reasons why you mean everything.
        </p>
      </div>

      {/* Main Love Note Carousel Card */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNote.id}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl p-6 sm:p-10 border border-roseGlow-500/20 shadow-2xl relative overflow-hidden space-y-6"
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-roseGlow-300 border border-white/5">
                  Note #{currentIndex + 1} of {INITIAL_LOVE_NOTES.length}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
                  • {currentNote.date}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-all ${
                    isFavorite
                      ? 'bg-roseGlow-600 text-white shadow-glow'
                      : 'glass-card text-slate-400 hover:text-white'
                  }`}
                  aria-label={isFavorite ? "Remove favorite" : "Add to favorites"}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={() => setReadingNote(currentNote)}
                  className="p-2 rounded-full glass-card text-slate-300 hover:text-white transition-colors"
                  title="Fullscreen reading mode"
                  aria-label="Fullscreen reading mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Title & Preview */}
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {currentNote.title}
              </h3>
              <p className="text-slate-300 font-serif text-lg sm:text-xl leading-relaxed italic border-l-2 border-roseGlow-500 pl-4 py-1">
                “{currentNote.snippet}”
              </p>
            </div>

            {/* Read Full Note Button */}
            <div className="pt-2">
              <button
                onClick={() => setReadingNote(currentNote)}
                className="inline-flex items-center gap-2 text-sm font-mono text-roseGlow-400 hover:text-roseGlow-300 transition-colors"
              >
                <span>Read Complete Letter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-300 hover:text-white transition-all active:scale-95"
              aria-label="Previous note"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-300 hover:text-white transition-all active:scale-95"
              aria-label="Next note"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleRandom}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-card hover:border-pink-500/40 text-xs font-mono text-slate-200 hover:text-white transition-all"
          >
            <Shuffle className="w-3.5 h-3.5 text-pink-400" />
            <span>Random Note</span>
          </button>
        </div>
      </div>

      {/* Reading Modal */}
      <NoteReaderModal
        note={readingNote}
        onClose={() => setReadingNote(null)}
      />
    </section>
  );
};
