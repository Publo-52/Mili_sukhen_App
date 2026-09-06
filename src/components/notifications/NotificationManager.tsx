'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import {
  Bell,
  BellRing,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Heart,
  Camera,
  Video,
  FileCode,
  Palette,
  MessageSquare,
  Volume2,
} from 'lucide-react';

export interface AppNotification {
  id: string;
  type: 'photo' | 'video' | 'project' | 'turtle' | 'love_note' | 'message' | 'system';
  title: string;
  body: string;
  url: string;
  senderRole: 'sukhen' | 'mili' | 'system';
  senderName: string;
  image?: string;
  timestamp: number;
}

// Helper: Convert urlBase64 to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Gentle romantic chime synthesized using standard Web Audio API
function playRomanticChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      // Soft envelope
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.85);
    });
  } catch {
    // Audio autoplay might be blocked until gesture, gracefully ignored
  }
}

export function NotificationManager() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPromptBanner, setShowPromptBanner] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [history, setHistory] = useState<AppNotification[]>([]);

  // Refs for tracking active toasts and timeouts
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Sync subscription to server
  const syncSubscriptionWithBackend = useCallback(
    async (sub: PushSubscription) => {
      try {
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            role: user?.role || 'mili',
            name: user?.name || (user?.role === 'sukhen' ? 'Sukhen' : 'Mili'),
          }),
        });
      } catch {
        // offline or silent
      }
    },
    [user]
  );

  // 1. Check current Notification permission & Service Worker
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'default') {
        // Show gentle banner after 4 seconds on first visit
        const hasDismissed = localStorage.getItem('mili_push_dismissed');
        if (!hasDismissed) {
          const t = setTimeout(() => setShowPromptBanner(true), 4000);
          return () => clearTimeout(t);
        }
      }
    }

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(async (registration) => {
          if ('pushManager' in registration) {
            const sub = await registration.pushManager.getSubscription();
            if (sub) {
              setIsSubscribed(true);
              // Auto-sync subscription with backend in background
              syncSubscriptionWithBackend(sub);
            }
          }
        })
        .catch((err) => {
          console.warn('[SW Registration Notice]:', err);
        });
    }
  }, [user, syncSubscriptionWithBackend]);

  // 2. Subscribe to Web Push
  const enablePushNotifications = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Your browser does not support Web Push Notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        setShowPromptBanner(false);

        // Fetch VAPID public key
        const keyRes = await fetch('/api/notifications/vapid-public-key');
        const keyData = await keyRes.json();
        if (!keyData.publicKey) {
          throw new Error('VAPID public key unavailable');
        }

        const registration = await navigator.serviceWorker.ready;
        const convertedKey = urlBase64ToUint8Array(keyData.publicKey);

        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
        }

        await syncSubscriptionWithBackend(sub);
        setIsSubscribed(true);

        // Play celebration
        playRomanticChime();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f43f5e', '#fb7185', '#ec4899', '#ffd700'],
        });

        // Trigger local welcome toast
        handleNewNotification({
          id: `welcome-${Date.now()}`,
          type: 'system',
          title: '🔔 Instant Notifications Activated!',
          body: `You will now receive instant alerts even when the website is closed. ❤️`,
          url: '/',
          senderRole: 'system',
          senderName: 'Mili Universe',
          timestamp: Date.now(),
        });
      } else {
        setShowPromptBanner(false);
      }
    } catch (err) {
      console.error('[Push Subscription Error]:', err);
    }
  };

  // 3. Handle incoming notification
  const handleNewNotification = useCallback(
    (notif: AppNotification) => {
      if (processedIdsRef.current.has(notif.id)) return;
      processedIdsRef.current.add(notif.id);

      // Don't alert oneself for their own uploads
      if (user && user.role === notif.senderRole) {
        return;
      }

      // Add to toast queue
      setActiveToasts((prev) => [notif, ...prev.slice(0, 2)]);
      setHistory((prev) => [notif, ...prev.slice(0, 19)]);

      // Sound & Confetti
      playRomanticChime();
      try {
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.2, x: 0.85 },
          colors: ['#f43f5e', '#ec4899', '#fb7185', '#fbbf24'],
        });
      } catch {}

      // Auto dismiss after 9s
      setTimeout(() => {
        setActiveToasts((prev) => prev.filter((t) => t.id !== notif.id));
      }, 9000);
    },
    [user]
  );

  // 4. Supabase Realtime Broadcast Listener (<50ms delivery)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const channel = supabase.channel('mili-live-alerts');

      channel
        .on('broadcast', { event: 'new_upload' }, (eventPayload) => {
          if (eventPayload && eventPayload.payload) {
            handleNewNotification(eventPayload.payload as AppNotification);
          }
        })
        .subscribe();

      return () => {
        try {
          supabase?.removeChannel(channel);
        } catch {}
      };
    } catch (err) {
      console.warn('[Supabase Realtime Channel Warning]:', err);
    }
  }, [handleNewNotification]);

  // 5. Test alert button handler
  const triggerTestAlert = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderRole: user?.role === 'mili' ? 'mili' : 'sukhen',
          title: `❤️ Instant Test from ${user?.name || 'Sukhen'}!`,
          body: `Real-time & background notifications are working 100% with 0ms latency!`,
          url: '/',
        }),
      });
      const data = await res.json();

      // Show local confirmation
      playRomanticChime();
      handleNewNotification({
        id: `test-${Date.now()}`,
        type: 'love_note',
        title: `🔔 Test Alert Sent!`,
        body: `Dispatched to ${data.targetRole === 'mili' ? 'Mili' : 'Sukhen'} via Realtime & Web Push.`,
        url: '/',
        senderRole: 'system',
        senderName: 'System',
        timestamp: Date.now(),
      });
    } catch {
      alert('Failed to send test notification');
    } finally {
      setIsTesting(false);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'photo':
        return <Camera className="w-5 h-5 text-rose-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'project':
        return <FileCode className="w-5 h-5 text-emerald-400" />;
      case 'turtle':
        return <Palette className="w-5 h-5 text-amber-400" />;
      case 'love_note':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-300" />;
    }
  };

  return (
    <>
      {/* ── 1. Floating Instant Toast Alerts ──────────────────────────────────── */}
      <div className="fixed top-5 right-4 sm:right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {activeToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 50, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-2xl bg-[#0e0a16]/95 border border-rose-500/40 text-slate-100 shadow-rose-950/60"
            >
              {/* Romantic Glow Backing */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative flex items-start gap-3.5">
                {/* Type Icon Badge */}
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 flex-shrink-0 shadow-inner">
                  {getIcon(toast.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {toast.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      • Instant
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-white leading-snug line-clamp-1">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {toast.body}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                        router.push(toast.url);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <span>View Now</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setActiveToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── 2. Offline / Background Push Permission Banner ─────────────────────── */}
      <AnimatePresence>
        {showPromptBanner && permissionStatus === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99998] p-4 rounded-2xl backdrop-blur-2xl bg-[#0c0814]/95 border border-rose-500/40 text-slate-100 shadow-2xl shadow-rose-950/80"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-sm text-white flex items-center gap-1.5">
                  Never miss a moment with {user?.role === 'sukhen' ? 'Mili' : 'Sukhen'} ❤️
                </h5>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Turn on background notifications to get instant alerts even when your phone screen is locked or the website is closed!
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <button
                    onClick={enablePushNotifications}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-rose-900/40 transition hover:scale-[1.02] active:scale-95"
                  >
                    Allow Instant Alerts 🔔
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptBanner(false);
                      try {
                        localStorage.setItem('mili_push_dismissed', 'true');
                      } catch {}
                    }}
                    className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
                  >
                    Later
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowPromptBanner(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Discreet Floating Notification Control Pill ─────────────────────── */}
      <div className="fixed bottom-5 right-5 z-[9990] flex items-center gap-2">
        <button
          onClick={() => setPanelOpen((prev) => !prev)}
          className={`p-3 rounded-full backdrop-blur-xl border transition-all duration-300 shadow-xl ${
            isSubscribed
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300 hover:bg-rose-900/90 shadow-rose-950/50'
              : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:bg-black/90'
          }`}
          title="Instant Notifications Settings & History"
        >
          {isSubscribed ? (
            <BellRing className="w-5 h-5 text-rose-400 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ── 4. Notification History & Diagnostics Drawer ───────────────────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-20 right-5 z-[99990] w-80 sm:w-96 rounded-2xl backdrop-blur-2xl bg-[#0d0917]/95 border border-rose-500/30 p-4 shadow-2xl text-slate-100 shadow-rose-950/80"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-400" />
                <h4 className="font-semibold text-sm text-white">Instant Notifications</h4>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Card */}
            <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <p className="font-medium text-slate-200">
                  {isSubscribed ? '🟢 Background Push Active' : '🟡 Push Inactive'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isSubscribed
                    ? 'Receiving alerts even when tab is closed'
                    : 'Click below to enable offline alerts'}
                </p>
              </div>
              {!isSubscribed && (
                <button
                  onClick={enablePushNotifications}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
                >
                  Enable
                </button>
              )}
            </div>

            {/* Test Trigger Button */}
            <div className="mt-3">
              <button
                onClick={triggerTestAlert}
                disabled={isTesting}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-500/30 text-rose-300 font-medium text-xs flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>{isTesting ? 'Sending Test...' : 'Send Test Notification ❤️'}</span>
              </button>
            </div>

            {/* Recent History */}
            <div className="mt-4">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Recent Alerts ({history.length})
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3 text-center">
                    No notifications yet. Upload a photo, video, or note to trigger one!
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        router.push(item.url);
                        setPanelOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 cursor-pointer transition flex items-start gap-2.5"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                        {getIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
