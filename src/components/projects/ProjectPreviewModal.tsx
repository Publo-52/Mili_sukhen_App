'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  Sparkles,
  Calendar,
  Heart,
  Share2,
  Check,
  Edit3,
  Trash2,
  Code2,
  Globe,
  RotateCcw,
  Smartphone,
  Monitor,
  BookOpen,
  Layers,
} from 'lucide-react';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectPreviewModalProps {
  project: Project | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  isAdmin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

type TabType = 'live' | 'story' | 'tech';

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({
  project,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('live');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (project) {
      document.body.classList.add('modal-open');
      setIframeLoading(true);
      setIframeKey((prev) => prev + 1);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [project]);

  // Escape key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShare = async () => {
    if (!project) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: project.url,
        });
      } else {
        await navigator.clipboard.writeText(project.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const handleReloadIframe = () => {
    setIframeLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  if (!project || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] bg-[#0c0817] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col border border-white/15 shadow-[0_20px_70px_rgba(0,0,0,0.85)] z-[1000000]"
        >
          {/* Top Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 bg-[#120c22]/95 shrink-0 space-y-3">
            {/* Row 1: Category Badge & Control Icons */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-roseGlow-500/15 text-roseGlow-300 border border-roseGlow-500/30">
                <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>{project.category}</span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* Favorite Toggle */}
                {onToggleFavorite && (
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(project.id)}
                    className={`p-2 rounded-full transition-all active:scale-90 cursor-pointer ${
                      isFavorite
                        ? 'bg-roseGlow-600/20 text-roseGlow-400 border border-roseGlow-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label="Favorite"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-roseGlow-500 text-roseGlow-500' : ''}`} />
                  </button>
                )}

                {/* Admin Actions */}
                {isAdmin && (
                  <>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(project)}
                        className="px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(project.id)}
                        className="px-2.5 py-1 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </>
                )}

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Share or copy link"
                  aria-label="Share"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer ml-1"
                  title="Close (Esc)"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Title & Date */}
            <div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug break-words">
                {project.title}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Created {formatDate(project.createdAt)}</span>
              </p>
            </div>

            {/* Row 3: Segmented Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.06] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('live')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'live'
                    ? 'bg-roseGlow-600 text-white shadow-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Live Project</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('story')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'story'
                    ? 'bg-purple-600 text-white shadow-glow-violet font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Story & Details</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tech')}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  activeTab === 'tech'
                    ? 'bg-pink-600 text-white shadow-glow font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Tech Stack</span>
              </button>
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="p-3 sm:p-5 overflow-y-auto max-h-[calc(88vh-180px)] space-y-4">
            {/* 1. Live Interactive Web Preview Tab */}
            {activeTab === 'live' && (
              <div className="space-y-3">
                {/* Browser Control Bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#100b20] border border-white/10 flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300 min-w-0 flex-1 truncate">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-slate-400 truncate">{project.url}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Device Switcher */}
                    <div className="hidden sm:flex items-center bg-white/10 p-0.5 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setDeviceMode('desktop')}
                        className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Desktop View"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeviceMode('mobile')}
                        className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}
                        title="Mobile View"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Reload Frame Button */}
                    <button
                      type="button"
                      onClick={handleReloadIframe}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                      title="Reload Preview"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Open External Tab Button */}
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-roseGlow-600 to-purple-600 text-white font-semibold hover:brightness-110 shadow-glow transition-all active:scale-95"
                    >
                      <span>Open Live</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Embedded Web Viewport */}
                <div
                  className={`relative mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black transition-all duration-300 ${
                    deviceMode === 'mobile'
                      ? 'max-w-xs aspect-[9/16] shadow-2xl border-2 border-slate-700'
                      : 'w-full aspect-[16/10] sm:aspect-[16/10]'
                  }`}
                >
                  {iframeLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#07050d] gap-3">
                      <div className="w-8 h-8 border-2 border-roseGlow-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono text-slate-400">Loading live project runner…</p>
                    </div>
                  )}

                  <iframe
                    key={iframeKey}
                    src={project.url}
                    title={project.title}
                    onLoad={() => setIframeLoading(false)}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    className="w-full h-full border-0 bg-white"
                    loading="eager"
                  />
                </div>
              </div>
            )}

            {/* 2. Story & Details Tab */}
            {activeTab === 'story' && (
              <div className="space-y-4 max-w-xl mx-auto py-2">
                {/* Hero Artwork Image */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-obsidian-950 border border-white/10 shadow-lg">
                  <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 rounded-3xl bg-gradient-to-b from-roseGlow-950/40 via-purple-950/20 to-transparent border border-roseGlow-500/20 space-y-3 text-left">
                  <div className="flex items-center gap-2 text-roseGlow-400 font-mono text-xs uppercase tracking-wider font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Story Behind the Project</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                    {project.detailedStory || project.description}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Tech Stack Tab */}
            {activeTab === 'tech' && (
              <div className="space-y-4 max-w-xl mx-auto py-2">
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider font-bold">
                    <Layers className="w-4 h-4" />
                    <span>Technologies & Architecture</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-purple-500/10 border border-purple-500/30 text-purple-200"
                      >
                        ⚡ {tech}
                      </span>
                    ))}
                  </div>

                  {project.githubUrl && (
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-mono">Source Repository</span>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>View on GitHub</span>
                      </a>
                    </div>
                  )}
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
