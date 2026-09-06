'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ExternalLink,
  Check,
  Copy,
  X,
  Sparkles,
  Heart,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WhatsAppSendResult } from '@/lib/whatsapp';
import {
  WHATSAPP_DISPATCH_EVENT,
  isAutoOpenEnabled,
  setAutoOpenEnabled,
} from '@/lib/whatsapp-client';

export const WhatsAppNotificationToast: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<WhatsAppSendResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [showBotGuide, setShowBotGuide] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setAutoOpen(isAutoOpenEnabled());

    const handleDispatch = (event: Event) => {
      const customEvent = event as CustomEvent<WhatsAppSendResult>;
      if (!customEvent.detail) return;

      setActiveNotification(customEvent.detail);
      setCopied(false);
      setShowFullText(false);

      // Reset auto-dismiss timer (12 seconds)
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setActiveNotification(null);
      }, 12000);
    };

    window.addEventListener(WHATSAPP_DISPATCH_EVENT, handleDispatch);
    return () => {
      window.removeEventListener(WHATSAPP_DISPATCH_EVENT, handleDispatch);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleOpenWhatsApp = () => {
    if (!activeNotification?.whatsappLink) return;
    window.open(activeNotification.whatsappLink, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async () => {
    if (!activeNotification?.messageText) return;
    try {
      await navigator.clipboard.writeText(activeNotification.messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleToggleAutoOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAutoOpen(checked);
    setAutoOpenEnabled(checked);
  };

  const handleDismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setActiveNotification(null);
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleMouseLeave = () => {
    if (activeNotification) {
      timerRef.current = setTimeout(() => {
        setActiveNotification(null);
      }, 7000);
    }
  };

  return (
    <AnimatePresence>
      {activeNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed bottom-5 right-4 sm:right-6 z-[100] max-w-md w-[calc(100vw-2rem)] sm:w-[420px] rounded-2xl bg-[#120b1e]/95 backdrop-blur-2xl border border-rose-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(244,63,94,0.25)] p-4 sm:p-5 text-slate-100 overflow-hidden"
          role="alert"
          aria-live="polite"
        >
          {/* Subtle Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-rose-500 to-purple-600" />

          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-sm">
                <MessageCircle className="w-5 h-5 fill-emerald-400/20" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{activeNotification.targetName}-এর WhatsApp নোটিফিকেশন</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0 inline animate-pulse" />
                </h4>
                <p className="text-[11px] font-mono text-slate-400 truncate">
                  নম্বর: +{activeNotification.targetPhone}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="Close"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {activeNotification.autoSent ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>বটের মাধ্যমে স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>১-ক্লিকে হোয়াটসঅ্যাপে পাঠাতে প্রস্তুত</span>
              </span>
            )}
          </div>

          {/* Message Preview Box */}
          <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>রোমান্টিক বার্তা প্রিভিউ:</span>
              <button
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy message"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>কপি</span>
                  </>
                )}
              </button>
            </div>

            <p
              className={`text-xs text-slate-200 leading-relaxed font-sans ${
                showFullText ? 'whitespace-pre-line' : 'line-clamp-3'
              }`}
            >
              {activeNotification.messageText}
            </p>

            {activeNotification.messageText.length > 120 && (
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-[10px] font-mono text-rose-300 hover:text-rose-200 flex items-center gap-0.5 pt-1 cursor-pointer"
              >
                <span>{showFullText ? 'সংক্ষিপ্ত দেখান' : 'সম্পূর্ণ মেসেজ পড়ুন'}</span>
                {showFullText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs font-mono shadow-[0_0_16px_rgba(16,185,129,0.35)] transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp-এ পাঠান</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowBotGuide(!showBotGuide)}
              className="p-2.5 rounded-xl glass-card hover:border-white/20 text-slate-300 hover:text-white transition-colors shrink-0 cursor-pointer"
              title="অটোমেটিক ব্যাকগ্রাউন্ড বট নির্দেশিকা"
              aria-label="Bot Guide"
            >
              <Bot className="w-4 h-4 text-purple-300" />
            </button>
          </div>

          {/* Quick Auto-Open Toggle */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoOpen}
                onChange={handleToggleAutoOpen}
                className="w-3.5 h-3.5 rounded bg-black/40 border-white/20 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-[11px]">আপলোডের সাথে সাথে WhatsApp খুলুন</span>
            </label>

            <button
              onClick={handleDismiss}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>

          {/* Collapsible Bot Setup Helper */}
          <AnimatePresence>
            {showBotGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-200 space-y-2"
              >
                <div className="font-bold flex items-center gap-1.5 text-purple-300">
                  <Bot className="w-3.5 h-3.5" />
                  <span>কোনো ক্লিক ছাড়াই ১০০% অটোমেটিক নোটিফিকেশন চান?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[10px] leading-relaxed">
                  <li>
                    WhatsApp-এ <strong className="text-white">+34 644 44 20 62</strong> নম্বরে মেসেজ পাঠান:
                    <code className="block bg-black/50 px-1.5 py-0.5 rounded text-emerald-300 font-mono mt-0.5 select-all">
                      I allow callmebot to send me messages
                    </code>
                  </li>
                  <li>বট রিপ্লাই দিয়ে একটি ফ্রি <strong className="text-white">API Key</strong> পাঠাবে।</li>
                  <li>অ্যাডমিন প্যানেলে বা <strong className="text-white">.env.local</strong> ফাইলে সেই Key বসিয়ে দিন।</li>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhatsAppNotificationToast;
