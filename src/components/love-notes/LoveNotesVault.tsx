'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Shuffle,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  BookOpen,
  Play,
  Pause,
  Edit3,
  Trash2,
  Feather,
  LayoutGrid,
  Layers,
  Search,
  Quote,
  Clock,
} from 'lucide-react';
import { LoveNote } from '@/types';
import {
  getLoveNotes,
  saveLoveNote,
  deleteLoveNote,
  getFavoriteNoteIds,
  toggleFavoriteNote,
} from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { APP_CONFIG } from '@/data/config';

import { NoteReaderModal } from './NoteReaderModal';
import { LoveNoteEditorModal } from './LoveNoteEditorModal';
import { useModalHistory } from '@/lib/modal-history';

const MOOD_FILTERS = [
  { id: 'all', label: 'All Letters' },
  { id: 'deep', label: '❤️ Deep' },
  { id: 'poetic', label: '✨ Poetic' },
  { id: 'promise', label: '💍 Promises' },
  { id: 'playful', label: '😄 Playful' },
  { id: 'gentle', label: '☕ Gentle' },
  { id: 'future', label: '🚀 Future' },
];

import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';

export const LoveNotesVault: React.FC = () => {
  const [allNotes, setAllNotes] = useState<LoveNote[]>(INITIAL_LOVE_NOTES);
  const [selectedMood, setSelectedMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'featured' | 'grid'>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [readingNote, setReadingNote] = useState<LoveNote | null>(null);
  const [editingNote, setEditingNote] = useState<LoveNote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const { isAdmin } = useAuth();

  // Hook into browser history & back swipe for Love Note Reader
  useModalHistory(readingNote !== null, () => setReadingNote(null), 'note-reader');
  useModalHistory(isEditorOpen, () => setIsEditorOpen(false), 'note-editor');

  // Load notes from API / Supabase with local fallback
  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/love-notes', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.notes && Array.isArray(data.notes)) {
          setAllNotes(data.notes);
          try {
            localStorage.setItem('mili_universe_love_notes', JSON.stringify(data.notes));
          } catch {}
          return;
        }
      }
    } catch {}
    setAllNotes(getLoveNotes());
  }, []);

  useEffect(() => {
    loadNotes();
    setFavoriteIds(getFavoriteNoteIds());

    // 1. Supabase Realtime Subscription
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('love-notes-realtime-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'love_notes' },
            () => {
              loadNotes();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Love notes realtime error:', err);
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadNotes();
      }
    };
    const handleFocus = () => loadNotes();
    const handleSyncEvent = () => loadNotes();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mili-notes-updated', handleSyncEvent);
    };
  }, [loadNotes]);

  // Filter notes by mood & search query
  const filteredNotes = useMemo(() => {
    return allNotes.filter((n) => {
      const matchesMood = selectedMood === 'all' || n.moodTag === selectedMood;
      const matchesSearch =
        !searchQuery.trim() ||
        (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (n.fullMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (n.snippet?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesMood && matchesSearch;
    });
  }, [allNotes, selectedMood, searchQuery]);

  // Keep index within bounds
  useEffect(() => {
    if (currentIndex >= filteredNotes.length && filteredNotes.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredNotes.length, currentIndex]);

  // Auto-rotation timer for featured view
  useEffect(() => {
    if (
      !isAutoPlaying ||
      viewMode !== 'featured' ||
      readingNote !== null ||
      isEditorOpen ||
      filteredNotes.length <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % filteredNotes.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, viewMode, readingNote, isEditorOpen, filteredNotes.length]);

  const currentNote = filteredNotes[currentIndex] || allNotes[0] || {
    id: 'placeholder',
    title: 'A Love Letter for Mili',
    snippet: 'Every memory and thought is written for you...',
    fullMessage: 'Dearest Mili, you are the world to me. ❤️',
    date: 'Today',
    moodTag: 'deep',
    isFavorite: true,
  };

  const isCurrentFavorite = favoriteIds.includes(currentNote.id);

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

  const handleToggleFavorite = (noteId: string) => {
    const updated = toggleFavoriteNote(noteId);
    setFavoriteIds(updated);
  };

  const handleSaveNote = async (note: LoveNote) => {
    const updated = saveLoveNote(note);
    setAllNotes(updated);
    setIsEditorOpen(false);
    setEditingNote(null);

    try {
      await fetch('/api/love-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ note }),
      });
    } catch {}

    window.dispatchEvent(new Event('mili-notes-updated'));
    await loadNotes();
  };

  const handleDeleteNote = async (id: string) => {
    const updated = deleteLoveNote(id);
    setAllNotes(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }

    try {
      await fetch(`/api/love-notes?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
      });
    } catch {}

    window.dispatchEvent(new Event('mili-notes-updated'));
  };

  // Helper to get count per mood
  const getMoodCount = (moodId: string) => {
    if (moodId === 'all') return allNotes.length;
    return allNotes.filter((n) => n.moodTag === moodId).length;
  };

  return (
    <section
      id="love-notes"
      className="pt-4 pb-12 px-3 sm:px-6 lg:px-8 max-w-5xl mx-auto relative select-none sm:select-auto"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-roseGlow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Area */}
      <div className="text-center space-y-3 mb-6 sm:mb-8 relative z-10">
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-300 text-xs font-mono tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-roseGlow-400" />
            <span>Private Love Letters Vault</span>
          </div>

          {/* Admin Write Button */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingNote(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-roseGlow-500 to-purple-600 hover:from-roseGlow-400 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow hover:scale-105 transition-all"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>+ Write Note</span>
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white tracking-tight">
          Letters & Notes for Mili
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
          A dedicated space of {allNotes.length} heartfelt letters, promises, and quiet thoughts from Sukhen.
        </p>

        {/* View Switcher & Mood Filter Bar */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto">
          {/* Mood Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-1 sm:pb-0 px-1">
            {MOOD_FILTERS.map((m) => {
              const count = getMoodCount(m.id);
              if (count === 0 && m.id !== 'all') return null;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMood(m.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
                    selectedMood === m.id
                      ? 'bg-roseGlow-500 text-white shadow-glow font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/10'
                  }`}
                >
                  <span>{m.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedMood === m.id
                        ? 'bg-black/30 text-white'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle (Featured vs Grid) */}
          <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode('featured')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'featured'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Featured Letter View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Spotlight</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                viewMode === 'grid'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View of All Letters"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All ({filteredNotes.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── FEATURED SPOTLIGHT VIEW ─── */}
      {viewMode === 'featured' && (
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNote.id}
              initial={{ opacity: 0, x: direction * 25, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -25, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-gradient-to-b from-[#130b24]/90 to-[#0c0817]/95 rounded-3xl p-5 sm:p-9 border border-roseGlow-500/25 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-5"
            >
              {/* Subtle top gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-roseGlow-500/60 to-transparent" />

              {/* Top Bar inside Card */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-roseGlow-500/15 text-roseGlow-300 border border-roseGlow-500/30 font-medium">
                    Letter #{currentIndex + 1} of {filteredNotes.length}
                  </span>

                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{currentNote.date}</span>
                  </span>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Admin Edit & Delete */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 mr-1">
                      <button
                        onClick={() => {
                          setEditingNote(currentNote);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                        title="Edit Love Note"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(currentNote.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Love Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => handleToggleFavorite(currentNote.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isCurrentFavorite
                        ? 'bg-roseGlow-500/20 text-roseGlow-300 border-roseGlow-500/40 shadow-glow'
                        : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                    }`}
                    title={isCurrentFavorite ? 'Saved in Cherished' : 'Add to Cherished'}
                    aria-label="Toggle favorite"
                  >
                    <Heart
                      className={`w-4 h-4 ${isCurrentFavorite ? 'fill-roseGlow-400 text-roseGlow-400' : ''}`}
                    />
                  </button>

                  {/* Open Reading Modal */}
                  <button
                    onClick={() => setReadingNote(currentNote)}
                    className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 transition-all"
                    title="Fullscreen Reading Mode"
                    aria-label="Open reading mode"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Title & Quote */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight leading-snug">
                  {currentNote.title}
                </h3>

                {currentNote.snippet && (
                  <div className="relative p-4 rounded-2xl bg-roseGlow-500/10 border-l-4 border-roseGlow-500 text-roseGlow-200/90 font-serif italic text-base sm:text-lg leading-relaxed">
                    <Quote className="w-5 h-5 text-roseGlow-400/30 absolute top-3 right-3" />
                    <p>“{currentNote.snippet}”</p>
                  </div>
                )}

                {/* Brief Message Sneak Peek */}
                <p className="text-slate-300 font-serif text-sm sm:text-base leading-relaxed line-clamp-3 opacity-90">
                  {currentNote.fullMessage}
                </p>
              </div>

              {/* Bottom Card Bar: Read Full Note & Auto-play indicator */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setReadingNote(currentNote)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-roseGlow-500/20 to-purple-500/20 hover:from-roseGlow-500/30 hover:to-purple-500/30 border border-roseGlow-500/30 text-roseGlow-300 text-xs sm:text-sm font-medium transition-all group shadow-sm"
                >
                  <span>Read Full Letter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-roseGlow-400" />
                </button>

                {/* Auto-Play Toggle */}
                {filteredNotes.length > 1 && (
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  >
                    {isAutoPlaying ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px]">Auto-Playing</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3 h-3 text-amber-400" />
                        <span className="text-[11px]">Paused</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls Bar below card */}
          <div className="flex items-center justify-between pt-5 gap-3">
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={filteredNotes.length <= 1}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-roseGlow-500/40 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                title="Previous Letter"
                aria-label="Previous Letter"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                disabled={filteredNotes.length <= 1}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-roseGlow-500/40 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-40"
                title="Next Letter"
                aria-label="Next Letter"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Dots Indicator */}
            {filteredNotes.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none px-2">
                {filteredNotes.slice(0, Math.min(filteredNotes.length, 10)).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectNote(i)}
                    aria-label={`Select Note ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === i
                        ? 'w-6 bg-gradient-to-r from-roseGlow-500 to-purple-500 shadow-glow'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Random Letter Button */}
            <button
              onClick={handleRandom}
              disabled={filteredNotes.length <= 1}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-500/40 text-xs font-mono text-slate-200 hover:text-white transition-all active:scale-95 disabled:opacity-40"
            >
              <Shuffle className="w-3.5 h-3.5 text-pink-400" />
              <span className="hidden sm:inline">Random Letter</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── GRID VIEW OF ALL LETTERS ─── */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          {/* Search Box in Grid View */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in love letters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
            />
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <Sparkles className="w-8 h-8 text-roseGlow-400 mx-auto" />
              <h4 className="text-base font-serif font-bold text-white">No letters found</h4>
              <p className="text-xs text-slate-400">
                Try searching for different words or select another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredNotes.map((note) => {
                const isFav = favoriteIds.includes(note.id);
                return (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-gradient-to-b from-[#130b24]/80 to-[#0c0817]/90 rounded-2xl p-5 border border-white/10 hover:border-roseGlow-500/40 transition-all flex flex-col justify-between group shadow-lg hover:shadow-glow/20"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-roseGlow-500/10 text-roseGlow-300 border border-roseGlow-500/20 text-[11px]">
                          {note.date || 'Romantic Note'}
                        </span>
                        <button
                          onClick={() => handleToggleFavorite(note.id)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${isFav ? 'fill-roseGlow-400 text-roseGlow-400' : ''}`}
                          />
                        </button>
                      </div>

                      <h4 className="text-lg font-serif font-bold text-white group-hover:text-roseGlow-200 transition-colors leading-snug line-clamp-2">
                        {note.title}
                      </h4>

                      <p className="text-slate-300 text-xs font-serif leading-relaxed line-clamp-3 opacity-80 italic">
                        “{note.snippet || note.fullMessage}”
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => setReadingNote(note)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-roseGlow-400 hover:text-roseGlow-300 transition-colors"
                      >
                        <span>Read Letter</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setIsEditorOpen(true);
                            }}
                            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-amber-300"
                            title="Edit"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Reading Modal */}
      <NoteReaderModal
        note={readingNote}
        allNotes={filteredNotes}
        onClose={() => setReadingNote(null)}
        onNavigate={(newNote) => setReadingNote(newNote)}
        isFavorite={readingNote ? favoriteIds.includes(readingNote.id) : false}
        onToggleFavorite={handleToggleFavorite}
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
