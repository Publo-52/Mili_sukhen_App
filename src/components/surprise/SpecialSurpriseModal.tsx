'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Unlock, Stars, Sparkles, Heart, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { APP_CONFIG } from '@/data/config';

interface SpecialSurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SECRET_SURPRISE_MESSAGES = [
  {
    tag: "My Greatest Treasure",
    title: "“Wait… there’s one more thing.”",
    p1: "Mili, no matter how many projects I code, or how many designs I sketch, the greatest thing in my life will always be the simple reality of being with you.",
    p2: "Thank you for being my constant inspiration, my favorite conversation, and my home. Every line of code in this entire universe belongs to you.",
    signoff: "Forever and always yours, Sukhen ❤️",
  },
  {
    tag: "My Whole Universe",
    title: "“My heart found its forever home in you.”",
    p1: "Sharmili, before you came into my life, I searched for meaning everywhere. Now, every sunrise, every quiet night, and every dream I have begins and ends with your smile.",
    p2: "You are not just my love—you are my guiding star, my safest place, and my entire world. I love you deeper with each passing day.",
    signoff: "Loving you with every heartbeat, Sukhen 💖",
  },
  {
    tag: "In Every Lifetime",
    title: "“I would choose you in every lifetime.”",
    p1: "If I was given a million lifetimes to live, I would spend every single one searching for you, falling for you, and holding your hand.",
    p2: "There is no one in this world who could ever match your sweetness, your warmth, and the beauty of your soul.",
    signoff: "Your devoted Sukhen 💍",
  },
  {
    tag: "Unbreakable Bond",
    title: "“Through every storm, your hand in mine.”",
    p1: "Life will have its seasons, but as long as I have you by my side, I fear nothing. Your laugh is my peace, your voice is my melody, and your happiness is my life's highest mission.",
    p2: "Whenever you need a shoulder, a hug, or a reminder of how cherished you are, I will always be right here.",
    signoff: "Always protecting & loving you, Sukhen ✨",
  },
  {
    tag: "Soulmate Promise",
    title: "“A promise written in the stars.”",
    p1: "I promise to celebrate you when the days are bright, and hold you even closer when the nights are cold. You will never have to face this world alone.",
    p2: "You are my queen, my dearest partner, and the biggest blessing the universe ever gave me.",
    signoff: "Forever your Sukhen 👑❤️",
  },
  {
    tag: "Infinite Love",
    title: "“Every beat of my heart belongs to you.”",
    p1: "This entire digital universe was built with love in every pixel. But no amount of code or art could ever truly capture how breathtaking and precious you are to me.",
    p2: "Thank you for being you, for your kindness, and for filling my life with pure magic.",
    signoff: "Infinite love for Sharmili, Sukhen 🌸",
  },
  {
    tag: "Pure Happiness",
    title: "“You make ordinary moments extraordinary.”",
    p1: "Just seeing you smile turns the heaviest day into pure joy. I fall in love with you a little more every single morning.",
    p2: "I will spend the rest of forever making sure you always feel loved, respected, and treasured.",
    signoff: "Forever & Always, Sukhen 🕊️",
  },
];

export const SpecialSurpriseModal: React.FC<SpecialSurpriseModalProps> = ({ isOpen, onClose }) => {
  const [passcode, setPasscode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

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
      // Pick a new message index dynamically on each unlock
      setMessageIndex((prev) => (prev + 1) % SECRET_SURPRISE_MESSAGES.length);
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

  const handleNextMessage = () => {
    setMessageIndex((prev) => (prev + 1) % SECRET_SURPRISE_MESSAGES.length);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff2d55', '#fb7185', '#fde047'],
      });
    } catch {}
  };

  const handleResetAndClose = () => {
    setIsUnlocked(false);
    setPasscode('');
    setError(false);
    onClose();
  };

  const currentMsg = SECRET_SURPRISE_MESSAGES[messageIndex];

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
            /* Unlocked Cinematic Surprise Content with Dynamic Multi-Message Engine */
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-4 sm:space-y-5 py-1"
            >
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-roseGlow-500/20 text-roseGlow-300 text-xs font-mono tracking-widest uppercase">
                  <Stars className="w-3.5 h-3.5 text-roseGlow-400" />
                  <span>{currentMsg.tag}</span>
                </div>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                  {currentMsg.title}
                </h3>
              </div>

              <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-3.5 border border-roseGlow-500/30 bg-roseGlow-950/20 text-slate-200">
                <p className="text-sm sm:text-base font-serif italic leading-relaxed">
                  {currentMsg.p1}
                </p>
                <p className="text-sm sm:text-base font-serif italic leading-relaxed">
                  {currentMsg.p2}
                </p>
                <div className="pt-2 text-right border-t border-white/5">
                  <span className="text-sm font-serif font-bold text-roseGlow-400">
                    {currentMsg.signoff}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleNextMessage}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-mono uppercase tracking-wider shadow-glow transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Read Another Note ({messageIndex + 1}/{SECRET_SURPRISE_MESSAGES.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full glass-card hover:border-white/30 text-xs font-mono uppercase tracking-wider text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  Close & Treasure
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
