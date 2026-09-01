'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Sparkles, Code2, Maximize2, Terminal, Play, Heart, Plus, Wand2, Edit3, Trash2 } from 'lucide-react';
import { TurtleCreation } from '@/types';
import { getTurtleCreations, saveTurtleCreation, deleteTurtleCreation } from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { formatDate, getOptimizedImageUrl } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const FullscreenLightbox = dynamic(() => import('./FullscreenLightbox').then((m) => m.FullscreenLightbox), { ssr: false });
const TurtleEditorModal = dynamic(() => import('./TurtleEditorModal').then((m) => m.TurtleEditorModal), { ssr: false });

export const TurtleGallery: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [creations, setCreations] = useState<TurtleCreation[]>([]);
  const [selectedCreation, setSelectedCreation] = useState<TurtleCreation | null>(null);

  // Admin Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCreation, setEditingCreation] = useState<TurtleCreation | null>(null);

  const loadCreations = useCallback(async () => {
    try {
      const res = await fetch('/api/turtle', { cache: 'no-store' });
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

    // 1. Supabase Realtime Subscription for instant cross-device updates
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('turtle-realtime-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'turtle_creations' },
            () => {
              loadCreations();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Turtle realtime error:', err);
      }
    }

    // 2. Re-fetch when phone screen turns on or user switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadCreations();
      }
    };
    const handleFocus = () => loadCreations();
    const handleSyncEvent = () => loadCreations();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mili-turtle-updated', handleSyncEvent);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mili-turtle-updated', handleSyncEvent);
    };
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

    window.dispatchEvent(new Event('mili-turtle-updated'));
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

    window.dispatchEvent(new Event('mili-turtle-updated'));
    await loadCreations();
  };

  return (
    <section id="python-art" className="pt-1 pb-6 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-wider uppercase">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow hover:scale-105 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>+ Add Python Art</span>
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Python Turtle Artwork
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto font-light leading-relaxed">
          Mathematical equations and recursive scripts turned into digital flowers, cosmic spirals, and love trees. Click any piece to see it drawn in real time!
        </p>
      </div>

      {/* Pinterest-style Staggered Masonry Columns */}
      <div className="columns-2 md:columns-2 lg:columns-3 gap-3 sm:gap-4 md:gap-6 [column-fill:_balance]">
        {creations.map((creation, idx) => {
          const TURTLE_ASPECTS = [
            'aspect-[1/1]',
            'aspect-[3/4]',
            'aspect-[4/5]',
            'aspect-[1/1]',
            'aspect-[9/13]',
            'aspect-[4/5]',
          ];
          const aspectClass = TURTLE_ASPECTS[idx % TURTLE_ASPECTS.length];
          const displayImage = getOptimizedImageUrl(creation.artworkImage, { width: 800, quality: 'auto' });

          return (
            <div key={creation.id} className="break-inside-avoid mb-3 sm:mb-4 md:mb-6">
              <div
                className="group relative flex flex-col cursor-pointer select-none"
                onClick={() => setSelectedCreation(creation)}
              >
                {/* 1. Clean Pinterest Media Container */}
                <div
                  className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#07050d] border border-white/5 group-hover:border-amber-500/40 transition-all duration-300 shadow-sm group-hover:shadow-lg`}
                >
                  <Image
                    src={displayImage}
                    alt={creation.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Play Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/15">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCreation(creation);
                            setIsEditorOpen(true);
                          }}
                          className="p-0.5 rounded-full hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                          title="Edit Python Art"
                        >
                          <Edit3 className="w-3 h-3 text-amber-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCreation(creation.id);
                          }}
                          className="p-0.5 rounded-full hover:bg-red-500/30 text-slate-200 hover:text-red-400 transition-colors"
                          title="Delete Python Art"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Pinterest Bottom Row: Clean Title & Play icon */}
                <div className="pt-1.5 px-0.5 flex items-center justify-between gap-1">
                  <h3 className="text-[12px] sm:text-[13px] font-medium text-slate-200 group-hover:text-amber-300 transition-colors truncate flex-1">
                    {creation.title}
                  </h3>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCreation(creation);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-white transition-colors flex-shrink-0"
                    title="Play & view code"
                    aria-label="Play & view code"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
