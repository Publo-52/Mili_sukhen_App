'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Wand2,
  Sparkles,
  Terminal,
  Code2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  Layers,
  Heart,
  Palette,
} from 'lucide-react';
import { TurtleCreation } from '@/types';

interface TurtleEditorModalProps {
  isOpen: boolean;
  editingCreation: TurtleCreation | null;
  onClose: () => void;
  onSave: (creation: TurtleCreation) => Promise<void> | void;
}

const TEMPLATE_PRESETS = [
  { label: '💖 Parametric Heart', prompt: 'Parametric Mathematical Heart with glowing neon strokes for Mili' },
  { label: '🌹 Blooming Crimson Rose', prompt: 'Blooming Crimson Rose with botanical leaves and romantic message' },
  { label: '🌌 Cosmic Starlight Galaxy', prompt: 'Cosmic Galaxy Spiral with glowing stardust curves' },
  { label: '🌸 Sakura Love Tree', prompt: 'Recursive Fractal Sakura Tree with pink blossoms for Sharmili' },
  { label: '🔮 Sacred Love Mandala', prompt: 'Mathematical Sacred Mandala with kaleidoscope color palette' },
];

export const TurtleEditorModal: React.FC<TurtleEditorModalProps> = ({
  isOpen,
  editingCreation,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'magic' | 'manual' | 'code' | 'preview'>('magic');
  const [magicPrompt, setMagicPrompt] = useState('');
  const [pastedCode, setPastedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Form State
  const [formData, setFormData] = useState<Partial<TurtleCreation>>({
    title: '',
    slug: '',
    description: '',
    inspiration: '',
    category: 'Mathematical Geometry',
    artworkImage: '',
    pythonScript: '',
    tags: ['Python Turtle', 'Generative Art', 'For Mili'],
    featured: true,
    canvasDrawingType: 'mandala',
  });

  useEffect(() => {
    if (editingCreation) {
      setFormData(editingCreation);
      setPastedCode(editingCreation.pythonScript);
      setActiveTab('manual');
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        inspiration: '',
        category: 'Mathematical Geometry',
        artworkImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
        pythonScript: '',
        tags: ['Python Turtle', 'Generative Art', 'For Mili'],
        featured: true,
        canvasDrawingType: 'mandala',
      });
      setMagicPrompt('');
      setPastedCode('');
      setActiveTab('magic');
    }
    setErrorMsg('');
  }, [editingCreation, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleMagicGenerate = async () => {
    if (!magicPrompt.trim() && !pastedCode.trim()) {
      setErrorMsg('Please enter an art idea/prompt or paste Python script.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/turtle/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: magicPrompt.trim(),
          code: pastedCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to auto-generate Python Art.');
      }

      if (data.creation) {
        setFormData((prev) => ({
          ...prev,
          ...data.creation,
        }));
        setPastedCode(data.creation.pythonScript);
        setActiveTab('manual');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.pythonScript) {
      setErrorMsg('Title and Python Script are required.');
      return;
    }

    const slug =
      formData.slug ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const creationToSave: TurtleCreation = {
      id: editingCreation?.id || `turtle-${Date.now()}`,
      title: formData.title,
      slug,
      description: formData.description || 'A mathematical generative Python Turtle artwork crafted for Mili.',
      inspiration: formData.inspiration || 'Created with love and mathematical equations for my beloved wife Sharmili ❤️',
      category: formData.category || 'Mathematical Geometry',
      artworkImage: formData.artworkImage || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
      pythonScript: formData.pythonScript,
      tags: Array.isArray(formData.tags) ? formData.tags : ['Python Turtle', 'For Mili'],
      featured: Boolean(formData.featured),
      canvasDrawingType: formData.canvasDrawingType as any || 'mandala',
      createdAt: formData.createdAt || new Date().toISOString().split('T')[0],
    };

    await onSave(creationToSave);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-[#06040a] flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-12 sm:pt-6 pb-20 sm:pb-6 overflow-y-auto">
        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0e091b] rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl z-[1000000] my-auto flex flex-col max-h-[85vh] sm:max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/10 bg-[#130d25] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-glow shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {editingCreation ? 'Edit Python Turtle Art' : 'Magic Python Art Creator'}
                </h3>
                <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                  Auto-generate code, mathematical canvas animation, and stories for Mili
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 px-3 sm:px-5 pt-2 pb-2 border-b border-white/5 bg-[#0a0714] overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('magic')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
                activeTab === 'magic'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>⚡ Magic Generator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
                activeTab === 'manual'
                  ? 'bg-roseGlow-500/20 border border-roseGlow-500/40 text-roseGlow-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Artwork Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
                activeTab === 'code'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python Script</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono transition-all flex-shrink-0 ${
                activeTab === 'preview'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: MAGIC GENERATOR */}
            {activeTab === 'magic' && (
              <div className="space-y-5">
                <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 via-black/40 to-transparent space-y-4">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Python Art Generator</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Type an art idea (e.g. &quot;Golden Rose for Mili&quot;, &quot;Sakura Tree&quot;, &quot;Cosmic Heart&quot;) or paste any Python code. The engine will automatically generate the code, mathematics, romantic story, and artwork preview.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-mono text-slate-300 block">Art Idea or Description</label>
                    <input
                      type="text"
                      placeholder="e.g., Blooming Pink Lotus Flower in the Moonlight for Sharmili"
                      value={magicPrompt}
                      onChange={(e) => setMagicPrompt(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  {/* Preset quick buttons */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-slate-400">Or pick a romantic preset:</label>
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATE_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => {
                            setMagicPrompt(p.prompt);
                          }}
                          className="px-3 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 transition-all"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-mono text-slate-300 block">
                      Or Paste Python Code (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="import turtle&#10;t = turtle.Turtle()&#10;..."
                      value={pastedCode}
                      onChange={(e) => setPastedCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-card font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleMagicGenerate}
                    disabled={isGenerating}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Math & Poetry...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>⚡ Magic Generate & Auto-Fill</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL DETAILS */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Blooming Lotus in Moonlight"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">Category</label>
                    <input
                      type="text"
                      placeholder="e.g., Botanical Generative Art"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Canvas Simulator Type
                    </label>
                    <select
                      value={formData.canvasDrawingType || 'mandala'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          canvasDrawingType: e.target.value as any,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white bg-obsidian-900 focus:outline-none focus:border-roseGlow-500"
                    >
                      <option value="mandala">Mandala / Sacred Geometry</option>
                      <option value="heart">Parametric Glowing Heart</option>
                      <option value="rose">Blooming Crimson Rose</option>
                      <option value="galaxy">Cosmic Galaxy Spiral</option>
                      <option value="tree">Fractal Sakura Tree</option>
                      <option value="teddy">Teddy Bear with Confetti</option>
                      <option value="rose-day">Rose Day Bouquet</option>
                      <option value="love-app">Floating Heart Love App</option>
                      <option value="spiral">Stardust Spiral</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Artwork Thumbnail URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.artworkImage || ''}
                      onChange={(e) => setFormData({ ...formData, artworkImage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Description (Technical & Visual Summary)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description of the mathematics or design…"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Inspiration & Love Story for Mili
                  </label>
                  <textarea
                    rows={3}
                    placeholder="The romantic story and feelings behind this drawing…"
                    value={formData.inspiration || ''}
                    onChange={(e) => setFormData({ ...formData, inspiration: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PYTHON CODE */}
            {activeTab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300">
                    Python 3.x Script (Turtle Graphics / Tkinter) *
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">Valid Python Code</span>
                </div>
                <textarea
                  rows={14}
                  required
                  placeholder="import turtle&#10;t = turtle.Turtle()&#10;..."
                  value={formData.pythonScript || ''}
                  onChange={(e) => setFormData({ ...formData, pythonScript: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>
            )}

            {/* TAB 4: PREVIEW CARD */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <div className="max-w-xs mx-auto glass-card rounded-3xl overflow-hidden border border-amber-500/30">
                  <div className="relative aspect-square w-full bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.artworkImage || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop'}
                      alt={formData.title || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                      Python Turtle
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-bold text-white truncate">
                      {formData.title || 'Artwork Title'}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {formData.description || 'Description will appear here.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-white/10 gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl glass-card text-xs font-mono text-slate-400 hover:text-white text-center"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {activeTab === 'magic' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('manual')}
                    className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white text-center"
                  >
                    Manual Edit →
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-90 text-white text-xs font-mono uppercase tracking-wider font-bold shadow-glow flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Artwork</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
