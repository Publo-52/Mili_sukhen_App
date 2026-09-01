'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Heart,
  Calendar,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Maximize2,
  Play,
  Film,
  Camera,
} from 'lucide-react';
import { MemoryItem } from '@/types';
import {
  getMemories,
  saveMemory,
  deleteMemory,
  getFavoriteMemoryIds,
  toggleFavoriteMemory,
} from '@/lib/storage';
import { useAuth } from '@/lib/auth-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { APP_CONFIG } from '@/data/config';
import { getOptimizedImageUrl } from '@/lib/utils';

const MemoryEditorModal = dynamic(
  () => import('./MemoryEditorModal').then((m) => m.MemoryEditorModal),
  { ssr: false }
);
const MediaViewerModal = dynamic(
  () => import('./MediaViewerModal').then((m) => m.MediaViewerModal),
  { ssr: false }
);

// Helper to guarantee high-res image poster for Cloudinary videos and images
function getMediaThumbnail(memory: MemoryItem): string {
  const isVideo = memory.type === 'video';
  if (!isVideo && memory.url) return memory.url;

  if (memory.thumbnailUrl && !memory.thumbnailUrl.match(/\.(mp4|mov|webm|avi|mkv|m4v)$/i)) {
    return memory.thumbnailUrl;
  }

  if (memory.url) {
    if (memory.url.includes('cloudinary.com')) {
      return memory.url.replace(/\.(mp4|mov|webm|avi|mkv|m4v)$/i, '.jpg');
    }
    return memory.url;
  }

  return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop';
}

type FilterType = 'all' | 'photo' | 'video' | 'favorites';

export const MemoriesTimeline: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // Load Memories from API / Supabase with local fallback
  const loadMemories = useCallback(async () => {
    try {
      const res = await fetch('/api/memories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.memories && Array.isArray(data.memories) && data.memories.length > 0) {
          setMemories(data.memories);
          return;
        }
      }
    } catch {}
    setMemories(getMemories());
  }, []);

  useEffect(() => {
    loadMemories();
    setFavoriteIds(getFavoriteMemoryIds());

    // 1. Supabase Realtime Subscription for instant photo/video sync across devices
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('memories-realtime-sync')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'memories' },
            () => {
              loadMemories();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Memories realtime error:', err);
      }
    }

    // 2. Phone wake / tab focus listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadMemories();
    };
    const handleFocus = () => loadMemories();
    const handleSyncEvent = () => loadMemories();

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mili-memories-updated', handleSyncEvent);

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mili-memories-updated', handleSyncEvent);
    };
  }, [loadMemories]);

  // Filtered Memories
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      if (activeFilter === 'favorites') return favoriteIds.includes(m.id) || m.isFavorite;
      if (activeFilter === 'photo') return m.type === 'photo';
      if (activeFilter === 'video') return m.type === 'video';
      return true;
    });
  }, [memories, activeFilter, favoriteIds]);

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteMemory(id);
    setFavoriteIds(updated);
  };

  const handleSaveMemory = async (memory: MemoryItem) => {
    const updated = saveMemory(memory);
    setMemories(updated);
    setIsEditorOpen(false);
    setEditingMemory(null);

    try {
      await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ memory }),
      });
    } catch {}

    window.dispatchEvent(new Event('mili-memories-updated'));
    await loadMemories();
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to remove this photo/video memory?')) return;

    const updated = deleteMemory(id);
    setMemories(updated);

    try {
      await fetch(`/api/memories?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
      });
    } catch {}

    window.dispatchEvent(new Event('mili-memories-updated'));
    await loadMemories();
  };

  return (
    <section id="memories" className="pt-1 pb-6 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono tracking-wider uppercase">
          <Film className="w-3.5 h-3.5" />
          <span>Cloudinary Photo & Video Vault</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Moments & Memories of Us
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto font-light leading-relaxed">
          High-definition photos and videos celebrating our journey—hosted in the cloud and streaming in real-time.
        </p>

        {/* Admin Action Button */}
        {isAdmin && (
          <div className="pt-2 flex items-center justify-center">
            <button
              onClick={() => {
                setEditingMemory(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-roseGlow-500 to-purple-600 hover:from-roseGlow-400 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Photo / Video</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        {[
          { id: 'all', label: `All Moments (${memories.length})`, icon: Film },
          { id: 'photo', label: `Photos (${memories.filter((m) => m.type === 'photo').length})`, icon: Camera },
          { id: 'video', label: `Videos (${memories.filter((m) => m.type === 'video').length})`, icon: Video },
          { id: 'favorites', label: `Favorites (${favoriteIds.length})`, icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as FilterType)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                isActive
                  ? 'bg-roseGlow-500 text-white shadow-glow font-bold'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Memories Media Grid */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl glass-card border border-white/10 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
            <Camera className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No media in this album yet</h4>
            <p className="text-xs text-slate-400">
              {isAdmin
                ? 'Click below to upload photos or videos directly to Cloudinary.'
                : 'New memories will appear here soon.'}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingMemory(null);
                setIsEditorOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Upload First Photo / Video</span>
            </button>
          )}
        </div>
      ) : (
        <div className="columns-2 md:columns-2 lg:columns-3 gap-3 sm:gap-4 md:gap-6 [column-fill:_balance]">
          {filteredMemories.map((memory, index) => {
            const isFav = favoriteIds.includes(memory.id) || memory.isFavorite;
            const isVideo = memory.type === 'video';

            const MEMORY_ASPECTS = [
              'aspect-[3/4]',
              'aspect-[1/1]',
              'aspect-[9/13]',
              'aspect-[4/5]',
              'aspect-[16/11]',
              'aspect-[3/4]',
            ];
            const aspectClass = MEMORY_ASPECTS[index % MEMORY_ASPECTS.length];
            const displayThumbnail = getOptimizedImageUrl(getMediaThumbnail(memory), {
              width: 800,
              quality: 'auto',
            });

            return (
              <div key={memory.id} className="break-inside-avoid mb-3 sm:mb-4 md:mb-6">
                <div
                  className="group relative flex flex-col cursor-pointer select-none"
                  onClick={() => setViewerIndex(index)}
                >
                  {/* High-Performance Media Container with Next.js Image Optimization */}
                  <div
                    className={`relative ${aspectClass} w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-obsidian-950 border border-white/5 group-hover:border-roseGlow-500/40 transition-all duration-300 shadow-sm group-hover:shadow-lg`}
                  >
                    <Image
                      src={displayThumbnail}
                      alt={memory.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Video Top-Left Badge */}
                    {isVideo && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-purple-300 border border-purple-500/40 flex items-center gap-1 shadow-md z-10">
                        <Video className="w-3 h-3 text-purple-400" />
                        <span>VIDEO</span>
                      </div>
                    )}

                    {/* Video Center Play Button */}
                    {isVideo && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg border border-purple-400/50 group-hover:scale-110 group-hover:bg-purple-500 transition-all">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Top Right: Favorite Heart & Admin Edit */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      {isAdmin && (
                        <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/15">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMemory(memory);
                              setIsEditorOpen(true);
                            }}
                            className="p-0.5 rounded-full hover:bg-white/20 text-slate-200 hover:text-white transition-colors"
                            title="Edit Memory"
                          >
                            <Edit3 className="w-3 h-3 text-roseGlow-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMemory(memory.id);
                            }}
                            className="p-0.5 rounded-full hover:bg-red-500/30 text-slate-200 hover:text-red-400 transition-colors"
                            title="Delete Memory"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(memory.id);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-200 ${
                          isFav
                            ? 'bg-roseGlow-600 text-white shadow-glow'
                            : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/70'
                        }`}
                        aria-label="Favorite"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Pinterest Bottom Row: Clean Title & Date */}
                  <div className="pt-1.5 px-0.5 flex items-center justify-between gap-1">
                    <h3 className="text-[12px] sm:text-[13px] font-medium text-slate-200 group-hover:text-roseGlow-300 transition-colors truncate flex-1 flex items-center gap-1">
                      {isVideo && <Video className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                      <span className="truncate">{memory.title}</span>
                    </h3>

                    <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                      {memory.date}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Viewer Modal */}
      {viewerIndex !== null && (
        <MediaViewerModal
          isOpen={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          memories={filteredMemories}
          currentIndex={viewerIndex}
          onNavigate={(newIdx) => setViewerIndex(newIdx)}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favoriteIds.includes(filteredMemories[viewerIndex]?.id)}
        />
      )}

      {/* Memory Upload/Editor Modal */}
      {isEditorOpen && (
        <MemoryEditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingMemory(null);
          }}
          onSave={handleSaveMemory}
          editingMemory={editingMemory}
        />
      )}
    </section>
  );
};
