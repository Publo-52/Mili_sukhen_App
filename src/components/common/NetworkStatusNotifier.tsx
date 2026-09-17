'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NetworkStatusNotifier: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);

      // Ping health endpoint to keep Supabase awake and trigger data re-synchronization
      try {
        fetch('/api/health').catch(() => {});
        window.dispatchEvent(new Event('mili-network-restored'));
      } catch {}

      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.aside
          key="offline-banner"
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-full bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2.5 max-w-[92vw] pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="truncate">Network disconnected. Drafts & notes are safely stored locally.</span>
        </motion.aside>
      )}

      {isOnline && showRestored && (
        <motion.aside
          key="online-banner"
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-xl flex items-center gap-2.5 max-w-[92vw] pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">Connection restored! Universe synced.</span>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
