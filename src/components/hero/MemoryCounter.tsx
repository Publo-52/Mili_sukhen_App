'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Code2, Sparkles, BookOpen, Clock, Camera, Film } from 'lucide-react';
import { calculateDaysTogether } from '@/lib/utils';
import { APP_CONFIG } from '@/data/config';
import { getProjects, getTurtleCreations, getLoveNotes, getMemories } from '@/lib/storage';

export const MemoryCounter: React.FC = () => {
  const [time, setTime] = useState(calculateDaysTogether(APP_CONFIG.anniversaryDate));
  const [mounted, setMounted] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [turtleCount, setTurtleCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [memoryCount, setMemoryCount] = useState(0);

  const refreshCounts = useCallback(async () => {
    // 1. Instant local baseline
    setProjectCount(getProjects().length);
    setTurtleCount(getTurtleCreations().length);
    setNoteCount(getLoveNotes().length);
    setMemoryCount(getMemories().length);

    // 2. Fresh fetch from server/Supabase
    try {
      const [pRes, tRes, nRes, mRes] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch('/api/turtle', { cache: 'no-store' }),
        fetch('/api/love-notes', { cache: 'no-store' }),
        fetch('/api/memories', { cache: 'no-store' }),
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData?.projects) setProjectCount(pData.projects.length);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        if (tData?.creations) setTurtleCount(tData.creations.length);
      }
      if (nRes.ok) {
        const nData = await nRes.json();
        if (nData?.notes) setNoteCount(nData.notes.length);
      }
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData?.memories) setMemoryCount(mData.memories.length);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setMounted(true);
    refreshCounts();

    const updateTimer = () => {
      setTime(calculateDaysTogether(APP_CONFIG.anniversaryDate));
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    const syncInterval = setInterval(refreshCounts, 8000);

    const handleSync = () => refreshCounts();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshCounts();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleSync);
    window.addEventListener('mili-projects-updated', handleSync);
    window.addEventListener('mili-turtle-updated', handleSync);
    window.addEventListener('mili-notes-updated', handleSync);
    window.addEventListener('mili-memories-updated', handleSync);

    return () => {
      clearInterval(timerInterval);
      clearInterval(syncInterval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('mili-projects-updated', handleSync);
      window.removeEventListener('mili-turtle-updated', handleSync);
      window.removeEventListener('mili-notes-updated', handleSync);
      window.removeEventListener('mili-memories-updated', handleSync);
    };
  }, [refreshCounts]);

  const stats = [
    {
      label: "Days of Memories",
      value: mounted ? `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s` : "...",
      subtext: "Since Oct 14, 2025",
      icon: Clock,
      color: "text-roseGlow-400",
      bgGlow: "group-hover:border-roseGlow-500/40",
    },
    {
      label: "Digital Creations",
      value: mounted ? `${projectCount} Projects` : "...",
      subtext: "Websites & interactive apps",
      icon: Code2,
      color: "text-purple-400",
      bgGlow: "group-hover:border-purple-500/40",
    },
    {
      label: "Python Artworks",
      value: mounted ? `${turtleCount} Designs` : "...",
      subtext: "Drawn with code for you",
      icon: Sparkles,
      color: "text-amber-400",
      bgGlow: "group-hover:border-amber-500/40",
    },
    {
      label: "Photos & Videos",
      value: mounted ? `${memoryCount} Moments` : "...",
      subtext: "Cloudinary HD media vault",
      icon: Camera,
      color: "text-pink-400",
      bgGlow: "group-hover:border-pink-500/40",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`group glass-card glass-card-hover p-3.5 sm:p-5 md:p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${stat.bgGlow}`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-mono text-slate-400 truncate max-w-[80%]">
                  {stat.label}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-xl bg-white/5 ${stat.color}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="text-base sm:text-xl md:text-2xl font-bold font-sans text-slate-100 mb-1 tracking-tight">
                {stat.value}
              </div>
              <p className="text-[10px] sm:text-[12px] text-slate-400 font-sans line-clamp-1">
                {stat.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
