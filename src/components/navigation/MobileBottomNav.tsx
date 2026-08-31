'use client';

import React from 'react';
import { Home, Layers, Sparkles, History, HeartHandshake, MessageSquareHeart } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const items = [
    { label: 'Home', href: '/#hero', icon: Home },
    { label: 'Projects', href: '/#projects', icon: Layers },
    { label: 'Python Art', href: '/#python-art', icon: Sparkles },
    { label: 'Memories', href: '/#memories', icon: History },
    { label: 'Love Notes', href: '/#love-notes', icon: HeartHandshake },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-obsidian-950/90 backdrop-blur-xl border-t border-white/10 px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center p-1 text-slate-400 hover:text-roseGlow-400 active:text-roseGlow-500 transition-colors"
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-sans font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
