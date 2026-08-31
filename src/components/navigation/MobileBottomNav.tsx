'use client';

import React from 'react';
import { Home, Layers, Sparkles, History, BookOpen } from 'lucide-react';
import { SectionType } from '@/types';

interface MobileBottomNavProps {
  activeSection?: SectionType;
  onSelectSection?: (section: SectionType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection = 'all',
  onSelectSection,
}) => {
  const items: { label: string; sectionId: SectionType; icon: React.ElementType }[] = [
    { label: 'Home', sectionId: 'home', icon: Home },
    { label: 'Projects', sectionId: 'projects', icon: Layers },
    { label: 'Python Art', sectionId: 'turtle', icon: Sparkles },
    { label: 'Memories', sectionId: 'memories', icon: History },
    { label: 'Love Notes', sectionId: 'love-notes', icon: BookOpen },
  ];

  const handleClick = (sectionId: SectionType, e: React.MouseEvent) => {
    if (onSelectSection) {
      e.preventDefault();
      onSelectSection(sectionId);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-obsidian-950/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.sectionId;

          return (
            <button
              key={item.label}
              onClick={(e) => handleClick(item.sectionId, e)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-roseGlow-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-roseGlow-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : ''}`} />
              <span className="text-[10px] font-sans font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
