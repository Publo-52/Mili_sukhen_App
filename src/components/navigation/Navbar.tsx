'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Menu, X, Shield, Film, LogIn, LogOut, User } from 'lucide-react';
import { APP_CONFIG } from '@/data/config';
import { useAuth } from '@/lib/auth-context';

interface NavbarProps {
  onReplayIntro?: () => void;
  onOpenSurprise?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReplayIntro, onOpenSurprise }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const { isAuthenticated, user, session, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 5) {
      setLogoClicks(0);
      if (onOpenSurprise) onOpenSurprise();
    }
  };

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Projects', href: '/#projects' },
    { name: 'Python Art', href: '/#python-art' },
    { name: 'Memories', href: '/#memories' },
    { name: 'Love Notes', href: '/#love-notes' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'glass-nav py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Easter Egg Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="group flex items-center gap-3 text-left focus:outline-none"
              title="Suksharmi — Digital Universe"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform border border-white/20 p-0.5 overflow-hidden">
                <div className="w-full h-full rounded-[14px] bg-[#0c0817] flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Suksharmi Logo"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority
                  />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-stylish tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300 flex items-center gap-1 leading-none drop-shadow-[0_0_12px_rgba(244,63,94,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(244,63,94,0.7)] transition-all">
                  Suksharmi
                </span>
                <span className="block text-[9px] font-mono tracking-[0.22em] text-slate-400 group-hover:text-roseGlow-300 transition-colors uppercase">
                  A DIGITAL UNIVERSE
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium text-slate-300 hover:text-roseGlow-400 hover:bg-white/5 rounded-full transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-2.5">
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

            {/* Admin Dashboard link (highlighted if Sukhen is logged in) */}
            <Link
              href="/admin"
              className={`p-2 rounded-full glass-card transition-all ${
                isAdmin
                  ? 'border-purple-500/50 text-purple-300 shadow-glow bg-purple-500/10'
                  : 'hover:border-white/30 text-slate-400 hover:text-slate-200'
              }`}
              title="Admin Studio"
              aria-label="Admin Studio"
            >
              <Shield className="w-4 h-4" />
            </Link>

            {/* Login / User Status / Logout Button */}
            {!loading && (
              isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border text-xs font-mono ${
                      isAdmin
                        ? 'border-purple-500/30 text-purple-200 bg-purple-950/20'
                        : 'border-roseGlow-500/30 text-roseGlow-300 bg-roseGlow-950/20'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isAdmin ? 'bg-purple-600 text-white' : 'bg-roseGlow-600 text-white'}`}>
                      {user?.name?.[0] || 'M'}
                    </div>
                    <span className="font-semibold">{user?.name || 'Mili'}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full glass-card hover:border-red-500/40 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Logout / Switch Profile"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
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


          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {onOpenSurprise && (
              <button
                onClick={onOpenSurprise}
                className="p-2 rounded-full glass-card text-roseGlow-400"
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

      {/* Mobile Fullscreen Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-obsidian-950/95 backdrop-blur-2xl border-b border-white/10 p-6 md:hidden space-y-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-slate-200 hover:text-roseGlow-400 hover:bg-white/5 rounded-xl transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {isAuthenticated ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isAdmin ? 'bg-purple-600 text-white' : 'bg-roseGlow-600 text-white'}`}>
                      {user?.name?.[0] || 'M'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user?.name || 'Mili'}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {isAdmin ? 'Creator / Admin' : 'Mili'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white text-center text-sm font-medium shadow-glow"
                >
                  Sign In to Digital Universe
                </Link>
              )}

              <div className="flex items-center justify-between pt-1">
                {onReplayIntro && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onReplayIntro();
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Replay Intro</span>
                  </button>
                )}

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Studio</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
