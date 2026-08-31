'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { addMessage } from '@/lib/storage';

type MoodType = '😊' | '🥹' | '❤️' | '😌' | '😡' | '😂';

const MOOD_OPTIONS: { emoji: MoodType; label: string }[] = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥹', label: 'Emotional' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😂', label: 'Funny' },
];

export const SendMessageForm: React.FC = () => {
  const [senderName, setSenderName] = useState('Mili');
  const [message, setMessage] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('❤️');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    // Save locally
    const newMsg = addMessage({
      sender: senderName.trim() || 'Mili',
      message: message.trim(),
      mood: selectedMood,
    });

    // Optionally post to API
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
    } catch {
      // Local storage is already resilient
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setMessage('');
    }, 600);
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-roseGlow-500/20 text-roseGlow-400 flex items-center justify-center shadow-glow">
          <Heart className="w-5 h-5 fill-roseGlow-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Send Me a Message</h3>
          <p className="text-xs text-slate-400 font-mono">
            Directly delivered to Sukhen&apos;s personal inbox
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 text-center space-y-4 bg-roseGlow-500/10 rounded-2xl border border-roseGlow-500/20"
          >
            <div className="w-12 h-12 rounded-full bg-roseGlow-500 text-white mx-auto flex items-center justify-center shadow-glow">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Message Sent</h4>
              <p className="text-sm text-slate-300 font-light">
                Thank you, my love! Your message has been safely saved in my heart and inbox.
              </p>
            </div>
            <button
              onClick={() => setIsSuccess(false)}
              className="text-xs text-roseGlow-400 hover:text-white underline font-mono pt-2"
            >
              Send another note
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sender Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Mili"
                className="w-full px-4 py-3 rounded-2xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/60 transition-all border border-white/10"
              />
            </div>

            {/* Mood Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
                Current Mood
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOOD_OPTIONS.map((m) => {
                  const isSelected = selectedMood === m.emoji;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m.emoji)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all ${
                        isSelected
                          ? 'bg-roseGlow-600/30 border border-roseGlow-500 text-white shadow-glow scale-105'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl mb-1">{m.emoji}</span>
                      <span className="text-[10px] font-mono">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
                Your Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write whatever is on your mind today..."
                required
                className="w-full px-4 py-3 rounded-2xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/60 transition-all border border-white/10 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white font-medium text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending to Sukhen…' : 'Send Message'}</span>
            </button>

          </form>
        )}
      </AnimatePresence>
    </div>
  );
};
