'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Code2, Sparkles, BookOpen, Clock } from 'lucide-react';
import { calculateDaysTogether } from '@/lib/utils';
import { APP_CONFIG } from '@/data/config';
import { INITIAL_PROJECTS } from '@/data/projects';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';

export const MemoryCounter: React.FC = () => {
  const [time, setTime] = useState(calculateDaysTogether(APP_CONFIG.anniversaryDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTime(calculateDaysTogether(APP_CONFIG.anniversaryDate));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: "Days of Memories",
      value: mounted ? `${time.days}d ${time.hours}h ${time.minutes}m` : "...",
      subtext: "Since our journey started",
      icon: Clock,
      color: "text-roseGlow-400",
      bgGlow: "group-hover:border-roseGlow-500/40",
    },
    {
      label: "Digital Creations",
      value: `${INITIAL_PROJECTS.length} Projects`,
      subtext: "Websites & interactive apps",
      icon: Code2,
      color: "text-purple-400",
      bgGlow: "group-hover:border-purple-500/40",
    },
    {
      label: "Python Artworks",
      value: `${INITIAL_TURTLE_CREATIONS.length} Designs`,
      subtext: "Drawn with code for you",
      icon: Sparkles,
      color: "text-amber-400",
      bgGlow: "group-hover:border-amber-500/40",
    },
    {
      label: "Love Notes & Letters",
      value: `${INITIAL_LOVE_NOTES.length} Letters`,
      subtext: "Written straight from heart",
      icon: BookOpen,
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
