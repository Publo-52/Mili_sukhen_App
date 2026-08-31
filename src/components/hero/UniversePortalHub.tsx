'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Terminal, History, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { SectionType } from '@/types';

interface UniversePortalHubProps {
  onSelectSection: (section: SectionType) => void;
  counts: {
    projects: number;
    turtles: number;
    memories: number;
    loveNotes: number;
  };
}

export const UniversePortalHub: React.FC<UniversePortalHubProps> = ({
  onSelectSection,
  counts,
}) => {
  const portals = [
    {
      id: 'projects' as SectionType,
      title: 'Websites & Interactive Apps',
      description: `${counts.projects} custom web applications and interactive surprises coded specially for Mili.`,
      badge: `${counts.projects} Live Projects`,
      icon: Layers,
      color: 'from-blue-500/20 via-purple-500/20 to-roseGlow-500/20 border-blue-500/30 text-blue-300',
      btnGradient: 'from-blue-600 via-indigo-600 to-purple-600',
    },
    {
      id: 'turtle' as SectionType,
      title: 'Python Turtle Art Gallery',
      description: `${counts.turtles} mathematical geometry sketches, mandalas, and generative animations.`,
      badge: `${counts.turtles} Artworks`,
      icon: Terminal,
      color: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-500/30 text-emerald-300',
      btnGradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    },
    {
      id: 'memories' as SectionType,
      title: 'Our Sacred Memories Timeline',
      description: `${counts.memories} cherished milestones, journey dates, and moments together since 2022.`,
      badge: `${counts.memories} Milestones`,
      icon: History,
      color: 'from-amber-500/20 via-orange-500/20 to-pink-500/20 border-amber-500/30 text-amber-300',
      btnGradient: 'from-amber-600 via-orange-600 to-pink-600',
    },
    {
      id: 'love-notes' as SectionType,
      title: 'Private Love Notes Vault',
      description: `${counts.loveNotes} auto-rotating letters, heartfelt promises, and quiet late-night thoughts.`,
      badge: `${counts.loveNotes} Letters`,
      icon: BookOpen,
      color: 'from-roseGlow-500/20 via-pink-500/20 to-purple-500/20 border-roseGlow-500/30 text-roseGlow-300',
      btnGradient: 'from-roseGlow-600 via-pink-600 to-purple-600',
    },
  ];

  return (
    <section className="pt-1 pb-4 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-roseGlow-300 text-xs font-mono tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
          <span>Explore Portals</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Enter Your Dedicated Worlds
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto font-light">
          Tap any portal below to step directly into that dedicated realm.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {portals.map((p, idx) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/10 hover:border-roseGlow-500/40 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group shadow-xl"
            >
              {/* Background ambient accent */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-roseGlow-500/10 rounded-full blur-2xl group-hover:bg-roseGlow-500/20 transition-all pointer-events-none" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-roseGlow-400" />
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border bg-gradient-to-r ${p.color}`}>
                    {p.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-roseGlow-200 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {p.description}
                </p>
              </div>

              <button
                onClick={() => onSelectSection(p.id)}
                className={`w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r ${p.btnGradient} hover:opacity-95 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-glow transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer active:scale-98`}
              >
                <span>Enter Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
