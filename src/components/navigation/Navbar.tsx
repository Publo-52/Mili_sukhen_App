'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Menu,
  X,
  Shield,
  Film,
  LogIn,
  LogOut,
  User,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Home,
  Layers,
  Terminal,
  Camera,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
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
  const [musicControlsOpen, setMusicControlsOpen] = useState(false);
  const desktopMusicRef = useRef<HTMLDivElement>(null);
  const mobileMusicRef = useRef<HTMLDivElement>(null);
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

  // Close music controls on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        desktopMusicRef.current &&
        !desktopMusicRef.current.contains(target) &&
        mobileMusicRef.current &&
        !mobileMusicRef.current.contains(target)
      ) {
        setMusicControlsOpen(false);
      }
    };
    if (musicControlsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [musicControlsOpen]);

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

  const navLinks: {
    name: string;
    href: string;
    sectionId: SectionType;
    icon: React.ElementType;
  }[] = [
    { name: 'Home', href: '#home', sectionId: 'home', icon: Home },
    { name: 'Projects', href: '#projects', sectionId: 'projects', icon: Layers },
    { name: 'Python Art', href: '#python-art', sectionId: 'turtle', icon: Terminal },
    { name: 'Memories', href: '#memories', sectionId: 'memories', icon: Camera },
    { name: 'Love Notes', href: '#love-notes', sectionId: 'love-notes', icon: BookOpen },
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
            {/* Music Controls & Song Icon */}
            <div ref={desktopMusicRef} className="relative flex items-center">
              <div className="flex items-center gap-1">
                {/* Control Buttons (Shown ONLY when song icon is clicked) */}
                <AnimatePresence>
                  {musicControlsOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85, x: 8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.85, x: 8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-1 p-1 rounded-full glass-card border border-roseGlow-500/40 bg-obsidian-950/95 shadow-glow"
                    >
                      {/* Previous Track Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.prevTrack();
                        }}
                        className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        title="Previous Track"
                        aria-label="Previous Track"
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                      </button>

                      {/* Play / Pause Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAudio();
                        }}
                        className={`p-1.5 rounded-full transition-all active:scale-90 shadow-md ${
                          isPlayingAudio
                            ? 'bg-gradient-to-r from-roseGlow-600 to-purple-600 text-white shadow-glow'
                            : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/20'
                        }`}
                        title={isPlayingAudio ? 'Pause' : 'Play'}
                        aria-label={isPlayingAudio ? 'Pause' : 'Play'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Next Track Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audioEngine.nextTrack();
                        }}
                        className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                        title="Next Track"
                        aria-label="Next Track"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* The Song Icon Button */}
                <button
                  onClick={() => setMusicControlsOpen((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-full glass-card transition-all flex items-center gap-1.5 cursor-pointer ${
                    musicControlsOpen || isPlayingAudio
                      ? 'border-roseGlow-500/60 text-roseGlow-300 bg-roseGlow-500/20 shadow-glow'
                      : 'hover:border-white/30 text-slate-300 hover:text-white'
                  }`}
                  title={musicControlsOpen ? 'Hide Music Controls' : 'Open Music Controls'}
                  aria-label="Song Icon Controls"
                >
                  <Music className={`w-4 h-4 ${isPlayingAudio ? 'text-roseGlow-400 animate-pulse' : 'text-slate-400'}`} />
                  {isPlayingAudio && (
                    <span className="flex items-end gap-0.5 h-3 pr-0.5">
                      <span className="w-0.5 bg-roseGlow-400 rounded-full h-full animate-[pulse_0.7s_ease-in-out_infinite]" />
                      <span className="w-0.5 bg-pink-400 rounded-full h-2/3 animate-[pulse_1.1s_ease-in-out_infinite]" />
                      <span className="w-0.5 bg-roseGlow-300 rounded-full h-4/5 animate-[pulse_0.9s_ease-in-out_infinite]" />
                    </span>
                  )}
                </button>
              </div>
            </div>

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
          <div ref={mobileMusicRef} className="relative flex md:hidden items-center gap-1.5">
            {/* Music Icon Button */}
            <button
              onClick={() => setMusicControlsOpen((prev) => !prev)}
              className={`p-2 rounded-full glass-card transition-all cursor-pointer ${
                musicControlsOpen || isPlayingAudio
                  ? 'border-roseGlow-500/60 text-roseGlow-300 bg-roseGlow-500/20 shadow-glow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title={musicControlsOpen ? 'Hide Music Controls' : 'Open Music Controls'}
              aria-label="Toggle Romantic Music"
            >
              <Music className={`w-4 h-4 ${isPlayingAudio ? 'text-roseGlow-400 animate-pulse' : 'text-slate-400'}`} />
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

            {/* Music Controls Dropdown — appears below right side, under hamburger */}
            <AnimatePresence>
              {musicControlsOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -8 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                  className="absolute top-full right-0 mt-2 flex items-center gap-1 p-1.5 rounded-full glass-card border border-roseGlow-500/40 bg-obsidian-950/95 shadow-glow backdrop-blur-xl z-[60]"
                >
                  {/* Previous Track */}
                  <button
                    onClick={(e) => { e.stopPropagation(); audioEngine.prevTrack(); }}
                    className="p-2 rounded-full text-slate-300 hover:text-white active:scale-90 transition-all"
                    title="Previous Track"
                    aria-label="Previous Track"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  {/* Play / Pause */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
                    className={`p-2 rounded-full transition-all active:scale-90 ${
                      isPlayingAudio
                        ? 'bg-gradient-to-r from-roseGlow-600 to-purple-600 text-white shadow-glow'
                        : 'glass-card text-slate-300 hover:text-white'
                    }`}
                    title={isPlayingAudio ? 'Pause' : 'Play'}
                    aria-label={isPlayingAudio ? 'Pause' : 'Play'}
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={(e) => { e.stopPropagation(); audioEngine.nextTrack(); }}
                    className="p-2 rounded-full text-slate-300 hover:text-white active:scale-90 transition-all"
                    title="Next Track"
                    aria-label="Next Track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* Mobile Fullscreen Animated Drawer with Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop with soft blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/80 backdrop-blur-md md:hidden"
            />

            {/* Menu Drawer Content with Spring Physics */}
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed inset-x-0 top-[66px] z-40 bg-gradient-to-b from-[#0f091f]/98 via-[#090614]/98 to-[#06040a]/98 backdrop-blur-3xl p-4 sm:p-5 md:hidden space-y-3.5 max-h-[calc(100dvh-75px)] overflow-y-auto shadow-[0_25px_60px_rgba(0,0,0,0.9)] border-b border-white/10 rounded-b-3xl"
            >
              {/* Navigation Links with Icon Tiles */}
              <div className="flex flex-col gap-1.5">
                {navLinks.map((link) => {
                  const isActive = activeSection === link.sectionId;
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.name}
                      onClick={(e) => handleNavClick(link.sectionId, e)}
                      className={`w-full px-3.5 py-2.5 rounded-2xl transition-all duration-200 flex items-center justify-between group active:scale-[0.98] cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-roseGlow-500/20 via-purple-600/15 to-transparent border border-roseGlow-500/40 shadow-glow text-white'
                          : 'hover:bg-white/[0.05] border border-transparent text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-tr from-roseGlow-500 to-purple-600 text-white shadow-glow border border-roseGlow-400/50'
                              : 'bg-white/[0.04] border border-white/[0.08] text-slate-400 group-hover:text-roseGlow-300 group-hover:border-roseGlow-500/30 group-hover:bg-roseGlow-500/10'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[14px] sm:text-[15px] tracking-wide font-sans ${isActive ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                          {link.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-roseGlow-400 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                        )}
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                            isActive ? 'text-roseGlow-400' : 'text-slate-500 group-hover:text-slate-300'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* User Profile Card & Actions */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
                {isAuthenticated ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-glow p-0.5 ${
                            user?.role === 'sukhen'
                              ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white'
                              : 'bg-gradient-to-tr from-roseGlow-500 to-pink-500 text-white'
                          }`}
                        >
                          <div className="w-full h-full rounded-[14px] bg-[#0c0817] flex items-center justify-center font-bold">
                            {user?.name?.[0] || 'M'}
                          </div>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0817] shadow-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                          <span>{user?.name || 'Mili'}</span>
                        </p>
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-mono font-medium active:scale-95 transition-all cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-center text-sm font-semibold shadow-glow transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Digital Universe</span>
                  </Link>
                )}

                {/* Bottom Action Pills: Replay Intro & Admin Studio */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  {onReplayIntro && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onReplayIntro();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] text-xs font-mono text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-roseGlow-400" />
                      <span>Replay Intro</span>
                    </button>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-xs font-mono text-purple-300 hover:text-white transition-all active:scale-95 text-center"
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
