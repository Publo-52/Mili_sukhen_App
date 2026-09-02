'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Unlock, Stars } from 'lucide-react';
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
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = passcode.trim().toLowerCase();
    if (
      cleanInput === 'forever' ||
      cleanInput === APP_CONFIG.surprisePasscode.toLowerCase() ||
      cleanInput === 'mili'
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
      <div className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg sm:max-w-xl bg-[#0e091b] rounded-3xl border border-roseGlow-500/30 shadow-2xl p-5 sm:p-8 max-h-[90vh] overflow-y-auto my-auto space-y-4"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {!isUnlocked ? (
            /* Passcode Verification Screen */
            <div className="text-center space-y-5 py-2">
              <div className="w-14 h-14 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 flex items-center justify-center mx-auto text-roseGlow-400 shadow-glow">
                <KeyRound className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  A Secret Surprise for Mili
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light max-w-sm mx-auto">
                  Enter our special secret word or passcode to unlock what lies behind this door.
                </p>
                <p className="text-[12px] text-roseGlow-300 font-mono pt-1">
                  Hint: forever
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
                    Incorrect secret passcode. Hint: forever
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white font-medium text-sm shadow-glow transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Surprise</span>
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked Cinematic Surprise Content (Full View, No Cutoff) */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4 sm:space-y-5 py-1"
            >
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-roseGlow-500/20 text-roseGlow-300 text-xs font-mono tracking-widest uppercase">
                  <Stars className="w-3.5 h-3.5 text-roseGlow-400" />
                  <span>Unconditional Love</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  “Wait… there&apos;s one more thing.”
                </h3>
              </div>

              <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-3.5 border border-roseGlow-500/30 bg-roseGlow-950/20 text-slate-200">
                <p className="text-sm sm:text-base font-serif italic leading-relaxed">
                  Mili, no matter how many projects I code, or how many designs I sketch, the greatest thing in my life will always be the simple reality of being with you.
                </p>
                <p className="text-sm sm:text-base font-serif italic leading-relaxed">
                  Thank you for being my constant inspiration, my favorite conversation, and my home. Every line of code in this entire universe belongs to you.
                </p>
                <div className="pt-2 text-right border-t border-white/5">
                  <span className="text-sm font-serif font-bold text-roseGlow-400">
                    Forever and always yours, Sukhen ❤️
                  </span>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-roseGlow-600 hover:bg-roseGlow-500 text-white text-xs font-mono uppercase tracking-wider shadow-glow transition-all active:scale-95 cursor-pointer"
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
