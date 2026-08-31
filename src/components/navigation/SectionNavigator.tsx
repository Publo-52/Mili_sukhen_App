'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Layers, Terminal, History, BookOpen, Heart } from 'lucide-react';

export type SectionType = 'all' | 'projects' | 'turtle' | 'memories' | 'love-notes';

interface SectionNavigatorProps {
  activeSection: SectionType;
  onSelectSection: (section: SectionType) => void;
  counts?: {
    projects?: number;
    turtles?: number;
    memories?: number;
    loveNotes?: number;
  };
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  activeSection,
  onSelectSection,
  counts,
}) => {
  const sections: { id: SectionType; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'all', label: 'All Universe', icon: Sparkles },
    { id: 'projects', label: 'Websites & Projects', icon: Layers, count: counts?.projects },
    { id: 'turtle', label: 'Python Art', icon: Terminal, count: counts?.turtles },
    { id: 'memories', label: 'Memories Timeline', icon: History, count: counts?.memories },
    { id: 'love-notes', label: 'Love Notes', icon: BookOpen, count: counts?.loveNotes },
  ];

  return (
    <div className="sticky top-16 sm:top-20 z-30 py-2.5 px-3 sm:px-6 max-w-4xl mx-auto w-full pointer-events-auto">
      <div className="glass-nav rounded-2xl p-1.5 border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap bg-obsidian-950/85 backdrop-blur-xl">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.id)}
              className={`relative px-3 sm:px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all duration-300 flex items-center gap-2 flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSectionIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 rounded-xl shadow-glow -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-roseGlow-400'}`} />
              <span>{sec.label}</span>
              {sec.count !== undefined && sec.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-black/30 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {sec.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
