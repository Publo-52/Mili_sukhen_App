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
      data-no-swipe="true"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999999,
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        overscrollBehavior: 'none',
      }}
      className={`fixed-bottom-nav bg-[#06040a]/98 backdrop-blur-2xl px-1 py-1.5 safe-area-pb shadow-[0_-4px_25px_rgba(0,0,0,0.9)] border-t border-white/15 select-none overflow-hidden ${
        activeSection === 'reels' ? 'block' : 'md:hidden'
      }`}
    >
      <div className="flex items-center justify-between w-full max-w-lg mx-auto px-0.5">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.sectionId;

          return (
            <button
              key={item.sectionId}
              suppressHydrationWarning
              data-no-swipe="true"
              onClick={(e) => handleClick(item.sectionId, e)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                isActive
                  ? 'text-roseGlow-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`w-5 h-5 mb-0.5 transition-all duration-200 pointer-events-none ${
                  isActive
                    ? 'text-roseGlow-400 stroke-[2.4] scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                    : 'stroke-[1.8]'
                }`}
              />
              <span className={`text-[10px] sm:text-[11px] font-sans tracking-tight leading-none truncate w-full text-center pointer-events-none ${
                isActive ? 'font-bold text-roseGlow-300' : 'font-medium text-slate-400'
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
