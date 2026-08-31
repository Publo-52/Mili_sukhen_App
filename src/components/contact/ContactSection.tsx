'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, Mail, Lock, Unlock, ShieldCheck, Heart, User } from 'lucide-react';
import { APP_CONFIG } from '@/data/config';
import { isContactUnlocked, setContactUnlocked } from '@/lib/storage';
import { getWhatsAppUrl } from '@/lib/utils';
import { SendMessageForm } from './SendMessageForm';

export const ContactSection: React.FC = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(isContactUnlocked());
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passcode.trim() === APP_CONFIG.contactPasscode ||
      passcode.trim().toLowerCase() === 'mili' ||
      passcode.trim().toLowerCase() === 'forever'
    ) {
      setContactUnlocked(true);
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const socials = APP_CONFIG.socials;

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-400 text-xs font-mono tracking-widest uppercase">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Stay Connected</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Direct Line & Contact
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-light">
          Send a quick thought, call directly, or reach out anytime you need me.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Direct Message Form */}
        <SendMessageForm />

        {/* Right Column: Protected Contact Cards */}
        <div className="space-y-6">
          {!unlocked && APP_CONFIG.contactVisibility === 'PRIVATE' ? (
            /* Privacy Lock Screen */
            <div className="glass-card rounded-3xl p-8 border border-white/10 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-glow">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">
                  Contact Details Protected 🔒
                </h3>
                <p className="text-xs text-slate-300 font-light max-w-sm mx-auto">
                  Private phone & WhatsApp details are encrypted to ensure complete privacy. Enter PIN to view.
                </p>
                <p className="text-[11px] text-slate-500 font-mono">(Hint: 143)</p>
              </div>

              <form onSubmit={handleUnlock} className="max-w-xs mx-auto space-y-3 pt-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode to reveal"
                  className={`w-full px-4 py-2.5 rounded-2xl glass-card text-center text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-roseGlow-500 ${
                    error ? 'border-red-500 ring-2 ring-red-500 animate-shake' : 'border-white/10'
                  }`}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Reveal Contact Info</span>
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked Contact Details */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Sukhen's Contact Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-7 border border-roseGlow-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-roseGlow-500/20 text-roseGlow-400 flex items-center justify-center font-bold">
                      S
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{APP_CONFIG.creatorName}</h4>
                      <p className="text-xs text-roseGlow-300 font-mono">Always on call for you</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-green-500/10 text-green-400 border border-green-500/20">
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <a
                    href={`tel:${socials.creatorPhone}`}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-roseGlow-600/30 border border-white/5 hover:border-roseGlow-500 text-slate-200 transition-all"
                  >
                    <Phone className="w-4 h-4 text-roseGlow-400 mb-1" />
                    <span className="text-[11px] font-mono">Call</span>
                  </a>
                  <a
                    href={getWhatsAppUrl(socials.creatorWhatsapp || socials.creatorPhone, 'Hi Sukhen! ❤️')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-green-600/30 border border-white/5 hover:border-green-500 text-slate-200 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-green-400 mb-1" />
                    <span className="text-[11px] font-mono">WhatsApp</span>
                  </a>
                  <a
                    href={`sms:${socials.creatorPhone}`}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-purple-600/30 border border-white/5 hover:border-purple-500 text-slate-200 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-[11px] font-mono">SMS</span>
                  </a>
                  <a
                    href={`mailto:${socials.creatorEmail}`}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-amber-600/30 border border-white/5 hover:border-amber-500 text-slate-200 transition-all"
                  >
                    <Mail className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-[11px] font-mono">Email</span>
                  </a>
                </div>
              </div>

              {/* Mili's Quick Access Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    M
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{APP_CONFIG.recipientName}</h4>
                    <p className="text-xs text-slate-400 font-mono">The center of this universe</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <a
                    href={`tel:${socials.recipientPhone}`}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                  >
                    <Phone className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-[11px] font-mono">Call Mili</span>
                  </a>
                  <a
                    href={getWhatsAppUrl(socials.recipientWhatsapp || socials.recipientPhone, 'Hi Mili! ❤️')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-green-400 mb-1" />
                    <span className="text-[11px] font-mono">WhatsApp</span>
                  </a>
                  <a
                    href={`sms:${socials.recipientPhone}`}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-[11px] font-mono">SMS</span>
                  </a>
                  <a
                    href={`mailto:${socials.recipientEmail}`}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                  >
                    <Mail className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-[11px] font-mono">Email</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
