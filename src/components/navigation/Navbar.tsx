'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Menu, X, Shield, Film, LogIn, LogOut, User, Music, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { audioEngine, AudioTrack } from '@/lib/audio';

import { SectionType } from '@/types';

interface NavbarProps {
  onReplayIntro?: () => void;
  onOpenSurprise?: () => void;
  activeSection?: SectionType;
  onSelectSection?: (section: SectionType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onReplayIntro,
  onOpenSurprise,
  activeSection,
  onSelectSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(audioEngine.getCurrentTrack());
  const { isAuthenticated, user, session, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = audioEngine.subscribe((playing, track) => {
      setIsPlayingAudio(playing);
      setCurrentTrack(track);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  const toggleAudio = () => {
    if (audioEngine.getIsPlaying()) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      setLogoClicks(0);
      if (onOpenSurprise) onOpenSurprise();
    }
  };

  const navLinks: { name: string; href: string; sectionId: SectionType }[] = [
    { name: 'Home', href: '#home', sectionId: 'home' },
    { name: 'Projects', href: '#projects', sectionId: 'projects' },
    { name: 'Python Art', href: '#python-art', sectionId: 'turtle' },
    { name: 'Memories', href: '#memories', sectionId: 'memories' },
    { name: 'Love Notes', href: '#love-notes', sectionId: 'love-notes' },
  ];

  const handleNavClick = (sectionId: SectionType, e?: React.MouseEvent) => {
    if (onSelectSection) {
      if (e) e.preventDefault();
      onSelectSection(sectionId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass-nav py-2.5' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Easter Egg Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                handleLogoClick();
                if (onSelectSection) onSelectSection('home');
              }}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
              title="Suksharmi — Digital Universe"
            >
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform border border-white/20 p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-[14px] bg-[#0c0817] flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Suksharmi Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-stylish tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300 flex items-center gap-1 leading-none drop-shadow-[0_0_12px_rgba(244,63,94,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(244,63,94,0.7)] transition-all">
                  Suksharmi
                </span>
                <span className="block text-[8px] sm:text-[9px] font-mono tracking-[0.2em] text-slate-400 group-hover:text-roseGlow-300 transition-colors uppercase">
                  A DIGITAL UNIVERSE
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <button
                  key={link.name}
                  onClick={(e) => handleNavClick(link.sectionId, e)}
                  className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium rounded-full transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-roseGlow-600 text-white shadow-glow font-bold'
                      : 'text-slate-300 hover:text-roseGlow-400 hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {/* Music Toggle Button */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full glass-card transition-all ${
                isPlayingAudio
                  ? 'border-roseGlow-500/60 text-roseGlow-400 bg-roseGlow-500/20 shadow-glow animate-pulse'
                  : 'hover:border-white/30 text-slate-300 hover:text-white'
              }`}
              title={isPlayingAudio ? 'Pause Romantic Ambient Music' : 'Play Romantic Ambient Music'}
              aria-label="Toggle Romantic Music"
            >
              {isPlayingAudio ? <Music className="w-4 h-4 text-roseGlow-300" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Surprise Button */}
            {onOpenSurprise && (
              <button
                onClick={onOpenSurprise}
                className="p-2 rounded-full glass-card hover:border-roseGlow-500/50 text-roseGlow-400 hover:text-white transition-all shadow-sm group"
                title="Unlock Secret Surprise"
                aria-label="Unlock Secret Surprise"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </button>
            )}

            {/* Replay Intro */}
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className="p-2 rounded-full glass-card hover:border-white/30 text-slate-300 hover:text-white transition-all"
                title="Replay Cinematic Intro"
                aria-label="Replay Cinematic Intro"
              >
                <Film className="w-4 h-4" />
              </button>
            )}

            {/* Admin Dashboard link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="p-2 rounded-full glass-card border border-purple-500/50 text-purple-300 shadow-glow bg-purple-500/10 hover:bg-purple-500/20 transition-all"
                title="Admin Studio"
                aria-label="Admin Studio"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}

            {/* Login / User Status / Logout Button */}
            {!loading && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border text-xs font-mono ${
                      user?.role === 'sukhen'
                        ? 'border-purple-500/30 text-purple-200 bg-purple-950/20'
                        : 'border-roseGlow-500/30 text-roseGlow-300 bg-roseGlow-950/20'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${user?.role === 'sukhen' ? 'bg-purple-600 text-white' : 'bg-roseGlow-600 text-white'}`}>
                      {user?.name?.[0] || 'M'}
                    </div>
                    <span className="font-semibold">{user?.name || 'Mili'}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full glass-card hover:border-red-500/40 text-slate-300 hover:text-red-400 hover:bg-red-500/10 text-xs font-mono transition-all cursor-pointer"
                    title="Sign Out / Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-roseGlow-600/80 hover:bg-roseGlow-500 text-white text-xs font-medium shadow-glow transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )
            )}
          </div>

          {/* Mobile Action Icons (Header Right) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Music Toggle */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full glass-card transition-all ${
                isPlayingAudio
                  ? 'border-roseGlow-500/60 text-roseGlow-300 bg-roseGlow-500/20 shadow-glow animate-pulse'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={isPlayingAudio ? 'Pause Music' : 'Play Romantic Music'}
              aria-label="Toggle Music"
            >
              {isPlayingAudio ? <Music className="w-4 h-4 text-roseGlow-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {onOpenSurprise && (
              <button
                onClick={onOpenSurprise}
                className="p-2 rounded-full glass-card text-roseGlow-400 hover:text-white"
                aria-label="Special Surprise"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full glass-card text-slate-200"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Animated Drawer with Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/75 backdrop-blur-sm md:hidden"
            />

            {/* Menu Drawer Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-0 top-[70px] z-40 bg-obsidian-950/98 backdrop-blur-2xl p-5 md:hidden space-y-4 max-h-[calc(100dvh-80px)] overflow-y-auto shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.sectionId;
                  return (
                    <button
                      key={link.name}
                      onClick={(e) => handleNavClick(link.sectionId, e)}
                      className={`px-4 py-3 text-base font-medium rounded-2xl transition-colors flex items-center justify-between text-left ${
                        isActive
                          ? 'bg-roseGlow-600/20 text-roseGlow-300 font-bold border border-roseGlow-500/30'
                          : 'text-slate-200 hover:text-roseGlow-400 hover:bg-white/5 active:bg-white/10'
                      }`}
                    >
                      <span>{link.name}</span>
                      <span className="text-xs text-roseGlow-500 font-mono">→</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${user?.role === 'sukhen' ? 'bg-purple-600 text-white' : 'bg-roseGlow-600 text-white'}`}>
                        {user?.name?.[0] || 'M'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{user?.name || 'Mili'}</p>
                        <p className="text-[11px] font-mono text-slate-400">
                          {user?.role === 'sukhen' ? 'Creator & Admin' : 'Queen & Admin'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono active:scale-95 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-center text-sm font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Digital Universe</span>
                  </Link>
                )}

                <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400">
                  {onReplayIntro && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onReplayIntro();
                      }}
                      className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Film className="w-3.5 h-3.5 text-roseGlow-400" />
                      <span>Replay Intro</span>
                    </button>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 p-2 rounded-xl text-purple-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span>Admin Studio</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
