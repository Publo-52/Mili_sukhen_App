import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Video, Sparkles, MapPin, Calendar, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { MemoryItem } from '@/types';

interface MemoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: MemoryItem) => Promise<void> | void;
  editingMemory?: MemoryItem | null;
}

export const MemoryEditorModal: React.FC<MemoryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMemory,
}) => {
  const [mounted, setMounted] = useState(false);
  const [type, setType] = useState<'photo' | 'video'>(editingMemory?.type || 'photo');
  const [title, setTitle] = useState(editingMemory?.title || '');
  const [url, setUrl] = useState(editingMemory?.url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(editingMemory?.thumbnailUrl || '');
  const [date, setDate] = useState(editingMemory?.date || new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }));
  const [location, setLocation] = useState(editingMemory?.location || '');
  const [description, setDescription] = useState(editingMemory?.description || '');
  const [isFavorite, setIsFavorite] = useState(Boolean(editingMemory?.isFavorite));
  const [aspectRatio, setAspectRatio] = useState<'portrait' | 'landscape' | 'square'>(editingMemory?.aspectRatio || 'landscape');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ss5tzziw';
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'mili_preset';

      let uploadSuccess = false;
      let data: any = null;

      // 1. Direct Cloudinary Client-Side Upload (Fastest, supports HD photos & videos, bypasses server limits)
      try {
        const directFormData = new FormData();
        directFormData.append('file', file);
        directFormData.append('upload_preset', preset);
        directFormData.append('folder', 'mili_universe_memories');

        const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: directFormData,
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          let thumb = directData.secure_url;
          if (directData.resource_type === 'video') {
            thumb = directData.secure_url.replace(/\.[^/.]+$/, '.jpg');
          }
          data = {
            url: directData.secure_url,
            thumbnailUrl: thumb,
            resourceType: directData.resource_type === 'video' ? 'video' : 'photo',
          };
          uploadSuccess = true;
        } else {
          const errData = await directRes.json().catch(() => null);
          console.warn('Direct upload response not ok:', errData);
        }
      } catch (directErr) {
        console.warn('Direct upload error, falling back to server route:', directErr);
      }

      // 2. Server Route Fallback
      if (!uploadSuccess) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('resourceType', type);

        const res = await fetch('/api/cloudinary/upload', {
          method: 'POST',
          body: formData,
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          throw new Error('Server returned non-JSON response (' + res.status + ')');
        }

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to upload to Cloudinary');
        }
      }

      setUrl(data.url);
      setThumbnailUrl(data.thumbnailUrl || data.url);
      if (data.resourceType) setType(data.resourceType);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err?.message || 'Upload failed. Please check network or paste a direct image URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSaving(true);
    const memoryRecord: MemoryItem = {
      id: editingMemory?.id || `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      type,
      url: url.trim(),
      thumbnailUrl: thumbnailUrl.trim() || url.trim(),
      date: date.trim() || 'A special moment',
      location: location.trim(),
      description: description.trim(),
      isFavorite,
      aspectRatio,
      createdAt: editingMemory?.createdAt || new Date().toISOString(),
    };

    try {
      await onSave(memoryRecord);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-[#06040a]/95 backdrop-blur-2xl flex flex-col items-center justify-start sm:justify-center p-3 sm:p-6 pt-10 sm:pt-6 pb-24 sm:pb-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-obsidian-950 border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-7 my-auto max-h-[85vh] overflow-y-auto text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingMemory ? 'Edit Memory' : 'Upload Photo / Video to Vault'}
                </h3>
                <p className="text-xs text-slate-400">Stored in Cloudinary with instant real-time sync</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Type Selector (Photo vs Video) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('photo')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  type === 'photo'
                    ? 'bg-roseGlow-500/20 border-roseGlow-500/50 text-roseGlow-300 shadow-glow'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>📸 Photo / Image</span>
              </button>
              <button
                type="button"
                onClick={() => setType('video')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  type === 'video'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-glow'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>🎬 Video Moment</span>
              </button>
            </div>

            {/* Cloudinary File Upload Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/20 hover:border-purple-400/50 transition-colors text-center">
              <input
                type="file"
                id="memory-file-upload"
                accept={type === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="memory-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-2 py-2"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                    <span className="text-xs text-purple-300 font-mono">Uploading to Cloudinary...</span>
                  </div>
                ) : (
                  <>
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-300">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white">
                      Click to select {type === 'video' ? 'video file' : 'photo'} from your device
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP, MP4, MOV, WebM
                    </span>
                  </>
                )}
              </label>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Direct URL Input */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Media URL (Cloudinary / Web URL) *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/... or any image/video URL"
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Live Media Preview if URL available */}
            {url && (
              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-obsidian-950 border border-white/10">
                {type === 'video' ? (
                  <video
                    src={url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={url}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            )}

            {/* Title / Caption */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Title / Caption *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Stargazing by the Lake, Our First Roadtrip..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Date & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  <Calendar className="w-3 h-3 inline mr-1 text-roseGlow-400" />
                  Date / Moment
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g., October 14, 2025"
                  className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1 text-purple-400" />
                  Location / Tag
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Favorite Café, Kolkata, Sunset Point"
                  className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Description / Emotional Note */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Memory Story / Note
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a sweet memory or story about this moment..."
                className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
              />
            </div>

            {/* Favorite Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is-fav-memory"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-roseGlow-500 bg-obsidian-950 border-white/20 focus:ring-roseGlow-500 cursor-pointer"
              />
              <label htmlFor="is-fav-memory" className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-roseGlow-400 text-roseGlow-400' : 'text-slate-400'}`} />
                <span>Mark as Cherished Favorite</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs sm:text-sm text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !url.trim() || !title.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-roseGlow-500 to-purple-600 hover:from-roseGlow-400 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingMemory ? 'Update Memory' : 'Save to Vault'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
