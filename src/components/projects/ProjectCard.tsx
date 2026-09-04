'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Edit3, Trash2, ExternalLink, Sparkles } from 'lucide-react';
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
  'aspect-[3/4]',    // Portrait
  'aspect-[1/1]',    // Square
  'aspect-[9/13]',   // Tall Portrait
  'aspect-[4/5]',    // Medium Portrait
  'aspect-[16/11]',  // Subtle Landscape
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
  const titleAccentClass = project.themeTextAccent || 'group-hover:text-roseGlow-300';
  const defaultThumb = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop';
  const displayThumbnail = getOptimizedImageUrl(project.thumbnail || defaultThumb, { width: 800, quality: 'auto' }) || defaultThumb;

  return (
    <div
      className="group relative flex flex-col cursor-pointer select-none mb-3 sm:mb-4 fast-scroll-item"
      onClick={() => onQuickPreview(project)}
    >
      {/* 1. Pinterest Media Container with Overlays */}
      <div
        className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-obsidian-900 border border-white/5 group-hover:border-roseGlow-500/40 transition-all duration-300 shadow-sm group-hover:shadow-xl`}
      >
        <Image
          src={displayThumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          loading={index < 4 ? 'eager' : 'lazy'}
          priority={index < 4}
          quality={75}
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top-Left: Favorite Heart Button */}
        <div
          className="absolute top-2.5 left-2.5 z-20"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleFavorite(project.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md ${
              isFavorite
                ? 'bg-roseGlow-600/90 text-white shadow-glow border border-roseGlow-400/50'
                : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80 border border-white/15'
            }`}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-300 ${
                isFavorite ? 'fill-white text-white scale-110' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Top-Right: Admin Controls (Edit & Delete) */}
        {isAdmin && (
          <div
            className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-lg">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onEdit(project);
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-amber-300 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  title="Edit Project"
                  aria-label="Edit Project"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDelete(project.id);
                  }}
                  className="w-7 h-7 rounded-full bg-red-500/25 hover:bg-red-500/50 text-red-300 hover:text-red-100 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  title="Delete Project"
                  aria-label="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating Category Badge (on hover) */}
        <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono text-roseGlow-300">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{project.category}</span>
          </span>
        </div>
      </div>

      {/* 2. Bottom Row: Title & Quick Visit Link */}
      <div className="pt-2 px-0.5 flex items-center justify-between gap-1.5">
        <h3 className={`text-[12px] sm:text-[13px] font-medium text-slate-200 ${titleAccentClass} transition-colors truncate flex-1`}>
          {project.title}
        </h3>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-full text-slate-400 hover:text-roseGlow-400 transition-colors flex-shrink-0"
          title="Open live project"
          aria-label="Open live project"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
