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
  Layers,
  Heart,
  Share2,
  Check,
  Edit3,
  Trash2,
  Code2,
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

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({
  project,
  onClose,
  isFavorite = false,
  onToggleFavorite,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (project) {
      document.body.classList.add('modal-open');
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

  if (!project || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] bg-[#050308]/90 backdrop-blur-2xl flex flex-col items-center justify-end sm:justify-center p-0 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal Window / Mobile Bottom Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg sm:max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-[#0e0a1a] rounded-t-[32px] sm:rounded-3xl overflow-hidden flex flex-col border-t sm:border border-white/20 shadow-2xl z-[1000000]"
        >
          {/* Mobile Drag Pill */}
          <div className="sm:hidden w-full flex items-center justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Sticky Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-obsidian-950/80 backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-roseGlow-500/15 text-roseGlow-300 border border-roseGlow-500/30">
                {project.category}
              </span>
              {project.themeBadge && (
                <span className="hidden xs:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300">
                  <Sparkles className="w-2.5 h-2.5 text-roseGlow-400" />
                  <span>{project.themeBadge}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Favorite Toggle Button */}
              {onToggleFavorite && (
                <button
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
                      onClick={() => onEdit(project)}
                      className="px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Edit</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(project.id)}
                      className="px-2.5 py-1 rounded-full bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Delete</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={handleShare}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Share or copy link"
                aria-label="Share"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Hero Image Showcase with Floating Open Action */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-obsidian-950 border border-white/10 shadow-xl group">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/90 via-transparent to-transparent pointer-events-none" />
              
              {/* Date on bottom left */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-white/90 font-mono drop-shadow-md">
                <Calendar className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>{formatDate(project.createdAt)}</span>
              </div>

              {/* Floating Quick Open Pill */}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg transition-transform hover:scale-105 backdrop-blur-md cursor-pointer"
                style={{
                  backgroundColor: project.themeAccent || '#e11d48',
                  boxShadow: project.themeGlow ? `0 0 15px ${project.themeGlow}` : undefined,
                }}
              >
                <span>Visit Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                {project.title}
              </h2>
            </div>

            {/* Description & Story Card */}
            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2 bg-white/[0.03]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-roseGlow-400 font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>About this Creation</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-light leading-relaxed">
                {project.detailedStory || project.description}
              </p>
            </div>

            {/* Tech Stack Pills */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Technologies Used
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-slate-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-center font-semibold text-sm shadow-glow flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>Launch Project</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl glass-card border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-sm font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                  title="View Source Code"
                >
                  <Code2 className="w-4 h-4" />
                  <span className="hidden xs:inline">Source Code</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
