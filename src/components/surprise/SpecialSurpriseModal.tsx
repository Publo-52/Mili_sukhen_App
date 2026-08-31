'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, KeyRound, Unlock, ArrowRight, Stars } from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '@/data/config';

interface SpecialSurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecialSurpriseModal: React.FC<SpecialSurpriseModalProps> = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcode.trim().toLowerCase();
    if (
      cleanInput === APP_CONFIG.surprisePasscode.toLowerCase() ||
      cleanInput === 'mili' ||
      cleanInput === '143' ||
      cleanInput === 'love'
    ) {
      setIsUnlocked(true);
      setError(false);
      // Trigger cinematic confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ff2d55', '#fb7185', '#fde047', '#c084fc'],
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setIsUnlocked(false);
    setPasscode('');
    setError(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-obsidian-950/90 backdrop-blur-2xl z-[99999]"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-2xl glass-card rounded-3xl overflow-hidden flex flex-col border border-roseGlow-500/30 shadow-2xl z-[100000] p-6 sm:p-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!isUnlocked ? (
            /* Passcode Verification Screen */
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 flex items-center justify-center mx-auto text-roseGlow-400 shadow-glow">
                <KeyRound className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  A Secret Surprise for Mili
                </h3>
                <p className="text-sm text-slate-300 font-light max-w-sm mx-auto">
                  Enter our special secret word or passcode to unlock what lies behind this door.
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  (Hint: Try &apos;forever&apos; or &apos;mili&apos;)
                </p>
              </div>

              <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret passcode"
                  className={`w-full px-4 py-3 rounded-2xl glass-card text-center text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-roseGlow-500 transition-all ${
                    error ? 'border-red-500 ring-2 ring-red-500 animate-shake' : 'border-white/10'
                  }`}
                  autoFocus
                />

                {error && (
                  <p className="text-xs text-rose-400 font-mono">
                    Incorrect secret phrase. Try &apos;forever&apos;
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white font-medium text-sm shadow-glow transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Surprise</span>
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked Cinematic Surprise Content */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 py-2"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-roseGlow-500/20 text-roseGlow-300 text-xs font-mono tracking-widest uppercase">
                  <Stars className="w-3.5 h-3.5" />
                  <span>Unconditional Love</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                  “Wait… there&apos;s one more thing.”
                </h3>
              </div>

              <div className="glass-card p-6 sm:p-8 rounded-2xl space-y-4 border border-roseGlow-500/30 bg-roseGlow-950/20">
                <p className="text-base sm:text-lg font-serif italic text-slate-200 leading-relaxed">
                  Mili, no matter how many projects I code, or how many designs I sketch, the greatest thing in my life will always be the simple reality of being with you.
                </p>
                <p className="text-base sm:text-lg font-serif italic text-slate-200 leading-relaxed">
                  Thank you for being my constant inspiration, my favorite conversation, and my home. Every line of code in this entire universe belongs to you.
                </p>
                <div className="pt-2 text-right">
                  <span className="text-sm font-serif font-bold text-roseGlow-400">
                    Forever and always yours, Sukhen
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-full glass-card hover:border-white/30 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-all"
                >
                  Close & Treasure This Memory
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
