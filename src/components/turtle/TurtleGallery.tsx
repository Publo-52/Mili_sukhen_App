'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Maximize2, Terminal, Play, Heart, Plus, Wand2, Edit3, Trash2 } from 'lucide-react';
import { TurtleCreation } from '@/types';
import { getTurtleCreations, saveTurtleCreation, deleteTurtleCreation } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import { FullscreenLightbox } from './FullscreenLightbox';
import { TurtleEditorModal } from './TurtleEditorModal';

export const TurtleGallery: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [creations, setCreations] = useState<TurtleCreation[]>([]);
  const [selectedCreation, setSelectedCreation] = useState<TurtleCreation | null>(null);

  // Admin Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCreation, setEditingCreation] = useState<TurtleCreation | null>(null);

  const loadCreations = useCallback(async () => {
    try {
      const res = await fetch('/api/turtle');
      if (res.ok) {
        const data = await res.json();
        if (data?.creations && data.creations.length > 0) {
          setCreations(data.creations);
          return;
        }
      }
    } catch {}
    setCreations(getTurtleCreations());
  }, []);

  useEffect(() => {
    loadCreations();
  }, [loadCreations]);

  const handleSaveCreation = async (creation: TurtleCreation) => {
    const updated = saveTurtleCreation(creation);
    setCreations(updated);

    try {
      await fetch('/api/turtle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation }),
      });
    } catch {}

    await loadCreations();
  };

  const handleDeleteCreation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Python Turtle creation?')) return;

    const updated = deleteTurtleCreation(id);
    setCreations(updated);

    try {
      await fetch(`/api/turtle?id=${id}`, {
        method: 'DELETE',
      });
    } catch {}

    await loadCreations();
  };

  return (
    <section id="python-art" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-14">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
            <Terminal className="w-3.5 h-3.5" />
            <span>Things I Drew For You</span>
          </div>

          {/* Admin Only Magic Generator Button */}
          {isAdmin && (
            <button
              onClick={() => {
                setEditingCreation(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow hover:scale-105 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>+ Add Python Art (Magic Generator)</span>
            </button>
          )}
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Python Turtle Artwork
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
          Mathematical equations and recursive scripts turned into digital flowers, cosmic spirals, and love trees. Click any piece to see it drawn in real time!
        </p>
      </div>

      {/* Grid of Turtle Artworks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {creations.map((creation, idx) => (
          <motion.div
            key={creation.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col border border-white/10 relative"
          >
            {/* Visual Thumbnail */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#07050d]">
              <Image
                src={creation.artworkImage}
                alt={creation.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent" />

              {/* Badge & Top Actions */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                  <Code2 className="w-3 h-3" />
                  <span>Python Turtle</span>
                </div>

                {/* Admin Only Quick Edit & Delete */}
                {isAdmin && (
                  <div className="flex items-center gap-1 bg-obsidian-950/80 backdrop-blur-md p-1 rounded-full border border-white/15">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCreation(creation);
                        setIsEditorOpen(true);
                      }}
                      className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Edit Python Art (Admin)"
                      aria-label="Edit artwork"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCreation(creation.id);
                      }}
                      className="p-1.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Python Art (Admin)"
                      aria-label="Delete artwork"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Hover Trigger */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                <button
                  onClick={() => setSelectedCreation(creation)}
                  className="px-4 py-2 rounded-full bg-roseGlow-600 text-white font-medium text-xs shadow-glow flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Animate & Code</span>
                </button>
              </div>

              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-slate-400">
                {formatDate(creation.createdAt)}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-roseGlow-300 transition-colors line-clamp-1">
                  {creation.title}
                </h3>
                <p className="text-xs text-slate-300 font-light line-clamp-2 mt-1">
                  {creation.description}
                </p>
              </div>

              <button
                onClick={() => setSelectedCreation(creation)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl glass-card hover:border-white/30 text-xs font-mono text-slate-300 hover:text-white transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5 text-roseGlow-400" />
                <span>Fullscreen Replay</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox / Canvas Viewer */}
      <FullscreenLightbox
        creation={selectedCreation}
        onClose={() => setSelectedCreation(null)}
      />

      {/* Admin Python Art Creator & Editor Modal */}
      {isAdmin && (
        <TurtleEditorModal
          isOpen={isEditorOpen}
          editingCreation={editingCreation}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCreation(null);
          }}
          onSave={handleSaveCreation}
        />
      )}
    </section>
  );
};

