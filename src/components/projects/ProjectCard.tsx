'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Heart, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onQuickPreview: (project: Project) => void;
  index: number;
  isAdmin?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
}

// Organic Pinterest-like staggered aspect ratios
const PIN_ASPECTS = [
  'aspect-[3/4]',    // Tall Portrait (like man at cafe)
  'aspect-[1/1]',    // Square (like ghost)
  'aspect-[9/13]',   // Super Tall Portrait (like hanging car)
  'aspect-[4/5]',    // Medium Portrait
  'aspect-[16/11]',  // Subtle Landscape (like tree line)
  'aspect-[3/4]',    // Portrait
];

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isFavorite,
  onToggleFavorite,
  onQuickPreview,
  index,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  const aspectClass = PIN_ASPECTS[index % PIN_ASPECTS.length];
  const borderClass = project.themeBorder || "group-hover:border-roseGlow-500/50";
  const titleAccentClass = project.themeTextAccent || "group-hover:text-roseGlow-300";
  const gradientClass = project.themeGradient || "from-rose-600/15 via-pink-600/5 to-transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
      className="group relative flex flex-col cursor-pointer select-none"
    >
      {/* 1. Main Pinterest Pin Media Card */}
      <div
        onClick={() => onQuickPreview(project)}
        className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-obsidian-900 border border-white/10 ${borderClass} transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.01]`}
      >
        {/* Dynamic Theme Glow */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-30 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none z-1`}
        />

        {/* Pin Image */}
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Soft Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/70 via-transparent to-black/40 z-2" />

        {/* Top Badges & Favorite Button */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex items-center justify-between z-10">
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-medium font-mono uppercase tracking-wider bg-black/60 backdrop-blur-md text-white/90 border border-white/15 shadow-sm">
            {project.category}
          </span>

          <div className="flex items-center gap-1">
            {/* Admin Buttons */}
            {isAdmin && (
              <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md p-0.5 sm:p-1 rounded-full border border-white/15">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onEdit(project);
                    }}
                    className="p-1 rounded-full hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                    title="Edit Project"
                  >
                    <Edit3 className="w-3 h-3 text-roseGlow-400" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDelete(project.id);
                    }}
                    className="p-1 rounded-full hover:bg-red-500/30 text-slate-200 hover:text-red-400 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Favorite Heart */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onToggleFavorite(project.id);
              }}
              className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite
                  ? 'bg-roseGlow-600 text-white shadow-glow'
                  : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80'
              }`}
              aria-label="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Floating Quick Actions on Image */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-10 opacity-95 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] sm:text-[11px] font-mono text-white/80 drop-shadow-md truncate max-w-[60%]">
            {formatDate(project.createdAt)}
          </span>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: project.themeAccent || '#e11d48',
              boxShadow: project.themeGlow ? `0 0 12px ${project.themeGlow}` : undefined,
            }}
          >
            <span>Open</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          </a>
        </div>
      </div>

      {/* 2. Pinterest Under-Image Info & 3-Dots Menu */}
      <div className="pt-1.5 px-0.5 flex items-center justify-between gap-1.5">
        <div
          onClick={() => onQuickPreview(project)}
          className="flex-1 min-w-0"
        >
          <h3 className={`text-[11px] sm:text-sm font-semibold text-slate-100 ${titleAccentClass} transition-colors truncate`}>
            {project.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 truncate font-light">
            {project.technologies.slice(0, 2).join(' • ')}
          </p>
        </div>

        {/* Pinterest 3-Dots (...) Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickPreview(project);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          title="Quick preview & details"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </div>
    </motion.div>
  );
};
