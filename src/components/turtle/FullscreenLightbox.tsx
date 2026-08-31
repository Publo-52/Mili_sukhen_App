'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, Image as ImageIcon, Copy, Check, Sparkles, Heart } from 'lucide-react';
import { TurtleCreation } from '@/types';
import { TurtleCanvasViewer } from './TurtleCanvasViewer';
import { formatDate } from '@/lib/utils';

interface FullscreenLightboxProps {
  creation: TurtleCreation | null;
  onClose: () => void;
}

export const FullscreenLightbox: React.FC<FullscreenLightboxProps> = ({
  creation,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'canvas' | 'image' | 'code'>('canvas');
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!creation || !mounted) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(creation.pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#06040c]/95 backdrop-blur-2xl z-[99999]"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] bg-[#0e091b] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col border border-white/20 shadow-2xl z-[100000] my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#130d25] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-roseGlow-500/20 text-roseGlow-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {creation.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {creation.category} • Created {formatDate(creation.createdAt)}
                </p>
              </div>
            </div>

            {/* Tab switchers & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
                <button
                  onClick={() => setActiveTab('canvas')}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'canvas' ? 'bg-roseGlow-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Canvas
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'code' ? 'bg-roseGlow-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python Code
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
            {activeTab === 'canvas' && (
              <div className="space-y-4">
                <TurtleCanvasViewer creation={creation} />
                <div className="glass-card p-4 rounded-2xl space-y-2 border border-white/5">
                  <div className="flex items-center gap-2 text-roseGlow-400 text-xs font-mono uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Inspiration & Story</span>
                  </div>
                  <p className="text-sm text-slate-300 font-light leading-relaxed">
                    {creation.inspiration}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Python 3.x • turtle module
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-xs text-slate-200 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                  </button>
                </div>
                <div className="rounded-2xl bg-black/80 p-4 border border-white/10 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                  <pre>{creation.pythonScript}</pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
