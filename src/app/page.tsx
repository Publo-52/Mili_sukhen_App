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

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('home');

  // Sync with URL Hash on load
  useEffect(() => {
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
  }, []);

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
    <div className="relative min-h-screen bg-obsidian-950 text-slate-100 overflow-x-hidden bg-grain">
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

      {/* Main Content Container with Guaranteed Visibility & Instant Switching */}
      <main className="relative z-10 min-h-[75vh]">
        {/* 1. Home Sanctuary View */}
        {isHome && (
          <div className="pt-18 sm:pt-22 pb-8 animate-fade-in">
            <Hero
              onOpenSurprise={() => setShowSurprise(true)}
              onSelectSection={handleSelectSection}
            />
          </div>
        )}

        {/* 2. Projects Showcase View */}
        {activeSection === 'projects' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <ProjectShowcase />
          </div>
        )}

        {/* 3. Python Turtle Art Gallery View */}
        {activeSection === 'turtle' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <TurtleGallery />
          </div>
        )}

        {/* 4. Memories Timeline View */}
        {activeSection === 'memories' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <MemoriesTimeline />
          </div>
        )}

        {/* 5. Love Notes Vault View */}
        {activeSection === 'love-notes' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <LoveNotesVault />
          </div>
        )}
      </main>

      {/* Footer: Visible on Home Section */}
      {isHome && (
        <Footer
          onReplayIntro={() => setShowIntro(true)}
          onOpenSurprise={() => setShowSurprise(true)}
        />
      )}

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
    </div>
  );
}
