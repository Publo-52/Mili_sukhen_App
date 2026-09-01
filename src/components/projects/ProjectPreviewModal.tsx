'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Sparkles, Calendar, BookOpen, Layers } from 'lucide-react';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectPreviewModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectPreviewModal: React.FC<ProjectPreviewModalProps> = ({ project, onClose }) => {
  const [mounted, setMounted] = useState(false);

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

  if (!project || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[999999] bg-[#06040a]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={onClose}
      >
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg sm:max-w-xl max-h-[90vh] bg-[#0e0a1a] rounded-3xl overflow-hidden flex flex-col border border-white/20 shadow-2xl z-[1000000] my-auto"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-obsidian-950/90">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center border flex-shrink-0"
                style={{
                  backgroundColor: project.themeAccent ? `${project.themeAccent}20` : 'rgba(244, 63, 94, 0.2)',
                  borderColor: project.themeAccent ? `${project.themeAccent}40` : 'rgba(244, 63, 94, 0.4)',
                  color: project.themeAccent || '#f43f5e',
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-white/5 border border-white/10 text-roseGlow-300">
                {project.category}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
            {/* Hero Image Preview */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-obsidian-950 border border-white/10 shadow-lg">
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Date on image */}
              <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-white/90 font-mono drop-shadow-md">
                <Calendar className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>{formatDate(project.createdAt)}</span>
              </div>
            </div>

            {/* Title and Badges */}
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                {project.title}
              </h2>
              {project.themeBadge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300">
                  <Sparkles className="w-3 h-3 text-roseGlow-400" />
                  <span>{project.themeBadge}</span>
                </div>
              )}
            </div>

            {/* Description & Story */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                {project.detailedStory || project.description}
              </p>
            </div>

            {/* Tech Stack Pills */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Layers className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>Technologies Used:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: project.themeAccent || '#e11d48',
                  boxShadow: project.themeGlow ? `0 0 20px ${project.themeGlow}` : undefined,
                }}
              >
                <span>Launch Live Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <Link
                href={`/projects/${project.slug}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl glass-card text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-roseGlow-400" />
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
