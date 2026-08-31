'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code2, Maximize2, Terminal, Play, Heart } from 'lucide-react';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { TurtleCreation } from '@/types';
import { formatDate } from '@/lib/utils';
import { FullscreenLightbox } from './FullscreenLightbox';

export const TurtleGallery: React.FC = () => {
  const [selectedCreation, setSelectedCreation] = useState<TurtleCreation | null>(null);

  return (
    <section id="python-art" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Section Header */}
      <div className="text-center space-y-4 mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono tracking-widest uppercase">
          <Terminal className="w-3.5 h-3.5" />
          <span>Things I Drew For You</span>
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
        {INITIAL_TURTLE_CREATIONS.map((creation, idx) => (
          <motion.div
            key={creation.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col border border-white/10"
          >
            {/* Visual Thumbnail */}
            <div className="relative aspect-square w-full overflow-hidden bg-[#07050d]">
              <img
                src={creation.artworkImage}
                alt={creation.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent" />

              {/* Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                <Code2 className="w-3 h-3" />
                <span>Python Turtle</span>
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
                <h3 className="text-base font-bold text-white group-hover:text-roseGlow-300 transition-colors">
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
    </section>
  );
};
