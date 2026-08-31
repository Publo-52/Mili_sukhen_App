'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { SectionNavigator, SectionType } from '@/components/navigation/SectionNavigator';
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

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionType>('all');
  const [counts, setCounts] = useState({
    projects: 0,
    turtles: 0,
    memories: INITIAL_MEMORIES.length,
    loveNotes: 0,
  });

  // Sync with URL Hash and count data on load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'projects') setActiveSection('projects');
      else if (hash === 'python-art' || hash === 'turtle') setActiveSection('turtle');
      else if (hash === 'memories') setActiveSection('memories');
      else if (hash === 'love-notes') setActiveSection('love-notes');
      else if (hash === 'all' || hash === 'hero') setActiveSection('all');
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Load dynamic counts
    setCounts({
      projects: getProjects().length,
      turtles: getTurtleCreations().length,
      memories: INITIAL_MEMORIES.length,
      loveNotes: getLoveNotes().length,
    });

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectSection = (section: SectionType) => {
    setActiveSection(section);
    
    // Update hash cleanly without reload
    const targetHash = section === 'all' ? '' : section === 'turtle' ? 'python-art' : section;
    if (targetHash) {
      window.history.pushState(null, '', `#${targetHash}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }

    // Smooth scroll to navigator on small devices
    const navEl = document.getElementById('section-navigator-anchor');
    if (navEl && section !== 'all') {
      navEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian-950 text-slate-100 overflow-x-hidden bg-grain pb-16 md:pb-0">
      {/* Dynamic Stardust & Ambient Particle Layer */}
      <ParticleCanvas />

      {/* Cinematic Opening Sequence */}
      <CinematicIntro
        forceShow={showIntro}
        onClose={() => setShowIntro(false)}
      />

      {/* Global Interactive Easter Egg Listeners (Shift+M, double-click floating hearts) */}
      <EasterEggListener onTriggerSurprise={() => setShowSurprise(true)} />

      {/* Navbar with Replay Intro & Surprise Controls */}
      <Navbar
        onReplayIntro={() => setShowIntro(true)}
        onOpenSurprise={() => setShowSurprise(true)}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* Hero Section */}
      <Hero
        onOpenSurprise={() => setShowSurprise(true)}
        onSelectSection={handleSelectSection}
      />

      {/* Anchor for Smooth Scrolling */}
      <div id="section-navigator-anchor" className="scroll-mt-24" />

      {/* Interactive Sticky Section Navigator */}
      <SectionNavigator
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        counts={counts}
      />

      {/* Isolated Section Views according to User Selection */}
      <main className="relative z-10 space-y-12 sm:space-y-20 pt-4">
        <AnimatePresence mode="wait">
          {/* 1. Projects Showcase Section */}
          {(activeSection === 'all' || activeSection === 'projects') && (
            <motion.div
              key="projects-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <ProjectShowcase />
            </motion.div>
          )}

          {/* 2. Python Turtle Art Gallery Section */}
          {(activeSection === 'all' || activeSection === 'turtle') && (
            <motion.div
              key="turtle-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <TurtleGallery />
            </motion.div>
          )}

          {/* 3. Memories Timeline Section */}
          {(activeSection === 'all' || activeSection === 'memories') && (
            <motion.div
              key="memories-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <MemoriesTimeline />
            </motion.div>
          )}

          {/* 4. Love Notes Vault Section */}
          {(activeSection === 'all' || activeSection === 'love-notes') && (
            <motion.div
              key="love-notes-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <LoveNotesVault />
            </motion.div>
          )}
        </AnimatePresence>
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
