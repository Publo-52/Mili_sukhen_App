'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SectionType } from '@/types';
import { ParticleCanvas } from '@/components/hero/ParticleCanvas';
import { CinematicIntro } from '@/components/hero/CinematicIntro';
import { Hero } from '@/components/hero/Hero';
import { ProjectShowcase } from '@/components/projects/ProjectShowcase';
import { TurtleGallery } from '@/components/turtle/TurtleGallery';
import { MemoriesTimeline } from '@/components/timeline/MemoriesTimeline';
import { LoveNotesVault } from '@/components/love-notes/LoveNotesVault';
import { SpecialSurpriseModal } from '@/components/surprise/SpecialSurpriseModal';
import { Footer } from '@/components/footer/Footer';
import { AmbientAudioPlayer } from '@/components/audio/AmbientAudioPlayer';
import { EasterEggListener } from '@/components/easter-eggs/EasterEggListener';
import { getProjects, getTurtleCreations, getLoveNotes } from '@/lib/storage';
import { INITIAL_MEMORIES } from '@/data/memories';

import { UniversePortalHub } from '@/components/hero/UniversePortalHub';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('home');
  const [counts, setCounts] = useState({
    projects: 0,
    turtles: 0,
    memories: INITIAL_MEMORIES.length,
    loveNotes: 0,
  });

  // Sync with URL Hash, active scroll position, and count data
  useEffect(() => {
    // Load dynamic counts
    setCounts({
      projects: getProjects().length,
      turtles: getTurtleCreations().length,
      memories: INITIAL_MEMORIES.length,
      loveNotes: getLoveNotes().length,
    });

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

    // Active Section Intersection Observer
    const sectionIds = ['home', 'projects', 'python-art', 'memories', 'love-notes'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === 'home') setActiveSection('home');
            else if (id === 'projects') setActiveSection('projects');
            else if (id === 'python-art') setActiveSection('turtle');
            else if (id === 'memories') setActiveSection('memories');
            else if (id === 'love-notes') setActiveSection('love-notes');
          }
        });
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0.1,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('hashchange', handleHash);
      observer.disconnect();
    };
  }, []);

  const handleSelectSection = (section: SectionType) => {
    setActiveSection(section);
    
    const targetId = section === 'home' ? 'home' : section === 'turtle' ? 'python-art' : section;
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

      {/* All Sections Rendered Together on One Continuous Page */}
      <main className="relative z-10 space-y-12 sm:space-y-20 pt-20 sm:pt-24">
        {/* 1. Home Sanctuary & Hero Section */}
        <section id="home" className="space-y-4">
          <Hero
            onOpenSurprise={() => setShowSurprise(true)}
            onSelectSection={handleSelectSection}
          />
          <UniversePortalHub
            onSelectSection={handleSelectSection}
            counts={counts}
          />
        </section>

        {/* 2. Projects Showcase Section */}
        <section id="projects" className="scroll-mt-24 sm:scroll-mt-28">
          <ProjectShowcase />
        </section>

        {/* 3. Python Turtle Art Gallery Section */}
        <section id="python-art" className="scroll-mt-24 sm:scroll-mt-28">
          <TurtleGallery />
        </section>

        {/* 4. Memories Timeline Section */}
        <section id="memories" className="scroll-mt-24 sm:scroll-mt-28">
          <MemoriesTimeline />
        </section>

        {/* 5. Love Notes Vault Section */}
        <section id="love-notes" className="scroll-mt-24 sm:scroll-mt-28 pb-10">
          <LoveNotesVault />
        </section>
      </main>

      {/* Footer */}
      <Footer
        onReplayIntro={() => setShowIntro(true)}
        onOpenSurprise={() => setShowSurprise(true)}
      />

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
