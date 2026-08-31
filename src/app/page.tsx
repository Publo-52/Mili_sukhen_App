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

  // Sync with URL Hash and count data on load
  useEffect(() => {
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
    const targetHash = section === 'home' ? '' : section === 'turtle' ? 'python-art' : section;
    if (targetHash) {
      window.history.pushState(null, '', `#${targetHash}`);
    } else {
      window.history.pushState(null, '', window.location.pathname);
    }

    // Scroll to top of section cleanly
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Global Interactive Easter Egg Listeners (Shift+M, double-click floating hearts) */}
      <EasterEggListener onTriggerSurprise={() => setShowSurprise(true)} />

      {/* Navbar with Replay Intro & Surprise Controls */}
      <Navbar
        onReplayIntro={() => setShowIntro(true)}
        onOpenSurprise={() => setShowSurprise(true)}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
      />

      {/* Strictly Isolated Section Content (Zero Extra Space) */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {/* 0. Home Sanctuary View (Hero + Live Counter + 4 Dedicated Portal Hub Cards) */}
          {activeSection === 'home' && (
            <motion.div
              key="home-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-2"
            >
              <Hero
                onOpenSurprise={() => setShowSurprise(true)}
                onSelectSection={handleSelectSection}
              />
              <UniversePortalHub
                onSelectSection={handleSelectSection}
                counts={counts}
              />
            </motion.div>
          )}

          {/* 1. Projects Showcase Section (ONLY Projects) */}
          {activeSection === 'projects' && (
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

          {/* 2. Python Turtle Art Gallery Section (ONLY Python Art) */}
          {activeSection === 'turtle' && (
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

          {/* 3. Memories Timeline Section (ONLY Memories Timeline) */}
          {activeSection === 'memories' && (
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

          {/* 4. Love Notes Vault Section (ONLY Love Notes) */}
          {activeSection === 'love-notes' && (
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
