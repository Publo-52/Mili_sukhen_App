'use client';

import React from 'react';
import Image from 'next/image';
import { MoreHorizontal } from 'lucide-react';
import { Project } from '@/types';
import { getOptimizedImageUrl } from '@/lib/utils';

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
  'aspect-[3/4]',    // Portrait (e.g., painting)
  'aspect-[1/1]',    // Square (e.g., ghost)
  'aspect-[9/13]',   // Tall Portrait (e.g., car)
  'aspect-[4/5]',    // Medium Portrait (e.g., cafe)
  'aspect-[16/11]',  // Subtle Landscape
  'aspect-[3/4]',    // Portrait
];

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onQuickPreview,
  index,
}) => {
  const aspectClass = PIN_ASPECTS[index % PIN_ASPECTS.length];
  const titleAccentClass = project.themeTextAccent || "group-hover:text-roseGlow-300";
  const displayThumbnail = getOptimizedImageUrl(project.thumbnail, { width: 800, quality: 'auto' });

  return (
    <div
      className="group relative flex flex-col cursor-pointer select-none mb-3 sm:mb-4"
      onClick={() => onQuickPreview(project)}
    >
      {/* 1. Pure 100% Clean Pinterest Pin Media Container */}
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-obsidian-900 border border-white/5 group-hover:border-white/20 transition-all duration-300 shadow-sm group-hover:shadow-lg`}
      >
        <Image
          src={displayThumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* 2. Pure Pinterest Bottom Row: Clean Title & 3-Dots */}
      <div className="pt-1.5 px-0.5 flex items-center justify-between gap-1">
        <h3 className={`text-[12px] sm:text-[13px] font-medium text-slate-200 ${titleAccentClass} transition-colors truncate flex-1`}>
          {project.title}
        </h3>

        {/* Pinterest 3-Dots (...) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickPreview(project);
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white transition-colors flex-shrink-0"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
