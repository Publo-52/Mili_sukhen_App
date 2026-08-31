'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
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

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);

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
      />

      {/* Main Page Flow */}
      <main className="relative z-10 space-y-16 sm:space-y-24">
        {/* Hero Section */}
        <Hero onOpenSurprise={() => setShowSurprise(true)} />

        {/* 1. Projects Showcase */}
        <ProjectShowcase />

        {/* 2. Python Turtle Gallery */}
        <TurtleGallery />

        {/* 3. Memories Timeline */}
        <MemoriesTimeline />

        {/* 4. Love Notes Vault */}
        <LoveNotesVault />
      </main>

      {/* Footer */}
      <Footer
        onReplayIntro={() => setShowIntro(true)}
        onOpenSurprise={() => setShowSurprise(true)}
      />

      {/* Ambient Audio Player */}
      <AmbientAudioPlayer />

      {/* Native App-like Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Secret Special Surprise Modal */}
      <SpecialSurpriseModal
        isOpen={showSurprise}
        onClose={() => setShowSurprise(false)}
      />
    </div>
  );
}
