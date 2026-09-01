'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, BookOpen, Save, AlertCircle, Wand2, Feather, Check } from 'lucide-react';
import { LoveNote } from '@/types';

interface LoveNoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: LoveNote) => void;
  editingNote?: LoveNote | null;
}

const MOOD_OPTIONS = [
  { id: 'deep', label: '❤️ Deep & Emotional', color: 'border-roseGlow-500 text-roseGlow-300' },
  { id: 'poetic', label: '✨ Poetic & Romantic', color: 'border-purple-500 text-purple-300' },
  { id: 'playful', label: '😄 Playful & Sweet', color: 'border-amber-500 text-amber-300' },
  { id: 'promise', label: '💍 Forever Promise', color: 'border-pink-500 text-pink-300' },
  { id: 'gentle', label: '☕ Gentle Pocket Hug', color: 'border-emerald-500 text-emerald-300' },
  { id: 'future', label: '🚀 Future Dreams', color: 'border-blue-500 text-blue-300' },
];

const TEMPLATE_PRESETS = [
  {
    label: '✨ Forever Promise',
    title: 'A Lifetime Promise to My Mili',
    date: 'An everlasting vow',
    moodTag: 'promise',
    snippet: 'Through every high and low, my love for you remains unshakable...',
    fullMessage: `Dearest Mili,\n\nI promise to love you on quiet mornings and busy afternoons. I promise to be your refuge when the world gets loud, and your biggest supporter when you fly towards your dreams.\n\nYou are my home, today and forever.\n\nWith all my heart,\nSukhen ❤️`,
  },
  {
    label: '☕ Gentle Hug',
    title: 'A Pocket Hug When You Feel Tired',
    date: 'A warm reminder',
    moodTag: 'gentle',
    snippet: 'Close your eyes and breathe. You are cherished beyond measure...',
    fullMessage: `My Sweetheart,\n\nTake a moment just for yourself. You give so much warmth to the world, and you deserve every ounce of softness in return.\n\nI am always thinking of you and sending you the warmest hug.\n\nForever loving you,\nSukhen ❤️`,
  },
  {
    label: '🌌 Starlight Letter',
    title: 'Under the Same Night Sky',
    date: 'Midnight musings',
    moodTag: 'poetic',
    snippet: 'No matter the distance, we are always connected under the same stars...',
    fullMessage: `My Dearest Sharmili,\n\nWhenever I gaze up at the night sky, every star seems to whisper your name. Meeting you transformed my life into poetry.\n\nThank you for being my brightest constellation.\n\nYours always,\nSukhen ❤️`,
  },
];

export const LoveNoteEditorModal: React.FC<LoveNoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNote,
}) => {
  const [title, setTitle] = useState('');
  const [snippet, setSnippet] = useState('');
  const [fullMessage, setFullMessage] = useState('');
  const [date, setDate] = useState('');
  const [moodTag, setMoodTag] = useState<LoveNote['moodTag']>('deep');
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setSnippet(editingNote.snippet);
      setFullMessage(editingNote.fullMessage);
      setDate(editingNote.date);
      setMoodTag(editingNote.moodTag || 'deep');
      setIsFavorite(editingNote.isFavorite || false);
    } else {
      setTitle('');
      setSnippet('');
      setFullMessage('');
      setDate('A heartfelt reminder');
      setMoodTag('deep');
      setIsFavorite(true);
    }
    setErrorMsg(null);
  }, [editingNote, isOpen]);

  const applyTemplate = (tmpl: typeof TEMPLATE_PRESETS[0]) => {
    setTitle(tmpl.title);
    setSnippet(tmpl.snippet);
    setFullMessage(tmpl.fullMessage);
    setDate(tmpl.date);
    setMoodTag(tmpl.moodTag as LoveNote['moodTag']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a note title.');
      return;
    }
    if (!fullMessage.trim()) {
      setErrorMsg('Please write your love message for Mili.');
      return;
    }

    const noteToSave: LoveNote = {
      id: editingNote?.id || `note-${Date.now()}`,
      title: title.trim(),
      snippet: snippet.trim() || fullMessage.trim().slice(0, 85) + '...',
      fullMessage: fullMessage.trim(),
      date: date.trim() || 'A heartfelt reminder',
      moodTag: moodTag || 'deep',
      isFavorite,
    };

    onSave(noteToSave);
    onClose();
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-[#06040a]/90 backdrop-blur-xl flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-10 sm:pt-6 pb-20 sm:pb-6 overflow-y-auto">
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#130b24] to-[#0a0614] rounded-3xl border border-roseGlow-500/30 shadow-2xl overflow-hidden z-[1000000] my-auto flex flex-col max-h-[85vh] sm:max-h-[88vh] text-slate-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-obsidian-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-roseGlow-500/20 border border-roseGlow-500/30 flex items-center justify-center text-roseGlow-300 shrink-0">
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{editingNote ? 'Edit Love Letter' : 'Write Love Letter for Mili'}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-roseGlow-500/20 text-roseGlow-300 border border-roseGlow-500/30">
                    Vault
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Letters are safely stored in real-time Supabase cloud vault
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Templates */}
          <div className="px-4 sm:px-6 py-2.5 border-b border-white/5 bg-black/20 flex items-center gap-2 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-roseGlow-400" />
              <span>Inspirations:</span>
            </span>
            {TEMPLATE_PRESETS.map((tmpl) => (
              <button
                key={tmpl.label}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-roseGlow-500/20 border border-white/10 hover:border-roseGlow-500/40 text-slate-300 hover:text-roseGlow-300 transition-all flex-shrink-0"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-xs text-red-300 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Note Title */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Letter Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. To the Girl Who Makes Ordinary Days Feel Sacred"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
              />
            </div>

            {/* Date / Time Subtitle & Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">
                  Occasion / Subtitle
                </label>
                <input
                  type="text"
                  placeholder="e.g. A quiet morning reminder"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1.5">
                  Mood & Theme Tag
                </label>
                <select
                  value={moodTag}
                  onChange={(e) => setMoodTag(e.target.value as LoveNote['moodTag'])}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white focus:outline-none focus:border-roseGlow-500/50 cursor-pointer"
                >
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-obsidian-950 text-white">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quote Snippet */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Preview Highlight Snippet (Quote)
              </label>
              <input
                type="text"
                placeholder="e.g. You don't just exist in my world—you define its gravity..."
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
              />
            </div>

            {/* Full Heartfelt Message */}
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1.5">
                Full Love Letter / Message *
              </label>
              <textarea
                required
                rows={6}
                placeholder="Write your heartfelt words here for Mili..."
                value={fullMessage}
                onChange={(e) => setFullMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50 resize-none font-serif leading-relaxed"
              />
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded accent-roseGlow-500"
                />
                <span className="flex items-center gap-1.5 text-roseGlow-300">
                  <Heart className="w-3.5 h-3.5 fill-roseGlow-500 text-roseGlow-500" />
                  <span>Mark as Cherished Letter</span>
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-roseGlow-500 to-purple-600 hover:from-roseGlow-400 hover:to-purple-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save to Vault</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
