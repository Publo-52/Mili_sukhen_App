'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SectionType } from '@/types';
import { cachedFetch } from '@/lib/api-cache';

import { Navbar } from '@/components/navigation/Navbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { Hero } from '@/components/hero/Hero';
import { Footer } from '@/components/footer/Footer';

// Code-split heavy views dynamically with zero initial bundle bloat
const ProjectShowcase = dynamic(
  () => import('@/components/projects/ProjectShowcase').then((m) => m.ProjectShowcase),
  { ssr: false }
);
const TurtleGallery = dynamic(
  () => import('@/components/turtle/TurtleGallery').then((m) => m.TurtleGallery),
  { ssr: false }
);
const ReelsSection = dynamic(
  () => import('@/components/reels/ReelsSection').then((m) => m.ReelsSection),
  { ssr: false }
);
const MemoriesTimeline = dynamic(
  () => import('@/components/timeline/MemoriesTimeline').then((m) => m.MemoriesTimeline),
  { ssr: false }
);
const LoveNotesVault = dynamic(
  () => import('@/components/love-notes/LoveNotesVault').then((m) => m.LoveNotesVault),
  { ssr: false }
);
const CinematicIntro = dynamic(
  () => import('@/components/hero/CinematicIntro').then((m) => m.CinematicIntro),
  { ssr: false }
);

// Ambient Background Elements loaded asynchronously
const ParticleCanvas = dynamic(
  () => import('@/components/hero/ParticleCanvas').then((m) => m.ParticleCanvas),
  { ssr: false }
);
const SpecialSurpriseModal = dynamic(
  () => import('@/components/surprise/SpecialSurpriseModal').then((m) => m.SpecialSurpriseModal),
  { ssr: false }
);


const EasterEggListener = dynamic(
  () => import('@/components/easter-eggs/EasterEggListener').then((m) => m.EasterEggListener),
  { ssr: false }
);

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { safeSetLocalStorage } from '@/lib/storage';

// Eager Parallel Cache Warm-up function (pre-loads key data & assets without blocking main thread)
const warmUpAllDatasetsAndAssets = () => {
  if (typeof window === 'undefined') return;

  try {
    const safeSet = (key: string, value: string) => {
      safeSetLocalStorage(key, value);
    };

    // 1. Keep Supabase active & warm (prevents 7-day free tier auto-pause)
    fetch('/api/health').catch(() => {});

    // 2. Parallel API Cache Preload with deduplication
    const endpoints = ['/api/projects', '/api/turtle', '/api/love-notes', '/api/memories'];
    endpoints.forEach((url) => {
      cachedFetch(url)
        .then((data: any) => {
          if (!data) return;
          if (url === '/api/projects' && data.projects) {
            safeSet('mili_universe_projects', JSON.stringify(data.projects));
          } else if (url === '/api/turtle' && data.creations) {
            safeSet('mili_custom_turtle', JSON.stringify(data.creations));
          } else if (url === '/api/love-notes' && data.notes) {
            safeSet('mili_universe_love_notes', JSON.stringify(data.notes));
          } else if (url === '/api/memories' && data.memories) {
            safeSet('mili_universe_memories', JSON.stringify(data.memories));
            safeSet('mili_fav_memories_all', JSON.stringify(data.memories));
          }
        })
        .catch(() => {});
    });

    // 2. Preload critical Above-the-Fold Hero images immediately
    const criticalImages = [
      '/images/hero/mili_hero_1.png',
      '/images/hero/mili_hero_2.png',
      '/logo.png',
    ];
    criticalImages.forEach((src) => {
      try {
        const img = new Image();
        img.src = src;
      } catch {}
    });

    // 3. Defer secondary images and prefetch view chunks till browser is idle (zero main-thread blocking)
    const scheduleIdle = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback : (cb: any) => setTimeout(cb, 1200);
    scheduleIdle(() => {
      // Background preload dynamic component bundles
      import('@/components/projects/ProjectShowcase');
      import('@/components/turtle/TurtleGallery');
      import('@/components/reels/ReelsSection');
      import('@/components/timeline/MemoriesTimeline');
      import('@/components/love-notes/LoveNotesVault');
      import('@/components/hero/CinematicIntro');

      const secondaryImages = [
        '/images/hero/mili_hero_3.jpg',
        '/images/hero/mili_hero_4.png',
        '/images/hero/mili_hero_5.jpg',
      ];
      secondaryImages.forEach((src) => {
        try {
          const img = new Image();
          img.src = src;
        } catch {}
      });
    });
  } catch {}
};

import { useModalHistory } from '@/lib/modal-history';

export default function HomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modal History integrations for Surprise and Intro modals
  useModalHistory(showSurprise, () => setShowSurprise(false), 'surprise-modal');
  useModalHistory(showIntro, () => setShowIntro(false), 'intro-modal');

  // Safe SSR-matching initial activeSection
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const historyStackRef = React.useRef<SectionType[]>(['home']);

  // Track mounted sections to defer heavy views until idle or requested
  const [mountedSections, setMountedSections] = useState<Record<string, boolean>>({
    home: true,
  });

  // Ensure newly selected active section is immediately mounted
  useEffect(() => {
    setMountedSections((prev) => (prev[activeSection] ? prev : { ...prev, [activeSection]: true }));
  }, [activeSection]);

  // Gentle idle warmup: mount remaining sections after initial paint without competing for CPU
  useEffect(() => {
    const scheduleIdle =
      typeof window !== 'undefined' && typeof (window as any).requestIdleCallback === 'function'
        ? (window as any).requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 1200);

    const idleTimer = scheduleIdle(() => {
      setMountedSections({
        home: true,
        projects: true,
        turtle: true,
        reels: true,
        memories: true,
        'love-notes': true,
      });
    });

    return () => {
      if (typeof window !== 'undefined' && typeof (window as any).cancelIdleCallback === 'function') {
        try {
          (window as any).cancelIdleCallback(idleTimer);
        } catch {}
      }
    };
  }, []);

  // Eager background preload & Sync with URL Hash on load
  useEffect(() => {
    // 1. Fire full-site eager warm-up immediately
    warmUpAllDatasetsAndAssets();

    // Re-sync data whenever user returns to tab (solves stale mobile cache!)
    const handleVisibilitySync = () => {
      if (!document.hidden) {
        warmUpAllDatasetsAndAssets();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilitySync);
    window.addEventListener('focus', handleVisibilitySync);

    // 2. Prefetch Next.js routes upfront
    try {
      router.prefetch('/admin');
      router.prefetch('/login');
    } catch {}

    const parseSectionFromHash = (hash: string): SectionType => {
      const clean = hash.replace('#', '').toLowerCase();
      if (clean === 'projects') return 'projects';
      if (clean === 'python-art' || clean === 'turtle') return 'turtle';
      if (clean === 'reels') return 'reels';
      if (clean === 'memories') return 'memories';
      if (clean === 'love-notes' || clean === 'notes') return 'love-notes';
      return 'home';
    };

    const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
    if (initialHash) {
      const initialSec = parseSectionFromHash(initialHash);
      setActiveSection(initialSec);
      setMountedSections((prev) => ({ ...prev, [initialSec]: true }));
      historyStackRef.current = ['home', initialSec];
    } else {
      try {
        const saved = sessionStorage.getItem('mili_active_tab') as SectionType;
        if (saved && (saved === 'projects' || saved === 'turtle' || saved === 'reels' || saved === 'memories' || saved === 'love-notes')) {
          setActiveSection(saved);
          setMountedSections((prev) => ({ ...prev, [saved]: true }));
          historyStackRef.current = ['home', saved];
        }
      } catch {}
    }

    const handlePopState = (e: PopStateEvent) => {
      // If a modal was closed via popstate, don't change section
      if (e.state && e.state.modalOpen) {
        return;
      }
      if (e.state && e.state.section) {
        handleSelectSection(e.state.section, false);
      } else {
        const sec = parseSectionFromHash(window.location.hash);
        handleSelectSection(sec, false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSelectSection = React.useCallback(
    (section: SectionType, pushToHistory = true) => {
      const validSection: SectionType =
        section === 'projects' ||
        section === 'turtle' ||
        section === 'reels' ||
        section === 'memories' ||
        section === 'love-notes'
          ? section
          : 'home';

      setMountedSections((prev) => (prev[validSection] ? prev : { ...prev, [validSection]: true }));
      setActiveSection(validSection);
      try {
        sessionStorage.setItem('mili_active_tab', validSection);
      } catch {}

      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      } catch {
        window.scrollTo(0, 0);
      }

      const targetHash = validSection === 'home' ? '' : validSection === 'turtle' ? 'python-art' : validSection;

      if (pushToHistory) {
        // Append to local step stack
        const currentStack = historyStackRef.current;
        if (currentStack[currentStack.length - 1] !== validSection) {
          currentStack.push(validSection);
        }
        if (targetHash) {
          window.history.pushState({ section: validSection }, '', `#${targetHash}`);
        } else {
          window.history.pushState({ section: 'home' }, '', window.location.pathname);
        }
      }
    },
    []
  );

  // Section Order for Intuitive Swipe Navigation
  const SECTIONS_ORDER: SectionType[] = React.useMemo(
    () => ['home', 'projects', 'turtle', 'reels', 'memories', 'love-notes'],
    []
  );

  // Navigate to Next / Previous Section
  const navigateToNextSection = React.useCallback(() => {
    if (showSurprise || showIntro) return;
    const currentIndex = SECTIONS_ORDER.indexOf(activeSection);
    if (currentIndex >= 0 && currentIndex < SECTIONS_ORDER.length - 1) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(12);
        } catch {}
      }
      handleSelectSection(SECTIONS_ORDER[currentIndex + 1]);
    }
  }, [activeSection, showSurprise, showIntro, SECTIONS_ORDER, handleSelectSection]);

  const navigateToPrevSection = React.useCallback(() => {
    if (showSurprise) {
      setShowSurprise(false);
      return;
    }
    if (showIntro) {
      setShowIntro(false);
      return;
    }
    const currentIndex = SECTIONS_ORDER.indexOf(activeSection);
    if (currentIndex > 0) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(12);
        } catch {}
      }
      handleSelectSection(SECTIONS_ORDER[currentIndex - 1]);
    }
  }, [activeSection, showSurprise, showIntro, SECTIONS_ORDER, handleSelectSection]);

  // Step-wise Back Navigation (Handles history step reversal)
  const navigateStepBack = React.useCallback(() => {
    if (showSurprise) {
      setShowSurprise(false);
      return true;
    }
    if (showIntro) {
      setShowIntro(false);
      return true;
    }

    const stack = historyStackRef.current;
    if (stack.length > 1) {
      stack.pop();
      const previousSection = stack[stack.length - 1] || 'home';
      handleSelectSection(previousSection, false);
      return true;
    } else if (activeSection !== 'home') {
      handleSelectSection('home', false);
      return true;
    }

    return false;
  }, [activeSection, showSurprise, showIntro, handleSelectSection]);

  // Full-Screen Horizontal Touch Swipe Listener (Effortlessly move between sections)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwipeBlocked = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Don't intercept multi-touch (e.g. pinch to zoom)
      if (e.touches.length > 1) {
        isSwipeBlocked = true;
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        // Exclude interactive elements where horizontal gestures are needed (e.g. drawing canvas, code editors, inputs)
        if (
          target.closest('input, textarea, select, canvas, pre, code, [data-no-swipe], .ace_editor, input[type="range"]')
        ) {
          isSwipeBlocked = true;
          return;
        }
      }

      isSwipeBlocked = false;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isSwipeBlocked) return;
      if (!e.changedTouches || e.changedTouches.length === 0) return;

      // Don't switch section if a full modal is open
      if (showSurprise || showIntro) {
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const duration = Date.now() - touchStartTime;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Must be predominantly horizontal gesture (avoids triggering while vertical scrolling)
      if (absX > absY * 1.35) {
        // Threshold: 45px normal swipe, or 25px fast flick under 280ms
        if ((absX > 45 && duration < 500) || (absX > 25 && duration < 280)) {
          if (deltaX < 0) {
            // Swiped LEFT -> Advance to NEXT section
            navigateToNextSection();
          } else {
            // Swiped RIGHT -> Go to PREVIOUS section
            navigateToPrevSection();
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigateToNextSection, navigateToPrevSection, showSurprise, showIntro]);

  // Desktop Keyboard Arrow Navigation (Left/Right to switch sections when not typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowRight' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        navigateToNextSection();
      } else if (e.key === 'ArrowLeft' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        navigateToPrevSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToNextSection, navigateToPrevSection]);

  const isHome = activeSection === 'home';

  return (
    <div
      suppressHydrationWarning
      className="relative min-h-screen bg-obsidian-950 text-slate-100 overflow-x-hidden bg-grain animate-fade-in"
    >
      {/* Dynamic Stardust & Ambient Particle Layer (Paused on non-home sections for 100% GPU/battery efficiency) */}
      <ParticleCanvas isActive={isHome} />

      {/* Cinematic Opening Sequence — Pre-rendered in background for true 0ms instant open */}
      <CinematicIntro
        forceShow={showIntro}
        onClose={() => setShowIntro(false)}
      />

      {/* Global Interactive Easter Egg Listeners */}
      <EasterEggListener onTriggerSurprise={() => setShowSurprise(true)} />

      {/* Navbar with Replay Intro & Surprise Controls — Hidden when inside Reels */}
      <div className={activeSection === 'reels' ? 'hidden' : 'contents'}>
        <Navbar
          onReplayIntro={() => setShowIntro(true)}
          onOpenSurprise={() => setShowSurprise(true)}
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
        />
      </div>

      {/* Main Content Container with Instant 0ms Smooth Viewport */}
      <main className="relative z-10 min-h-[75vh]">
        {/* 1. Home Sanctuary View */}
        <div className={isHome ? 'pt-18 sm:pt-22 pb-8 block animate-fade-in instant-section' : 'hidden'}>
          <Hero
            onOpenSurprise={() => setShowSurprise(true)}
            onSelectSection={handleSelectSection}
            isActive={isHome}
          />
        </div>

        {/* 2. Projects Showcase View */}
        {mountedSections['projects'] && (
          <div className={activeSection === 'projects' ? 'pt-24 sm:pt-28 pb-16 block animate-fade-in instant-section' : 'hidden'}>
            <ProjectShowcase />
          </div>
        )}

        {/* 3. Python Turtle Art Gallery View */}
        {mountedSections['turtle'] && (
          <div className={activeSection === 'turtle' ? 'pt-24 sm:pt-28 pb-16 block animate-fade-in instant-section' : 'hidden'}>
            <TurtleGallery />
          </div>
        )}

        {/* 4. Reels Section View (Immersive Mobile Reels with Bottom Nav) */}
        {mountedSections['reels'] && (
          <div className={activeSection === 'reels' ? 'pt-0 pb-16 sm:pb-0 block animate-fade-in instant-section' : 'hidden'}>
            <ReelsSection
              isActive={activeSection === 'reels'}
              onBack={() => handleSelectSection('home')}
            />
          </div>
        )}

        {/* 5. Memories Timeline View */}
        {mountedSections['memories'] && (
          <div className={activeSection === 'memories' ? 'pt-24 sm:pt-28 pb-16 block animate-fade-in instant-section' : 'hidden'}>
            <MemoriesTimeline />
          </div>
        )}

        {/* 5. Love Notes Vault View */}
        {mountedSections['love-notes'] && (
          <div className={activeSection === 'love-notes' ? 'pt-24 sm:pt-28 pb-16 block animate-fade-in instant-section' : 'hidden'}>
            <LoveNotesVault isActive={activeSection === 'love-notes'} />
          </div>
        )}
      </main>

      {/* Footer: Visible on Home Section */}
      <div className={isHome ? 'block' : 'hidden'}>
        <Footer
          onReplayIntro={() => setShowIntro(true)}
          onOpenSurprise={() => setShowSurprise(true)}
        />
      </div>


      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* Secret Special Surprise Modal */}
      <SpecialSurpriseModal
        isOpen={showSurprise}
        onClose={() => setShowSurprise(false)}
      />
    </div>
  );
}
