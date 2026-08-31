'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Eye, Heart, Sparkles, Calendar, Layers } from 'lucide-react';
import { Project } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onQuickPreview: (project: Project) => void;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isFavorite,
  onToggleFavorite,
  onQuickPreview,
  index,
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

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
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

        {/* Creation Date Badge on Bottom Left of Image */}
        <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs text-slate-300 font-mono">
          <Calendar className="w-3.5 h-3.5 text-roseGlow-400" />
          <span>{formatDate(project.createdAt)}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4 relative z-10">
        <div className="space-y-2">
          {/* Mobile Theme Badge if hidden on thumbnail */}
          {project.themeBadge && (
            <div className="sm:hidden pb-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-slate-200"
                style={{
                  borderColor: project.themeAccent ? `${project.themeAccent}40` : undefined,
                }}
              >
                {project.themeBadge}
              </span>
            </div>
          )}

          <h3 className={`text-xl font-bold font-sans text-white ${titleAccentClass} transition-colors line-clamp-1`}>
            {project.title}
          </h3>
          <p className="text-sm text-slate-300 font-light leading-relaxed line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 text-slate-300 border border-white/5"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-400">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => onQuickPreview(project)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-roseGlow-400" />
            <span>Quick Preview</span>
          </button>

          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-medium transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: project.themeAccent || '#e11d48',
              boxShadow: project.themeGlow ? `0 0 15px ${project.themeGlow}` : undefined,
            }}
          >
            <span>Open Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
