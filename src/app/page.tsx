'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SectionType } from '@/types';
import { Hero } from '@/components/hero/Hero';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import { TurtleGallery } from '@/components/turtle/TurtleGallery';
import { MemoriesTimeline } from '@/components/timeline/MemoriesTimeline';
import { LoveNotesVault } from '@/components/love-notes/LoveNotesVault';
import { Footer } from '@/components/footer/Footer';
import { getProjects, getTurtleCreations, getLoveNotes, getMemories } from '@/lib/storage';

// Lazy load non-critical client modules for instant First Contentful Paint
const ParticleCanvas = dynamic(() => import('@/components/hero/ParticleCanvas').then((m) => m.ParticleCanvas), { ssr: false });
const CinematicIntro = dynamic(() => import('@/components/hero/CinematicIntro').then((m) => m.CinematicIntro), { ssr: false });
const SpecialSurpriseModal = dynamic(() => import('@/components/surprise/SpecialSurpriseModal').then((m) => m.SpecialSurpriseModal), { ssr: false });
const AmbientAudioPlayer = dynamic(() => import('@/components/audio/AmbientAudioPlayer').then((m) => m.AmbientAudioPlayer), { ssr: false });
const EasterEggListener = dynamic(() => import('@/components/easter-eggs/EasterEggListener').then((m) => m.EasterEggListener), { ssr: false });

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [counts, setCounts] = useState({
    projects: 0,
    turtles: 0,
    memories: 0,
    loveNotes: 0,
  });

  // Sync with URL Hash and count data on load
  useEffect(() => {
    const updateCounts = () => {
      setCounts({
        projects: getProjects().length,
        turtles: getTurtleCreations().length,
        memories: getMemories().length,
        loveNotes: getLoveNotes().length,
      });
    };

    updateCounts();

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'projects') setActiveSection('projects');
      else if (hash === 'python-art' || hash === 'turtle') setActiveSection('turtle');
      else if (hash === 'memories') setActiveSection('memories');
      else if (hash === 'love-notes') setActiveSection('love-notes');
      else if (hash === 'home' || hash === 'hero' || !hash) setActiveSection('home');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('mili-projects-updated', updateCounts);
    window.addEventListener('mili-turtle-updated', updateCounts);
    window.addEventListener('mili-notes-updated', updateCounts);
    window.addEventListener('mili-memories-updated', updateCounts);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('mili-projects-updated', updateCounts);
      window.removeEventListener('mili-turtle-updated', updateCounts);
      window.removeEventListener('mili-notes-updated', updateCounts);
      window.removeEventListener('mili-memories-updated', updateCounts);
    };
  }, []);

  const handleSelectSection = (section: SectionType) => {
    setActiveSection(section);
    
    // Instant scroll to top when switching views for buttery-smooth responsiveness
    window.scrollTo(0, 0);

    const targetHash = section === 'home' ? '' : section === 'turtle' ? 'python-art' : section;
    if (targetHash) {
      window.history.pushState(null, '', `#${targetHash}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-slate-100 overflow-x-hidden bg-grain">
      {/* Dynamic Stardust & Ambient Particle Layer */}
      <ParticleCanvas />

      {/* Cinematic Opening Sequence */}
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

      {/* Strict Isolated View Container (Only Selected Section Renders) */}
      <main className="relative z-10 min-h-[75vh]">
        {/* 1. Home Sanctuary View (ONLY Hero Portion: Portrait, Live Counter, Romantic Quote & CTAs) */}
        {activeSection === 'home' && (
          <div className="pt-18 sm:pt-22 pb-8 animate-fade-in">
            <Hero
              onOpenSurprise={() => setShowSurprise(true)}
              onSelectSection={handleSelectSection}
            />
          </div>
        )}

        {/* 2. Projects Showcase View (ONLY Projects) */}
        {activeSection === 'projects' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <ProjectShowcase />
          </div>
        )}

        {/* 3. Python Turtle Art Gallery View (ONLY Python Art) */}
        {activeSection === 'turtle' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <TurtleGallery />
          </div>
        )}

        {/* 4. Memories Timeline View (ONLY Memories) */}
        {activeSection === 'memories' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <MemoriesTimeline />
          </div>
        )}

        {/* 5. Love Notes Vault View (ONLY Love Notes) */}
        {activeSection === 'love-notes' && (
          <div className="pt-24 sm:pt-28 pb-16 animate-fade-in">
            <LoveNotesVault />
          </div>
        )}
      </main>

      {/* Footer: ONLY visible on Home Section */}
      {activeSection === 'home' && (
        <Footer
          onReplayIntro={() => setShowIntro(true)}
          onOpenSurprise={() => setShowSurprise(true)}
        />
      )}

      {/* Ambient Audio Player */}
      <AmbientAudioPlayer />

      {/* Native App-like Mobile Bottom Navigation */}
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
