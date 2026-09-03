'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SectionType } from '@/types';
import { Hero } from '@/components/hero/Hero';
import { Footer } from '@/components/footer/Footer';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import { TurtleGallery } from '@/components/turtle/TurtleGallery';
import { MemoriesTimeline } from '@/components/timeline/MemoriesTimeline';
import { LoveNotesVault } from '@/components/love-notes/LoveNotesVault';

import { CinematicIntro } from '@/components/hero/CinematicIntro';
import { INTRO_COLLAGE_PHOTOS } from '@/data/introCollagePhotos';

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

// Eager Parallel Cache Warm-up function (pre-loads all sections & assets upfront for 0ms latency)
const warmUpAllDatasetsAndAssets = () => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Parallel API Cache Preload (warm up localStorage & memory)
    const endpoints = ['/api/projects', '/api/turtle', '/api/love-notes', '/api/memories'];
    endpoints.forEach((url) => {
      fetch(url, { cache: 'no-store' })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (url === '/api/projects' && data.projects) {
              localStorage.setItem('mili_universe_projects', JSON.stringify(data.projects));
            } else if (url === '/api/turtle' && data.creations) {
              localStorage.setItem('mili_custom_turtle', JSON.stringify(data.creations));
            } else if (url === '/api/love-notes' && data.notes) {
              localStorage.setItem('mili_universe_love_notes', JSON.stringify(data.notes));
            } else if (url === '/api/memories' && data.memories) {
              localStorage.setItem('mili_universe_memories', JSON.stringify(data.memories));
              localStorage.setItem('mili_fav_memories_all', JSON.stringify(data.memories));
            }
          }
        })
        .catch(() => {});
    });

    // 2. Preload Hero, brand logos, intro photos, and key media into GPU browser memory cache
    const keyImages = [
      '/images/hero/mili_hero_1.png',
      '/images/hero/mili_hero_2.png',
      '/images/hero/mili_hero_3.jpg',
      '/images/hero/mili_hero_4.png',
      '/images/hero/mili_hero_5.jpg',
      '/logo.png',
      ...INTRO_COLLAGE_PHOTOS,
    ];
    keyImages.forEach((src) => {
      try {
        const img = new Image();
        img.src = src;
      } catch {}
    });
  } catch {}
};

export default function HomePage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);

  // Safe SSR-matching initial activeSection
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const historyStackRef = React.useRef<SectionType[]>(['home']);

  // Eager background preload & Sync with URL Hash on load
  useEffect(() => {
    // 1. Fire full-site eager warm-up immediately
    warmUpAllDatasetsAndAssets();

    // 2. Prefetch Next.js routes upfront
    try {
      router.prefetch('/admin');
      router.prefetch('/login');
    } catch {}

    const parseSectionFromHash = (hash: string): SectionType => {
      const clean = hash.replace('#', '').toLowerCase();
      if (clean === 'projects') return 'projects';
      if (clean === 'python-art' || clean === 'turtle') return 'turtle';
      if (clean === 'memories') return 'memories';
      if (clean === 'love-notes') return 'love-notes';
      return 'home';
    };

    const initialHash = typeof window !== 'undefined' ? window.location.hash : '';
    if (initialHash) {
      const initialSec = parseSectionFromHash(initialHash);
      setActiveSection(initialSec);
      historyStackRef.current = ['home', initialSec];
    } else {
      try {
        const saved = sessionStorage.getItem('mili_active_tab') as SectionType;
        if (saved && (saved === 'projects' || saved === 'turtle' || saved === 'memories' || saved === 'love-notes')) {
          setActiveSection(saved);
          historyStackRef.current = ['home', saved];
        }
      } catch {}
    }

    const handlePopState = (e: PopStateEvent) => {
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
  }, [router]);

  const handleSelectSection = (section: SectionType, pushToHistory = true) => {
    const validSection: SectionType =
      section === 'projects' ||
      section === 'turtle' ||
      section === 'memories' ||
      section === 'love-notes'
        ? section
        : 'home';

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
  };

  // Step-wise Back Navigation (Handles swipe back and history step reversal)
  const navigateStepBack = React.useCallback(() => {
    // 1. If any modal is open, close modal first
    if (showSurprise) {
      setShowSurprise(false);
      return true;
    }
    if (showIntro) {
      setShowIntro(false);
      return true;
    }

    // 2. Step backward through section navigation history stack
    const stack = historyStackRef.current;
    if (stack.length > 1) {
      stack.pop(); // remove current section
      const previousSection = stack[stack.length - 1] || 'home';
      handleSelectSection(previousSection, false);
      return true;
    } else if (activeSection !== 'home') {
      handleSelectSection('home', false);
      return true;
    }

    return false;
  }, [activeSection, showSurprise, showIntro]);

  // Mobile Touch Swipe Listener (Left-to-Right swipe to step-wise go back)
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const duration = Date.now() - touchStartTime;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Natural Left-to-Right Swipe Back Gesture (deltaX > 60px, horizontal dominant, < 400ms)
      if (deltaX > 60 && deltaY < 50 && duration < 400) {
        navigateStepBack();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigateStepBack]);

  const isHome =
    activeSection === 'home' ||
    (activeSection !== 'projects' &&
      activeSection !== 'turtle' &&
      activeSection !== 'memories' &&
      activeSection !== 'love-notes');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-screen bg-obsidian-950 text-slate-100 overflow-x-hidden bg-grain"
    >
      {/* Dynamic Stardust & Ambient Particle Layer */}
      <ParticleCanvas />

      {/* Cinematic Opening Sequence — Pre-rendered in background for true 0ms instant open */}
      <CinematicIntro
        forceShow={showIntro}
        onClose={() => setShowIntro(false)}
      />

      {/* Global Interactive Easter Egg Listeners */}
      <EasterEggListener onTriggerSurprise={() => setShowSurprise(true)} />

      {/* Navbar with Replay Intro & Surprise Controls */}
      <Navbar
        onReplayIntro={() => setShowIntro(true)}
        onOpenSurprise={() => setShowSurprise(true)}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* Main Content Container with Instant 0ms Smooth Viewport */}
      <main className="relative z-10 min-h-[75vh]">
        {/* 1. Home Sanctuary View */}
        <div className={isHome ? 'pt-18 sm:pt-22 pb-8 block' : 'hidden'}>
          <Hero
            onOpenSurprise={() => setShowSurprise(true)}
            onSelectSection={handleSelectSection}
          />
        </div>

        {/* 2. Projects Showcase View */}
        <div className={activeSection === 'projects' ? 'pt-24 sm:pt-28 pb-16 block' : 'hidden'}>
          <ProjectShowcase />
        </div>

        {/* 3. Python Turtle Art Gallery View */}
        <div className={activeSection === 'turtle' ? 'pt-24 sm:pt-28 pb-16 block' : 'hidden'}>
          <TurtleGallery />
        </div>

        {/* 4. Memories Timeline View */}
        <div className={activeSection === 'memories' ? 'pt-24 sm:pt-28 pb-16 block' : 'hidden'}>
          <MemoriesTimeline />
        </div>

        {/* 5. Love Notes Vault View */}
        <div className={activeSection === 'love-notes' ? 'pt-24 sm:pt-28 pb-16 block' : 'hidden'}>
          <LoveNotesVault />
        </div>
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
    </motion.div>
  );
}
