'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Shuffle, ArrowLeft, ArrowRight, Maximize2, BookOpen, Play, Pause, Plus, Edit3, Trash2, Feather } from 'lucide-react';
import { LoveNote } from '@/types';
import { getLoveNotes, saveLoveNote, deleteLoveNote, getFavoriteNoteIds, toggleFavoriteNote } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { NoteReaderModal } from './NoteReaderModal';
import { LoveNoteEditorModal } from './LoveNoteEditorModal';

const MOOD_FILTERS = [
  { id: 'all', label: 'All Letters' },
  { id: 'deep', label: '❤️ Deep' },
  { id: 'poetic', label: '✨ Poetic' },
  { id: 'promise', label: '💍 Promises' },
  { id: 'playful', label: '😄 Playful' },
  { id: 'gentle', label: '☕ Gentle' },
  { id: 'future', label: '🚀 Future' },
];

export const LoveNotesVault: React.FC = () => {
  const [allNotes, setAllNotes] = useState<LoveNote[]>([]);
  const [selectedMood, setSelectedMood] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [readingNote, setReadingNote] = useState<LoveNote | null>(null);
  const [editingNote, setEditingNote] = useState<LoveNote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const { isAdmin } = useAuth();

  // Load unlimited notes from storage
  const loadNotes = () => {
    const loaded = getLoveNotes();
    setAllNotes(loaded);
  };

  useEffect(() => {
    loadNotes();
    setFavoriteIds(getFavoriteNoteIds());
  }, []);

  // Filter notes by mood
  const filteredNotes = useMemo(() => {
    if (selectedMood === 'all') return allNotes;
    return allNotes.filter((n) => n.moodTag === selectedMood);
  }, [allNotes, selectedMood]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredNotes.length && filteredNotes.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredNotes.length, currentIndex]);

  // Auto-rotation timer: switches automatically every 5.5 seconds
  useEffect(() => {
    if (!isAutoPlaying || readingNote !== null || isEditorOpen || filteredNotes.length <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % filteredNotes.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [isAutoPlaying, readingNote, isEditorOpen, filteredNotes.length]);

  const currentNote = filteredNotes[currentIndex] || allNotes[0] || {
    id: 'placeholder',
    title: 'A Love Letter for Mili',
    snippet: 'Every memory and thought is written for you...',
    fullMessage: 'Dearest Mili, you are the world to me. ❤️',
    date: 'Today',
    moodTag: 'deep',
    isFavorite: true,
  };

  const isFavorite = favoriteIds.includes(currentNote.id);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % filteredNotes.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + filteredNotes.length) % filteredNotes.length);
  };

  const handleSelectNote = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleRandom = () => {
    if (filteredNotes.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * filteredNotes.length);
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % filteredNotes.length;
    }
    setDirection(1);
    setCurrentIndex(nextIdx);
  };

  const handleToggleFavorite = () => {
    const updated = toggleFavoriteNote(currentNote.id);
    setFavoriteIds(updated);
  };

  const handleSaveNote = (note: LoveNote) => {
    const updated = saveLoveNote(note);
    setAllNotes(updated);
    setIsEditorOpen(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this love note?')) {
      const updated = deleteLoveNote(id);
      setAllNotes(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
    }
  };

  return (
    <section id="love-notes" className="py-14 sm:py-18 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto relative">
      {/* Header */}
      <div className="text-center space-y-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Private Love Notes Vault</span>
          </div>

          {/* Admin "+ Write Love Note" Button */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 hover:opacity-90 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow hover:scale-105 transition-all"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>+ Write Love Note</span>
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Letters & Notes for Mili
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          An unlimited collection of {allNotes.length} heartfelt letters, promises, and quiet thoughts from Sukhen.
        </p>

        {/* Mood Category Filter Tabs */}
        <div className="flex items-center justify-center gap-1.5 pt-2 overflow-x-auto no-scrollbar whitespace-nowrap max-w-full px-1">
          {MOOD_FILTERS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMood(m.id);
                setCurrentIndex(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex-shrink-0 ${
                selectedMood === m.id
                  ? 'bg-roseGlow-600 text-white shadow-glow font-bold'
                  : 'glass-card text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Dynamic Auto-Rotation Progress Bar */}
        {filteredNotes.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2 max-w-xs mx-auto">
            {filteredNotes.slice(0, Math.min(filteredNotes.length, 10)).map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectNote(idx)}
                aria-label={`Jump to Love Note ${idx + 1}`}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10 hover:bg-white/20 transition-all cursor-pointer relative"
              >
                {currentIndex === idx && (
                  <motion.div
                    key={`${idx}-${isAutoPlaying}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: isAutoPlaying ? 5.5 : 0.3, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-roseGlow-500 to-purple-500 shadow-glow"
                  />
                )}
                {currentIndex > idx && (
                  <div className="h-full w-full bg-roseGlow-500/70" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Auto-Rotating Love Note Card */}
      <div className="relative max-w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNote.id}
            initial={{ opacity: 0, x: direction * 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -20, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-roseGlow-500/30 shadow-2xl relative overflow-hidden space-y-4 sm:space-y-5"
          >
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-gradient-to-r from-roseGlow-500/20 to-purple-500/20 text-roseGlow-300 border border-roseGlow-500/30 font-bold">
                  Letter #{currentIndex + 1} of {filteredNotes.length}
                </span>

                {/* Auto Play Status Indicator */}
                {filteredNotes.length > 1 && (
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                    title={isAutoPlaying ? "Click to Pause Auto-Rotation" : "Click to Resume Auto-Rotation"}
                  >
                    {isAutoPlaying ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Auto-Playing ↻</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-2.5 h-2.5 text-amber-400" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>
                )}

                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
                  • {currentNote.date}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Admin Quick Edit & Delete */}
                {isAdmin && (
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 mr-1">
                    <button
                      onClick={() => {
                        setEditingNote(currentNote);
                        setIsEditorOpen(true);
                      }}
                      className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Edit Love Note"
                      aria-label="Edit Love Note"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(currentNote.id)}
                      className="p-1 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Love Note"
                      aria-label="Delete Love Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleToggleFavorite}
                  className={`p-1.5 sm:p-2 rounded-full transition-all ${
                    isFavorite
                      ? 'bg-roseGlow-600 text-white shadow-glow'
                      : 'glass-card text-slate-400 hover:text-white'
                  }`}
                  aria-label={isFavorite ? "Remove favorite" : "Add to favorites"}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-white' : ''}`} />
                </button>

                <button
                  onClick={() => setReadingNote(currentNote)}
                  className="p-1.5 sm:p-2 rounded-full glass-card text-slate-300 hover:text-white transition-colors"
                  title="Fullscreen reading mode"
                  aria-label="Fullscreen reading mode"
                >
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            {/* Note Title & Preview */}
            <div className="space-y-2.5">
              <h3 className="text-lg sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug">
                {currentNote.title}
              </h3>
              <p className="text-slate-300 font-serif text-sm sm:text-lg leading-relaxed italic border-l-2 border-roseGlow-500 pl-3 sm:pl-4 py-0.5">
                “{currentNote.snippet}”
              </p>
            </div>

            {/* Read Full Note Button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setReadingNote(currentNote)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-roseGlow-400 hover:text-roseGlow-300 transition-colors"
              >
                <span>Read Full Letter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Quick Dots Selector */}
              {filteredNotes.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {filteredNotes.slice(0, Math.min(filteredNotes.length, 7)).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectNote(i)}
                      aria-label={`Select Note ${i + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentIndex === i
                          ? 'w-5 bg-roseGlow-500 shadow-glow'
                          : 'bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-between pt-4 sm:pt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={filteredNotes.length <= 1}
              className="p-2.5 sm:p-3 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
              aria-label="Previous note"
              title="Previous Note"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={filteredNotes.length <= 1}
              className="p-2.5 sm:p-3 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
              aria-label="Next note"
              title="Next Note"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            {filteredNotes.length > 1 && (
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="p-2.5 sm:p-3 rounded-full glass-card hover:border-white/30 text-slate-300 hover:text-white transition-all active:scale-95"
                title={isAutoPlaying ? "Pause Auto-play" : "Resume Auto-play"}
              >
                {isAutoPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-current" />}
              </button>
            )}
          </div>

          <button
            onClick={handleRandom}
            disabled={filteredNotes.length <= 1}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card hover:border-pink-500/40 text-xs font-mono text-slate-200 hover:text-white transition-all active:scale-95 disabled:opacity-40"
          >
            <Shuffle className="w-3.5 h-3.5 text-pink-400" />
            <span>Random Letter</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Reading Modal */}
      <NoteReaderModal
        note={readingNote}
        onClose={() => setReadingNote(null)}
      />

      {/* Admin Write / Edit Love Note Modal */}
      <LoveNoteEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        editingNote={editingNote}
      />
    </section>
  );
};

