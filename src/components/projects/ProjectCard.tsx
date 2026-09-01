'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Heart, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { Project } from '@/types';

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

// True Pinterest Staggered Aspect Ratios
const PIN_ASPECTS = [
  'aspect-[3/4]',    // Portrait
  'aspect-[1/1]',    // Square
  'aspect-[4/5]',    // Medium Portrait
  'aspect-[3/4]',    // Portrait
  'aspect-[5/4]',    // Gentle Landscape
  'aspect-[4/5]',    // Medium Portrait
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
  const titleAccentClass = project.themeTextAccent || "group-hover:text-roseGlow-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.04 }}
      className="group relative flex flex-col cursor-pointer select-none"
    >
      {/* 1. Ultra-Clean Pinterest Image Pin */}
      <div
        onClick={() => onQuickPreview(project)}
        className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl bg-obsidian-900 border border-white/10 group-hover:border-white/20 transition-all duration-300 shadow-md group-hover:shadow-xl`}
      >
        {/* Pin Image */}
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Subtle Dark Gradient at Top/Bottom for Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        {/* Top Right: Favorite Heart & Admin Edit */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          {isAdmin && (
            <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/15">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onEdit(project);
                  }}
                  className="p-0.5 rounded-full hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                  title="Edit Project"
                  aria-label="Edit project"
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
                  className="p-0.5 rounded-full hover:bg-red-500/30 text-slate-200 hover:text-red-400 transition-colors"
                  title="Delete Project"
                  aria-label="Delete project"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleFavorite(project.id);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
              isFavorite
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/70'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Right of Image: Quick Open Pill */}
        <div className="absolute bottom-2 right-2 z-10">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-semibold bg-black/60 hover:bg-roseGlow-600 backdrop-blur-md border border-white/15 transition-all hover:scale-105 shadow-md"
          >
            <span>Open</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* 2. Pinterest Under-Image Title & 3-Dots Action Row */}
      <div className="pt-2 px-1 flex items-start justify-between gap-1.5">
        <div
          onClick={() => onQuickPreview(project)}
          className="flex-1 min-w-0"
        >
          <h3 className={`text-xs sm:text-sm font-semibold text-slate-100 ${titleAccentClass} transition-colors line-clamp-1`}>
            {project.title}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 font-light truncate mt-0.5">
            {project.category} • {project.technologies.slice(0, 2).join(', ')}
          </p>
        </div>

        {/* Pinterest 3-Dots (...) Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickPreview(project);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
          title="Quick preview & details"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
