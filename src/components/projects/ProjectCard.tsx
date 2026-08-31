'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Heart, Sparkles, Calendar, Layers, Edit3, Trash2 } from 'lucide-react';
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
  const borderClass = project.themeBorder || "group-hover:border-roseGlow-500/50";
  const titleAccentClass = project.themeTextAccent || "group-hover:text-roseGlow-300";
  const gradientClass = project.themeGradient || "from-rose-600/15 via-pink-600/5 to-transparent";

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative rounded-3xl glass-card overflow-hidden flex flex-col border border-white/10 ${borderClass} transition-all duration-500 hover:shadow-2xl`}
      style={{
        boxShadow: undefined,
      }}
    >
      {/* Dynamic Background Theme Gradient Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
      />

      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian-900">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-medium font-mono uppercase tracking-wider bg-obsidian-950/85 backdrop-blur-md text-white/90 border border-white/15 shadow-sm">
              {project.category}
            </span>
            {project.themeBadge && (
              <span
                className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/70 backdrop-blur-md border border-white/10 text-slate-200"
                style={{
                  borderColor: project.themeAccent ? `${project.themeAccent}40` : undefined,
                }}
              >
                {project.themeBadge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin-only quick edit & delete buttons */}
            {isAdmin && (
              <div className="flex items-center gap-1 bg-obsidian-950/80 backdrop-blur-md p-1 rounded-full border border-white/15">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onEdit(project);
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Edit Project (Admin)"
                    aria-label="Edit project"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-roseGlow-400" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDelete(project.id);
                    }}
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Project (Admin)"
                    aria-label="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                isFavorite
                  ? 'bg-roseGlow-600 text-white shadow-glow'
                  : 'bg-obsidian-950/70 text-slate-400 hover:text-white hover:bg-obsidian-950'
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Creation Date Badge on Bottom Left of Image */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-roseGlow-400" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 relative z-10">
        <div className="space-y-2">
          {/* Metadata Row: Date & Theme Badge */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-roseGlow-300 text-[11px]">
              <Calendar className="w-3 h-3 text-roseGlow-400" />
              <span>{formatDate(project.createdAt)}</span>
            </span>
            {project.themeBadge && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300"
                style={{
                  borderColor: project.themeAccent ? `${project.themeAccent}40` : undefined,
                }}
              >
                {project.themeBadge}
              </span>
            )}
          </div>

          <h3 className={`text-base sm:text-lg font-bold font-sans text-white ${titleAccentClass} transition-colors line-clamp-1`}>
            {project.title}
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-300 font-light leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/5"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-400">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => onQuickPreview(project)}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-roseGlow-400" />
            <span>Quick Preview</span>
          </button>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-white text-xs font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: project.themeAccent || '#e11d48',
              boxShadow: project.themeGlow ? `0 0 15px ${project.themeGlow}` : undefined,
            }}
          >
            <span>Open Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
