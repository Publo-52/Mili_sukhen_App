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

// Ambient Background Elements loaded asynchronously
const ParticleCanvas = dynamic(
  () => import('@/components/hero/ParticleCanvas').then((m) => m.ParticleCanvas),
  { ssr: false }
);
const CinematicIntro = dynamic(
  () => import('@/components/hero/CinematicIntro').then((m) => m.CinematicIntro),
  { ssr: false }
);
const SpecialSurpriseModal = dynamic(
  () => import('@/components/surprise/SpecialSurpriseModal').then((m) => m.SpecialSurpriseModal),
  { ssr: false }
);
const AmbientAudioPlayer = dynamic(
  () => import('@/components/audio/AmbientAudioPlayer').then((m) => m.AmbientAudioPlayer),
  { ssr: false }
);
const EasterEggListener = dynamic(
  () => import('@/components/easter-eggs/EasterEggListener').then((m) => m.EasterEggListener),
  { ssr: false }
);

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Eager Parallel Cache Warm-up function (pre-loads all sections & assets upfront)
const warmUpAllDatasetsAndAssets = () => {
  if (typeof window === 'undefined') return;

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
            localStorage.setItem('mili_fav_memories_all', JSON.stringify(data.memories));
          }
        }
      })
      .catch(() => {});
  });

  // 2. Preload Hero and key media into browser memory cache
  const keyImages = [
    '/images/hero/mili_hero_1.png',
    '/images/hero/mili_hero_2.png',
    '/images/hero/mili_hero_3.jpg',
    '/images/hero/mili_hero_4.png',
    '/images/hero/mili_hero_5.jpg',
    '/logo.png',
  ];
  keyImages.forEach((src) => {
    const img = new window.Image();
    img.src = src;
  });
};

export default function HomePage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('home');

  // Eager background preload & Sync with URL Hash on load
  useEffect(() => {
    // 1. Fire full-site eager warm-up immediately
    warmUpAllDatasetsAndAssets();

    // 2. Prefetch Next.js routes upfront
    try {
      router.prefetch('/admin');
      router.prefetch('/login');
    } catch {}

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'projects') setActiveSection('projects');
      else if (hash === 'python-art' || hash === 'turtle') setActiveSection('turtle');
      else if (hash === 'memories') setActiveSection('memories');
      else if (hash === 'love-notes') setActiveSection('love-notes');
      else setActiveSection('home');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('hashchange', handleHash);
    };
  }, [router]);

  const handleSelectSection = (section: SectionType) => {
    const validSection: SectionType =
      section === 'projects' ||
      section === 'turtle' ||
      section === 'memories' ||
      section === 'love-notes'
        ? section
        : 'home';

    setActiveSection(validSection);

    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
    } catch {
      window.scrollTo(0, 0);
    }

    const targetHash = validSection === 'home' ? '' : validSection === 'turtle' ? 'python-art' : validSection;
    if (targetHash) {
      window.history.pushState(null, '', `#${targetHash}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

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

      {/* Cinematic Opening Sequence */}
      {showIntro && (
        <CinematicIntro
          forceShow={showIntro}
          onClose={() => setShowIntro(false)}
        />
      )}

      {/* Global Interactive Easter Egg Listeners */}
      <EasterEggListener onTriggerSurprise={() => setShowSurprise(true)} />

      {/* Navbar with Replay Intro & Surprise Controls */}
      <Navbar
        onReplayIntro={() => setShowIntro(true)}
        onOpenSurprise={() => setShowSurprise(true)}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* Main Content Container with Silk-Smooth Animated Transitions */}
      <main className="relative z-10 min-h-[75vh]">
        <AnimatePresence mode="wait">
          {/* 1. Home Sanctuary View */}
          {isHome && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pt-18 sm:pt-22 pb-8"
            >
              <Hero
                onOpenSurprise={() => setShowSurprise(true)}
                onSelectSection={handleSelectSection}
              />
            </motion.div>
          )}

          {/* 2. Projects Showcase View */}
          {activeSection === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pt-24 sm:pt-28 pb-16"
            >
              <ProjectShowcase />
            </motion.div>
          )}

          {/* 3. Python Turtle Art Gallery View */}
          {activeSection === 'turtle' && (
            <motion.div
              key="turtle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pt-24 sm:pt-28 pb-16"
            >
              <TurtleGallery />
            </motion.div>
          )}

          {/* 4. Memories Timeline View */}
          {activeSection === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pt-24 sm:pt-28 pb-16"
            >
              <MemoriesTimeline />
            </motion.div>
          )}

          {/* 5. Love Notes Vault View */}
          {activeSection === 'love-notes' && (
            <motion.div
              key="love-notes"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pt-24 sm:pt-28 pb-16"
            >
              <LoveNotesVault />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer: Visible on Home Section */}
      <div className={isHome ? 'block' : 'hidden'}>
        <Footer
          onReplayIntro={() => setShowIntro(true)}
          onOpenSurprise={() => setShowSurprise(true)}
        />
      </div>

      {/* Ambient Audio Player */}
      <AmbientAudioPlayer />

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
