'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, MapPin, ExternalLink, Heart, Clock } from 'lucide-react';
import { INITIAL_MEMORIES } from '@/data/memories';

export const MemoriesTimeline: React.FC = () => {
  return (
    <section id="memories" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono tracking-widest uppercase">
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline of Our Journey</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Milestones & Cherished Memories
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-light">
          From the first spark to every digital world created—a chronological map of the days that defined our forever.
        </p>
      </div>

      {/* Timeline Tree */}
      <div className="relative">
        {/* Glowing Center Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-roseGlow-500 via-purple-500 to-amber-500 opacity-40" />

        <div className="space-y-12 md:space-y-16">
          {INITIAL_MEMORIES.map((memory, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start ${
                  isEven ? 'md:flex-row-reverse' : ''
                } gap-8 pl-10 md:pl-0`}
              >
                {/* Center Glowing Milestone Node */}
                <div className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 w-8 h-8 rounded-full bg-obsidian-950 border-2 border-roseGlow-500 flex items-center justify-center text-roseGlow-400 shadow-glow z-10">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>

                {/* Content Card */}
                <div className="w-full md:w-[calc(50%-2.5rem)]">
                  <div className="glass-card glass-card-hover rounded-3xl p-6 sm:p-7 space-y-4 border border-white/10 relative overflow-hidden">
                    {/* Year & Badge Header */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-roseGlow-400 px-3 py-1 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/20">
                        {memory.year} • {memory.date}
                      </span>
                      {memory.badge && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {memory.badge}
                        </span>
                      )}
                    </div>

                    {/* Image Preview if available */}
                    {memory.image && (
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-obsidian-900 border border-white/5">
                        <Image
                          src={memory.image}
                          alt={memory.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {memory.title}
                      </h3>
                      <p className="text-sm text-slate-300 font-light leading-relaxed">
                        {memory.description}
                      </p>
                    </div>

                    {/* Emotional Note Quote */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border-l-2 border-roseGlow-500 text-xs sm:text-sm font-serif italic text-roseGlow-200/90 leading-relaxed">
                      “{memory.emotionalNote}”
                    </div>

                    {/* Footer Details: Location & Linked Project */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400 font-mono">
                      {memory.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-roseGlow-400" />
                          <span>{memory.location}</span>
                        </div>
                      )}

                      {memory.projectLink && (
                        <Link
                          href={memory.projectLink}
                          className="inline-flex items-center gap-1 text-roseGlow-400 hover:text-white transition-colors"
                        >
                          <span>{memory.projectTitle || 'View Project'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
