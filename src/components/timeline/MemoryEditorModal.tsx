'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Camera,
  Film,
  Sparkles,
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Zap,
  Link2,
  RefreshCw,
  Play,
  FileText,
} from 'lucide-react';
import { MemoryItem } from '@/types';
import { uploadMediaWithProgress, UploadProgressEvent } from '@/lib/cloudinaryUpload';
import { isMediaVideo } from '@/lib/utils';

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
  const [date, setDate] = useState(
    editingMemory?.date ||
      new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  );
  const [location, setLocation] = useState(editingMemory?.location || '');
  const [description, setDescription] = useState(editingMemory?.description || '');
  const [isFavorite, setIsFavorite] = useState(Boolean(editingMemory?.isFavorite));
  const [showUrlInput, setShowUrlInput] = useState(Boolean(editingMemory?.url && !editingMemory?.url.includes('cloudinary.com')));

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [compressionStats, setCompressionStats] = useState<{
    originalSizeStr: string;
    finalSizeStr: string;
    savedPercent: number;
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen]);

  // Sync editing memory when opening
  useEffect(() => {
    if (editingMemory) {
      setType(editingMemory.type || 'photo');
      setTitle(editingMemory.title || '');
      setUrl(editingMemory.url || '');
      setThumbnailUrl(editingMemory.thumbnailUrl || '');
      setDate(editingMemory.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      setLocation(editingMemory.location || '');
      setDescription(editingMemory.description || '');
      setIsFavorite(Boolean(editingMemory.isFavorite));
    }
  }, [editingMemory, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setIsUploading(true);
    setUploadProgress(5);
    setUploadMessage('Preparing upload...');
    setCompressionStats(null);
    setUploadError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await uploadMediaWithProgress(file, {
        folder: 'mili_universe_memories',
        signal: controller.signal,
        onProgress: (evt: UploadProgressEvent) => {
          setUploadProgress(evt.percent);
          setUploadMessage(evt.message);
          if (evt.savedStats) {
            setCompressionStats(evt.savedStats);
          }
        },
      });

      setUrl(result.url);
      setThumbnailUrl(result.thumbnailUrl || result.url);
      if (result.resourceType) {
        setType(result.resourceType);
      } else if (file.type.startsWith('video/')) {
        setType('video');
      }
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        setUploadError('Upload was cancelled.');
      } else {
        console.error('Upload failed:', err);
        setUploadError(
          err?.message || 'Upload failed. Please check network connection or try again.'
        );
      }
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    setIsSaving(true);
    const memoryRecord: MemoryItem = {
      id:
        editingMemory?.id ||
        `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      type: isMediaVideo(url) ? 'video' : type,
      url: url.trim(),
      thumbnailUrl: thumbnailUrl.trim() || url.trim(),
      date: date.trim() || 'A special moment',
      location: location.trim(),
      description: description.trim(),
      isFavorite,
      aspectRatio: 'landscape',
      createdAt: editingMemory?.createdAt || new Date().toISOString(),
    };

    try {
      await onSave(memoryRecord);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const hasMedia = Boolean(url.trim());
  const isVideoMedia = isMediaVideo(url) || type === 'video';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999999] bg-[#06040a]/90 backdrop-blur-xl flex flex-col items-center justify-end sm:justify-center p-0 sm:p-6 overflow-y-auto">
        {/* Modal Window / Bottom Sheet on Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl bg-gradient-to-b from-[#130b24] to-[#0a0614] border border-white/15 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col text-slate-200"
        >
          {/* Mobile Top Drag Handle Indicator */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-roseGlow-500/15 border border-roseGlow-500/30 flex items-center justify-center text-roseGlow-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {editingMemory ? 'Edit Memory' : 'Upload to Vault'}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Cloudinary high-definition photo & video storage
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isUploading || isSaving}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10">
            {/* 1. Media Type Segmented Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setType('photo')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'photo'
                    ? 'bg-roseGlow-500 text-white shadow-glow font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setType('video')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'video'
                    ? 'bg-purple-600 text-white shadow-glow font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Video</span>
              </button>
            </div>

            {/* 2. Media Upload & Live Interactive Preview Area */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                id="vault-file-picker"
                accept={type === 'video' ? 'video/*' : 'image/*'}
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />

              {/* Uploading Progress View */}
              {isUploading ? (
                <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/40 space-y-3.5 text-center">
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-purple-300 font-medium flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                      <span>{uploadMessage || 'Uploading to Cloudinary...'}</span>
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {uploadProgress}%
                    </span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-2.5 bg-obsidian-950 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      className="h-full bg-gradient-to-r from-roseGlow-500 via-purple-500 to-cyan-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Optimization Badge */}
                  {compressionStats && compressionStats.savedPercent > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        Optimized: {compressionStats.originalSizeStr} ➔ {compressionStats.finalSizeStr} ({compressionStats.savedPercent}% lighter)
                      </span>
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="text-xs text-roseGlow-400 hover:text-roseGlow-300 underline"
                    >
                      Cancel Upload
                    </button>
                  </div>
                </div>
              ) : hasMedia ? (
                /* Media Uploaded - Interactive Live Preview Card */
                <div className="relative rounded-2xl overflow-hidden border border-roseGlow-500/40 bg-black/60 shadow-lg">
                  <div className="relative aspect-[16/9] w-full bg-obsidian-950 flex items-center justify-center">
                    {isVideoMedia ? (
                      <video
                        src={url}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image
                        src={url}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-contain"
                      />
                    )}

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 text-[11px] font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready in Vault</span>
                      </span>
                    </div>

                    {/* Change Media Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2.5 right-2.5 px-3 py-1 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-md border border-white/20 text-xs font-mono flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <RefreshCw className="w-3 h-3 text-roseGlow-400" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Dropzone Card */
                <label
                  htmlFor="vault-file-picker"
                  className="cursor-pointer group flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-dashed border-white/20 hover:border-roseGlow-500/50 transition-all text-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-roseGlow-500/20 to-purple-600/20 border border-white/10 group-hover:scale-110 group-hover:border-roseGlow-500/40 transition-all flex items-center justify-center text-roseGlow-300 mb-2.5 shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-roseGlow-200 transition-colors">
                    Tap to select {type === 'video' ? 'video' : 'photo'} from device
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 font-mono">
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> Auto-optimizing
                    </span>
                    <span>•</span>
                    <span>JPG, PNG, WEBP, MP4, MOV</span>
                  </div>
                </label>
              )}
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Optional Collapsible Direct URL Link */}
            <div className="pt-0.5">
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[11px] font-mono text-slate-400 hover:text-roseGlow-300 transition-colors flex items-center gap-1"
                >
                  <Link2 className="w-3 h-3" />
                  <span>Or paste external image/video link</span>
                </button>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                      <Link2 className="w-3 h-3 text-roseGlow-400" />
                      <span>Direct Media URL</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Hide
                    </button>
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/... or any media URL"
                    className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50 font-mono"
                  />
                </div>
              )}
            </div>

            {/* 3. Title / Caption Field */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Title / Caption *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Stargazing by the Lake, Kolkata Sunset..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
              />
            </div>

            {/* 4. Date & Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-roseGlow-400" />
                  <span>Date / Moment</span>
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g., September 1, 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>Location / Tag</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Favorite Café, Rooftop"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50"
                />
              </div>
            </div>

            {/* 5. Memory Story / Note (Optional) */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-roseGlow-400" />
                <span>Memory Story / Note (Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a sweet memory or note about this moment..."
                className="w-full px-3.5 py-2 rounded-xl bg-obsidian-950 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/50 resize-none"
              />
            </div>

            {/* 6. Cherished Favorite Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded accent-roseGlow-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5 text-roseGlow-300">
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-roseGlow-400 text-roseGlow-400' : 'text-slate-400'}`} />
                  <span>Mark as Cherished Favorite</span>
                </span>
              </label>
            </div>

            {/* 7. Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading || isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving || isUploading || !url.trim() || !title.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-roseGlow-500 to-purple-600 hover:from-roseGlow-400 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-glow transition-all disabled:opacity-40 flex items-center gap-2"
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
