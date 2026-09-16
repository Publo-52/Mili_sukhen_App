'use client';

import React from 'react';
import { Home, Layers, Sparkles, Film, History, BookOpen } from 'lucide-react';
import { SectionType } from '@/types';

interface MobileBottomNavProps {
  activeSection?: SectionType;
  onSelectSection?: (section: SectionType) => void;
}

const BOTTOM_NAV_ITEMS: { label: string; sectionId: SectionType; icon: React.ElementType }[] = [
  { label: 'Home', sectionId: 'home', icon: Home },
  { label: 'Projects', sectionId: 'projects', icon: Layers },
  { label: 'Art', sectionId: 'turtle', icon: Sparkles },
  { label: 'Reels', sectionId: 'reels', icon: Film },
  { label: 'Memories', sectionId: 'memories', icon: History },
  { label: 'Notes', sectionId: 'love-notes', icon: BookOpen },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeSection = 'home',
  onSelectSection,
}) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentActive = isMounted ? (activeSection || 'home') : 'home';

  const handleClick = (sectionId: SectionType, e: React.MouseEvent) => {
    if (onSelectSection) {
      e.preventDefault();
      onSelectSection(sectionId);
    }
  };

  return (
    <nav
      suppressHydrationWarning
      className={`fixed bottom-0 left-0 right-0 z-30 bg-obsidian-950/95 backdrop-blur-2xl px-2 py-1.5 safe-area-pb shadow-2xl transition-all ${
        activeSection === 'reels' ? 'block' : 'md:hidden'
      }`}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.sectionId;

          return (
            <button
              key={item.sectionId}
              suppressHydrationWarning
              onClick={(e) => handleClick(item.sectionId, e)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? 'text-roseGlow-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 sm:w-[22px] sm:h-[22px] mb-1 transition-all duration-200 ${
                  isActive
                    ? 'text-roseGlow-400 stroke-[2.3] scale-110 drop-shadow-[0_0_10px_rgba(244,63,94,0.65)]'
                    : 'stroke-[1.85]'
                }`}
              />
              <span className={`text-[10px] sm:text-[11px] font-sans tracking-tight leading-none transition-colors ${
                isActive ? 'font-bold text-roseGlow-300' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
