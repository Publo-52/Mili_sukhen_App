'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Sparkles, Calendar, BookOpen, Layers, Heart, Share2, Check } from 'lucide-react';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectPreviewModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({ project, onClose }) => {
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
          <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-white/10 bg-obsidian-950/80 backdrop-blur-md">
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
              <button
                onClick={handleShare}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Share or copy link"
                aria-label="Share"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
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

              {/* Floating Quick Open Pill on top right of image */}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg transition-transform hover:scale-105 backdrop-blur-md"
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
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Layers className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>Built With:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-xl text-xs font-mono bg-white/5 border border-white/10 text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white text-sm font-bold shadow-glow transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: project.themeAccent || '#e11d48',
                  boxShadow: project.themeGlow ? `0 0 25px ${project.themeGlow}` : undefined,
                }}
              >
                <span>Launch Live Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                href={`/projects/${project.slug}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl glass-card text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-roseGlow-400" />
                <span>Full Story</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
