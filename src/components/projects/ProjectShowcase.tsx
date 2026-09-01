'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, Sparkles, Heart, Filter, Layers, ArrowUpRight, Plus, Wand2 } from 'lucide-react';
import { Project, ProjectCategory } from '@/types';
import { getProjects, saveProject, deleteProject, toggleFavoriteProject, getFavoriteProjectIds, getDeletedProjectIds, markProjectDeleted } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { ProjectCard } from './ProjectCard';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { APP_CONFIG } from '@/data/config';

const ProjectPreviewModal = dynamic(() => import('./ProjectPreviewModal').then((m) => m.ProjectPreviewModal), { ssr: false });
const ProjectEditorModal = dynamic(() => import('./ProjectEditorModal').then((m) => m.ProjectEditorModal), { ssr: false });

const CATEGORIES: (ProjectCategory | 'All' | 'Favorites')[] = [
  'All',
  'Favorites',
  'Websites',
  'Special Projects',
  'Creative Projects',
  'Interactive Experiences',
  'Python Turtle',
];

export const ProjectShowcase: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  // Admin Project Creator / Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.projects && Array.isArray(data.projects)) {
          setProjects(data.projects);
          try {
            localStorage.setItem('mili_universe_projects', JSON.stringify(data.projects));
          } catch {}
          return;
        }
      }
    } catch {}
    setProjects(getProjects());
  }, []);

  useEffect(() => {
    loadProjects();
    setFavoriteIds(getFavoriteProjectIds());

    // 1. Supabase Realtime Subscription for Instant Updates across devices
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('projects-realtime-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'projects' },
            () => {
              loadProjects();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    // 2. Re-fetch whenever phone screen turns on or user switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProjects();
      }
    };
    const handleFocus = () => loadProjects();
    const handleSyncEvent = () => loadProjects();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mili-projects-updated', handleSyncEvent);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mili-projects-updated', handleSyncEvent);
    };
  }, [loadProjects]);

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteProject(id);
    setFavoriteIds(updated);
  };

  // Admin Save Project (Persists to local storage & Supabase)
  const handleSaveProject = async (project: Project) => {
    const updated = saveProject(project);
    setProjects(updated);
    setIsEditorOpen(false);
    setEditingProject(null);

    if (previewProject && previewProject.id === project.id) {
      setPreviewProject(project);
    }

    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ project }),
      });
    } catch {}

    window.dispatchEvent(new Event('mili-projects-updated'));
    await loadProjects();
  };

  // Admin Delete Project
  const handleDeleteProject = async (id: string) => {
    const updated = deleteProject(id);
    setProjects(updated);

    if (previewProject && previewProject.id === id) {
      setPreviewProject(null);
    }

    try {
      await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
      });
    } catch {}

    window.dispatchEvent(new Event('mili-projects-updated'));
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Category filter
      if (selectedCategory === 'Favorites') {
        if (!favoriteIds.includes(proj.id)) return false;
      } else if (selectedCategory !== 'All' && proj.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const inTitle = proj.title?.toLowerCase().includes(query) ?? false;
      const inDesc = proj.description?.toLowerCase().includes(query) ?? false;
      const inTech = Array.isArray(proj.technologies)
        ? proj.technologies.some((t) => t?.toLowerCase().includes(query))
        : false;
      const inTags = Array.isArray(proj.tags)
        ? proj.tags.some((t) => t?.toLowerCase().includes(query))
        : false;

      return inTitle || inDesc || inTech || inTags;
    });
  }, [projects, selectedCategory, searchQuery, favoriteIds]);

  return (
    <section id="projects" className="pt-1 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/30 text-roseGlow-400 text-xs font-mono tracking-widest uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Project Showcase</span>
          </div>

          {/* Admin Only Badge / Add Action */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingProject(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow hover:scale-105 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>+ Add Project (Magic URL)</span>
            </button>
          )}
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Websites & Digital Creations
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
          Every site deployed on Vercel and built with love. Click to test, preview, or explore the story behind each design.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-6 mb-10">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title, technology, or tag…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-card text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/60 focus:ring-1 focus:ring-roseGlow-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-roseGlow-600 text-white shadow-glow border border-roseGlow-500'
                    : 'glass-card text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'Favorites' && (
                  <Heart className={`w-3 h-3 ${isSelected ? 'fill-white text-white' : 'fill-roseGlow-500 text-roseGlow-500'}`} />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Masonry (True Pinterest-style Staggered 2-column on mobile, 3-column on desktop) */}
      {filteredProjects.length > 0 ? (
        <div className="columns-2 md:columns-2 lg:columns-3 gap-3 sm:gap-4 md:gap-6 [column-fill:_balance]">
          {filteredProjects.map((project, idx) => (
            <div key={project.id} className="break-inside-avoid mb-3 sm:mb-4 md:mb-6">
              <ProjectCard
                project={project}
                index={idx}
                isAdmin={isAdmin}
                onEdit={(p) => {
                  setEditingProject(p);
                  setIsEditorOpen(true);
                }}
                onDelete={handleDeleteProject}
                isFavorite={favoriteIds.includes(project.id)}
                onToggleFavorite={handleToggleFavorite}
                onQuickPreview={(proj) => setPreviewProject(proj)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 text-slate-400 mx-auto flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <p className="text-slate-300 font-medium">No projects found in this category.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-xs text-roseGlow-400 hover:underline"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* Quick Preview Modal */}
      <ProjectPreviewModal
        project={previewProject}
        onClose={() => setPreviewProject(null)}
        isFavorite={previewProject ? favoriteIds.includes(previewProject.id) : false}
        onToggleFavorite={handleToggleFavorite}
        isAdmin={isAdmin}
        onEdit={(p) => {
          setPreviewProject(null);
          setEditingProject(p);
          setIsEditorOpen(true);
        }}
        onDelete={(id) => {
          setPreviewProject(null);
          handleDeleteProject(id);
        }}
      />

      {/* Admin Project Creator & Editor Modal (Only available to Sukhen) */}
      {isAdmin && (
        <ProjectEditorModal
          isOpen={isEditorOpen}
          editingProject={editingProject}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}
    </section>
  );
};
