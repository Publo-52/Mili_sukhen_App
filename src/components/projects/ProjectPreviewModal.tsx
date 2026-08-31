'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, RefreshCw, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface ProjectPreviewModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({ project, onClose }) => {
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl h-[88vh] glass-card rounded-3xl overflow-hidden flex flex-col border border-white/15 shadow-2xl z-10"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-obsidian-950/85">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center border"
                style={{
                  backgroundColor: project.themeAccent ? `${project.themeAccent}20` : 'rgba(244, 63, 94, 0.2)',
                  borderColor: project.themeAccent ? `${project.themeAccent}40` : 'rgba(244, 63, 94, 0.4)',
                  color: project.themeAccent || '#f43f5e',
                }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {project.title}
                  </h3>
                  {project.themeBadge && (
                    <span
                      className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 border text-slate-200"
                      style={{
                        borderColor: project.themeAccent ? `${project.themeAccent}50` : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {project.themeBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  {project.category} • Created {formatDate(project.createdAt)}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/projects/${project.slug}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
              >
                <span>Full Story</span>
              </Link>

              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: project.themeAccent || '#e11d48',
                  boxShadow: project.themeGlow ? `0 0 15px ${project.themeGlow}` : undefined,
                }}
              >
                <span>Open Full Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body / Iframe Area */}
          <div className="flex-1 relative bg-obsidian-950/90 overflow-hidden">
            {iframeLoading && !iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-obsidian-950/80">
                <div className="w-10 h-10 border-2 border-roseGlow-500/20 border-t-roseGlow-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-mono tracking-wider animate-pulse">
                  Connecting to memory…
                </p>
              </div>
            )}

            {/* Graceful Fallback if Iframe cannot be embedded or restricted */}
            {iframeError ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/20 flex items-center justify-center text-roseGlow-400">
                  <Heart className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h4 className="text-xl font-medium text-slate-100">
                    Looks like this memory prefers its full window! ❤️
                  </h4>
                  <p className="text-sm text-slate-400">
                    To maintain high security and full interactivity, this website is best viewed directly in your browser tab.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-roseGlow-600 hover:bg-roseGlow-500 text-white font-medium text-sm shadow-glow transition-all"
                  >
                    <span>Launch Website in Browser</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      setIframeError(false);
                      setIframeLoading(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full glass-card text-xs text-slate-300 hover:text-white"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                src={project.url}
                title={project.title}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onLoad={() => setIframeLoading(false)}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError(true);
                }}
              />
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-3 border-t border-white/10 bg-obsidian-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-slate-500">Tech Stack:</span>
              {project.technologies.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5 font-mono text-[11px]">
                  {t}
                </span>
              ))}
            </div>
            <div className="font-serif italic text-roseGlow-300/80">
              “Crafted with you in mind.”
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
