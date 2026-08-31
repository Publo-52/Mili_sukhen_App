'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Wand2,
  Globe,
  Layers,
  Image as ImageIcon,
  Check,
  Palette,
  ExternalLink,
  Code2,
  Save,
  Trash2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Project, ProjectCategory } from '@/types';

interface ThemeOption {
  key: string;
  name: string;
  accent: string;
  gradient: string;
  glow: string;
  border: string;
  textAccent: string;
  badge: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'rose',
    name: 'Rose Romance',
    accent: '#f43f5e',
    gradient: 'from-rose-600/20 via-pink-600/10 to-transparent',
    glow: 'rgba(244, 63, 94, 0.4)',
    border: 'group-hover:border-rose-500/50',
    textAccent: 'group-hover:text-rose-400',
    badge: 'Heartfelt Creation',
  },
  {
    key: 'purple',
    name: 'Cosmic Purple',
    accent: '#8b5cf6',
    gradient: 'from-purple-600/20 via-indigo-600/10 to-transparent',
    glow: 'rgba(139, 92, 246, 0.4)',
    border: 'group-hover:border-purple-500/50',
    textAccent: 'group-hover:text-purple-300',
    badge: 'Cosmic Keepsake',
  },
  {
    key: 'amber',
    name: 'Golden Starlight',
    accent: '#f59e0b',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'group-hover:border-amber-500/50',
    textAccent: 'group-hover:text-amber-300',
    badge: 'Golden Memories',
  },
  {
    key: 'emerald',
    name: 'Emerald Enchantment',
    accent: '#10b981',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'group-hover:border-emerald-500/50',
    textAccent: 'group-hover:text-emerald-300',
    badge: 'Enchanted Realm',
  },
  {
    key: 'cyan',
    name: 'Starlight Cyan',
    accent: '#06b6d4',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    glow: 'rgba(6, 182, 212, 0.4)',
    border: 'group-hover:border-cyan-500/50',
    textAccent: 'group-hover:text-cyan-300',
    badge: 'Starlight Odyssey',
  },
  {
    key: 'pink',
    name: 'Fuchsia Melody',
    accent: '#ec4899',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    glow: 'rgba(236, 72, 153, 0.4)',
    border: 'group-hover:border-pink-500/50',
    textAccent: 'group-hover:text-pink-300',
    badge: 'Love Symphony',
  },
];

interface ProjectEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  editingProject?: Project | null;
}

export const ProjectEditorModal: React.FC<ProjectEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProject,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detailedStory, setDetailedStory] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Websites');
  const [githubUrl, setGithubUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [technologiesText, setTechnologiesText] = useState('React, Next.js, Tailwind CSS');
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(THEME_OPTIONS[0]);
  const [customBadge, setCustomBadge] = useState('');

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'theme' | 'preview'>('details');

  // Populate state when editing an existing project or opening new
  useEffect(() => {
    if (editingProject) {
      setUrl(editingProject.url || '');
      setTitle(editingProject.title || '');
      setDescription(editingProject.description || '');
      setDetailedStory(editingProject.detailedStory || '');
      setCategory(editingProject.category || 'Websites');
      setGithubUrl(editingProject.githubUrl || '');
      setThumbnail(editingProject.thumbnail || '');
      setTechnologiesText(
        Array.isArray(editingProject.technologies)
          ? editingProject.technologies.join(', ')
          : 'React, Tailwind CSS'
      );
      setCustomBadge(editingProject.themeBadge || '');

      const matched = THEME_OPTIONS.find(
        (t) => t.accent.toLowerCase() === (editingProject.themeAccent || '').toLowerCase()
      );
      if (matched) setSelectedTheme(matched);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setDetailedStory('');
      setCategory('Websites');
      setGithubUrl('');
      setThumbnail('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop');
      setTechnologiesText('React, Next.js, Tailwind CSS');
      setSelectedTheme(THEME_OPTIONS[0]);
      setCustomBadge('Vercel Creation');
      setExtractError('');
    }
  }, [editingProject, isOpen]);

  // Magic Auto-Extract from URL
  const handleAutoExtract = async () => {
    if (!url.trim()) {
      setExtractError('Please enter a project URL first.');
      return;
    }

    setIsExtracting(true);
    setExtractError('');

    try {
      const res = await fetch('/api/projects/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.project) {
        const p: Project = data.project;
        setTitle(p.title || '');
        setDescription(p.description || '');
        setDetailedStory(p.detailedStory || '');
        setCategory(p.category || 'Websites');
        setThumbnail(p.thumbnail || '');
        if (p.githubUrl) setGithubUrl(p.githubUrl);
        if (p.technologies) setTechnologiesText(p.technologies.join(', '));
        if (p.themeBadge) setCustomBadge(p.themeBadge);

        const matched = THEME_OPTIONS.find((t) => t.accent === p.themeAccent);
        if (matched) setSelectedTheme(matched);

        setActiveTab('preview');
      } else {
        setExtractError(data.error || 'Could not fetch metadata from URL. You can fill details manually.');
      }
    } catch {
      setExtractError('Network error while analyzing URL.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyTheme = (theme: ThemeOption) => {
    setSelectedTheme(theme);
    if (!customBadge || customBadge === selectedTheme.badge) {
      setCustomBadge(theme.badge);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setExtractError('Project Title and Deployed URL are required.');
      return;
    }

    setIsSaving(true);
    setExtractError('');

    try {
      const cleanSlug =
        editingProject?.slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '') ||
        `proj-${Date.now()}`;

      const techList = technologiesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const projectToSave: Project = {
        id: editingProject ? editingProject.id : `proj-${Date.now()}`,
        title: title.trim(),
        slug: cleanSlug,
        description: description.trim() || `A romantic web project dedicated to Mili.`,
        detailedStory: detailedStory.trim() || `I created this project with love for Sharmili.`,
        category,
        url: url.trim(),
        githubUrl: githubUrl.trim() || undefined,
        thumbnail:
          thumbnail.trim() ||
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        technologies: techList.length > 0 ? techList : ['React', 'Tailwind CSS'],
        createdAt: editingProject?.createdAt || new Date().toISOString().split('T')[0],
        featured: true,
        order: editingProject?.order || 1,
        tags: [category, ...techList.slice(0, 3), 'Suksharmi Special'],
        iframeSupported: true,
        themeGradient: selectedTheme.gradient,
        themeGlow: selectedTheme.glow,
        themeAccent: selectedTheme.accent,
        themeBadge: customBadge || selectedTheme.badge,
        themeBorder: selectedTheme.border,
        themeTextAccent: selectedTheme.textAccent,
      };

      await onSave(projectToSave);
      onClose();
    } catch {
      setExtractError('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-3xl glass-card rounded-3xl border border-white/15 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-obsidian-900/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-roseGlow-500 p-0.5 shadow-glow flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#0c0817] flex items-center justify-center text-roseGlow-400">
                  <Wand2 className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>{editingProject ? 'Edit Project' : 'Magic Project Creator'}</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-roseGlow-500/20 text-roseGlow-300 border border-roseGlow-500/30">
                    Admin Only
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Paste any Vercel/website URL to auto-extract details & theme
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-card hover:border-white/30 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 pt-3 border-b border-white/10 flex items-center gap-3 bg-black/20">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'border-roseGlow-500 text-roseGlow-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Project Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'theme'
                  ? 'border-roseGlow-500 text-roseGlow-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Visual Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'border-roseGlow-500 text-roseGlow-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Card Preview</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {extractError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{extractError}</span>
              </div>
            )}

            {/* ── TAB 1: DETAILS & MAGIC EXTRACTOR ───────────────────────── */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Magic URL Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/20 via-roseGlow-950/20 to-black/40 border border-roseGlow-500/30 space-y-2.5">
                  <label className="text-xs font-mono text-roseGlow-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
                      Deployed Project URL (Auto-Theme Engine)
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      e.g., https://your-app.vercel.app
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://mili-mocha.vercel.app/"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />

                    <button
                      type="button"
                      onClick={handleAutoExtract}
                      disabled={isExtracting || !url.trim()}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                    >
                      {isExtracting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Analyzing…</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Magic Auto-Fill</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. My Dear Mili (Love Envelope)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white bg-obsidian-900 focus:outline-none focus:border-roseGlow-500"
                    >
                      <option value="Websites">Websites</option>
                      <option value="Special Projects">Special Projects</option>
                      <option value="Creative Projects">Creative Projects</option>
                      <option value="Interactive Experiences">Interactive Experiences</option>
                      <option value="Python Turtle">Python Turtle</option>
                    </select>
                  </div>

                  {/* Thumbnail Image URL */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono text-slate-300 block mb-1.5 flex items-center justify-between">
                      <span>Thumbnail Image URL</span>
                      <button
                        type="button"
                        onClick={() =>
                          setThumbnail(
                            `https://image.thum.io/get/width/1200/crop/675/maxAge/24/noanimate/${url}`
                          )
                        }
                        className="text-[10px] text-roseGlow-400 hover:underline"
                      >
                        Use Live Screenshot from URL
                      </button>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={thumbnail}
                        onChange={(e) => setThumbnail(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                      />
                      {thumbnail && (
                        <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/20 relative flex-shrink-0">
                          <Image src={thumbnail} alt="preview" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      Technologies (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="React, Next.js, Tailwind CSS, Framer Motion"
                      value={technologiesText}
                      onChange={(e) => setTechnologiesText(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  {/* Short Description */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      Short Description (for card)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief emotional summary…"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500 resize-none"
                    />
                  </div>

                  {/* Detailed Story */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      The Story Behind It (Detailed for Project Page)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="The inspiration, feelings, and thoughts that went into creating this…"
                      value={detailedStory}
                      onChange={(e) => setDetailedStory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500 resize-none"
                    />
                  </div>

                  {/* GitHub URL */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono text-slate-300 block mb-1.5">
                      GitHub Source URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/sukhen/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: THEME & PALETTE SELECTOR ───────────────────────── */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Select Card Color Palette & Glow Theme
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    This dynamically sets the card glow, background gradient, button colors, and highlights.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {THEME_OPTIONS.map((theme) => {
                    const isSelected = selectedTheme.key === theme.key;
                    return (
                      <button
                        key={theme.key}
                        type="button"
                        onClick={() => handleApplyTheme(theme)}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'bg-white/10 border-white/40 shadow-glow'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                        style={{
                          borderColor: isSelected ? theme.accent : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center border border-white/20"
                            style={{ backgroundColor: theme.accent }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-slate-300"
                          >
                            {theme.key}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-white">{theme.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            {theme.badge}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Badge Name */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <label className="text-xs font-mono text-slate-300 block">
                    Custom Card Badge Text (Displayed on top of the card)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Valentine Special"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                  />
                </div>
              </div>
            )}

            {/* ── TAB 3: LIVE CARD PREVIEW ──────────────────────────────── */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">Live Showcase Card Preview</h4>
                  <span className="text-xs font-mono text-roseGlow-400">
                    Theme: {selectedTheme.name}
                  </span>
                </div>

                {/* Simulated Card */}
                <div className="max-w-md mx-auto rounded-3xl glass-card overflow-hidden flex flex-col border border-white/15 transition-all duration-500 shadow-2xl relative">
                  {/* Dynamic Background Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedTheme.gradient} opacity-75 pointer-events-none`}
                  />

                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian-900">
                    <Image
                      src={
                        thumbnail ||
                        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop'
                      }
                      alt={title || 'Project Preview'}
                      fill
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-medium font-mono uppercase tracking-wider bg-obsidian-950/85 backdrop-blur-md text-white/90 border border-white/15">
                        {category}
                      </span>
                      {(customBadge || selectedTheme.badge) && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/70 backdrop-blur-md border border-white/10 text-slate-200"
                          style={{ borderColor: `${selectedTheme.accent}40` }}
                        >
                          {customBadge || selectedTheme.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                    <div className="space-y-1.5">
                      <h3
                        className="text-lg font-bold text-white transition-colors line-clamp-1"
                        style={{ color: selectedTheme.accent }}
                      >
                        {title || 'Project Title Appears Here'}
                      </h3>
                      <p className="text-xs text-slate-300 font-light line-clamp-2 leading-relaxed">
                        {description || 'Project description will appear here on the showcase card.'}
                      </p>
                    </div>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1">
                      {technologiesText
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-slate-300 border border-white/5"
                          >
                            {tech}
                          </span>
                        ))}
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium"
                      >
                        Quick Preview
                      </button>
                      <a
                        href={url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-glow"
                        style={{
                          backgroundColor: selectedTheme.accent,
                        }}
                      >
                        <span>Open Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl glass-card text-xs font-mono text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {activeTab !== 'preview' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'details' ? 'theme' : 'preview')}
                    className="px-4 py-2.5 rounded-xl glass-card hover:border-white/30 text-xs font-mono text-slate-200"
                  >
                    Next ➔
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSaving || !title.trim() || !url.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Project…</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Publish Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
