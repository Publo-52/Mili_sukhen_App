'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Disc,
  X,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { audioEngine, AudioTrack, ROMANTIC_PLAYLIST } from '@/lib/audio';

interface NavbarMusicControlsProps {
  isMobileOnly?: boolean;
}

export const NavbarMusicControls: React.FC<NavbarMusicControlsProps> = ({ isMobileOnly = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(audioEngine.getCurrentTrack());
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, track) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
    });

    // Close popover on outside click (desktop)
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleNextTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioEngine.nextTrack();
  };

  const handlePrevTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    audioEngine.prevTrack();
  };

  const handleSelectTrack = (trackId: string) => {
    audioEngine.setTrack(trackId);
    if (!isPlaying) {
      audioEngine.play();
    }
    setShowTrackList(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted) setIsMuted(false);
    audioEngine.setVolume(val);
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isMuted) {
      audioEngine.setVolume(volume || 0.65);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  // --- Mobile View Rendering ---
  if (isMobileOnly) {
    return (
      <div className="relative">
        {/* Mobile Header Music Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full glass-card transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
            isPlaying
              ? 'border-roseGlow-500/80 text-roseGlow-300 bg-roseGlow-500/20 shadow-glow'
              : 'border-white/10 text-slate-300 hover:text-white'
          }`}
          title={isPlaying ? 'Music Playing — Tap to control' : 'Play Romantic Music'}
          aria-label="Romantic Music Controls"
        >
          <Music className={`w-4 h-4 ${isPlaying ? 'text-roseGlow-400 animate-bounce' : 'text-slate-400'}`} />
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-3 pr-0.5">
              <span className="w-0.5 bg-roseGlow-400 rounded-full h-full animate-[pulse_0.7s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-pink-400 rounded-full h-2/3 animate-[pulse_1.1s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-roseGlow-300 rounded-full h-4/5 animate-[pulse_0.9s_ease-in-out_infinite]" />
            </span>
          )}
        </button>

        {/* Mobile Popover Modal / Sheet */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Dark blur backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm md:hidden"
              />

              {/* Mobile Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-x-3 top-20 z-50 p-4 rounded-3xl bg-[#0e0a1a]/95 border border-roseGlow-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl text-white space-y-4 md:hidden"
              >
                {/* Header with Title & Close */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-roseGlow-500/20 text-roseGlow-400 border border-roseGlow-500/30">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200">
                        Romantic Music Player
                      </h4>
                      <p className="text-[10px] font-mono text-slate-400">Mobile Audio Center</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Track Info & Vinyl Disc Animation */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  <div
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-roseGlow-600 via-purple-600 to-indigo-600 shadow-glow p-0.5 ${
                      isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-[#0c0817] flex items-center justify-center border border-white/20">
                      <Disc className={`w-6 h-6 ${isPlaying ? 'text-roseGlow-400' : 'text-slate-400'}`} />
                    </div>
                    <span className="absolute w-2 h-2 rounded-full bg-roseGlow-400 shadow-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                    <p className="text-[11px] font-mono text-roseGlow-300/80 truncate">{currentTrack.artist}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[10px] font-mono text-slate-400">
                        {isPlaying ? 'Playing' : 'Paused'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Playback Controls */}
                <div className="flex items-center justify-center gap-4 py-1">
                  <button
                    onClick={handlePrevTrack}
                    className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-90 text-slate-300 hover:text-white transition-all border border-white/10"
                    aria-label="Previous Track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className={`p-4 rounded-full shadow-glow active:scale-90 transition-all flex items-center justify-center ${
                      isPlaying
                        ? 'bg-gradient-to-r from-roseGlow-500 to-purple-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                        : 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    }`}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleNextTrack}
                    className="p-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] active:scale-90 text-slate-300 hover:text-white transition-all border border-white/10"
                    aria-label="Next Track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume Slider & Mute */}
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <button
                    onClick={handleToggleMute}
                    className="p-1.5 text-slate-300 hover:text-white"
                    aria-label="Mute / Unmute"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-roseGlow-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-roseGlow-500"
                    aria-label="Volume Slider"
                  />
                  <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                    {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                  </span>
                </div>

                {/* Romantic Playlist Selector */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Romantic Playlist</span>
                    <span className="text-roseGlow-400 text-[10px]">{ROMANTIC_PLAYLIST.length} Melodies</span>
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {ROMANTIC_PLAYLIST.map((track) => {
                      const isSelected = currentTrack.id === track.id;
                      return (
                        <button
                          key={track.id}
                          onClick={() => handleSelectTrack(track.id)}
                          className={`w-full p-2 rounded-xl text-left transition-all flex items-center justify-between text-xs ${
                            isSelected
                              ? 'bg-roseGlow-500/20 border border-roseGlow-500/50 text-white font-semibold'
                              : 'bg-white/[0.02] border border-transparent text-slate-300 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono text-slate-500">
                              {isSelected ? '▶' : '•'}
                            </span>
                            <span className="truncate">{track.title}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-roseGlow-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- Desktop View Rendering ---
  return (
    <div className="relative" ref={containerRef}>
      {/* Desktop Navbar Music Trigger Button & Popover Trigger */}
      <div className="flex items-center">
        <button
          onClick={handleTogglePlay}
          className={`px-3 py-1.5 rounded-l-full glass-card transition-all flex items-center gap-2 cursor-pointer ${
            isPlaying
              ? 'border-roseGlow-500/80 text-roseGlow-300 bg-roseGlow-500/20 shadow-glow'
              : 'border-white/10 hover:border-white/30 text-slate-300 hover:text-white'
          }`}
          title={isPlaying ? `Pause Music (${currentTrack.title})` : `Play Music (${currentTrack.title})`}
          aria-label="Toggle Romantic Music"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-roseGlow-400" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current text-roseGlow-400 ml-0.5" />
          )}
          <span className="text-xs font-mono font-medium max-w-[90px] truncate">
            {isPlaying ? currentTrack.title : 'Music'}
          </span>
          {isPlaying && (
            <span className="flex items-end gap-0.5 h-3 pr-0.5">
              <span className="w-0.5 bg-roseGlow-400 rounded-full h-full animate-[pulse_0.7s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-pink-400 rounded-full h-2/3 animate-[pulse_1.1s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-roseGlow-300 rounded-full h-4/5 animate-[pulse_0.9s_ease-in-out_infinite]" />
            </span>
          )}
        </button>

        {/* Dropdown chevron trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-1.5 py-1.5 rounded-r-full glass-card border-l-0 transition-all cursor-pointer ${
            isPlaying
              ? 'border-roseGlow-500/80 text-roseGlow-300 bg-roseGlow-500/20'
              : 'border-white/10 hover:border-white/30 text-slate-400 hover:text-white'
          }`}
          title="Romantic Audio Menu"
          aria-label="Open Audio Menu"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Desktop Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 p-4 rounded-2xl bg-[#0c0817]/95 border border-roseGlow-500/40 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white space-y-3 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-roseGlow-400" />
                <span className="text-xs font-bold text-white">Romantic Audio Center</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-roseGlow-500/20 text-roseGlow-300 border border-roseGlow-500/30">
                {isPlaying ? 'Playing 🎵' : 'Paused ⏸'}
              </span>
            </div>

            {/* Track Info Card */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-tr from-roseGlow-600 via-purple-600 to-indigo-600 shadow-glow p-0.5 ${
                  isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
                }`}
              >
                <div className="w-full h-full rounded-full bg-[#0c0817] flex items-center justify-center">
                  <Disc className={`w-5 h-5 ${isPlaying ? 'text-roseGlow-400' : 'text-slate-400'}`} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                <p className="text-[11px] font-mono text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 py-1">
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-90"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="p-3 rounded-full bg-roseGlow-600 hover:bg-roseGlow-500 text-white shadow-glow active:scale-90 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-all active:scale-90"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <button onClick={handleToggleMute} className="text-slate-400 hover:text-white p-1">
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-roseGlow-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-roseGlow-500"
                aria-label="Volume Slider"
              />
              <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            {/* Track Selector Accordion */}
            <div className="pt-1">
              <button
                onClick={() => setShowTrackList(!showTrackList)}
                className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 hover:text-roseGlow-300 py-1"
              >
                <span>Select Romantic Melody ({ROMANTIC_PLAYLIST.length})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTrackList ? 'rotate-180' : ''}`} />
              </button>

              {showTrackList && (
                <div className="mt-1 max-h-36 overflow-y-auto space-y-1">
                  {ROMANTIC_PLAYLIST.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handleSelectTrack(track.id)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-all flex items-center justify-between ${
                        currentTrack.id === track.id
                          ? 'bg-roseGlow-500/20 text-white border border-roseGlow-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="truncate">{track.title}</span>
                      {currentTrack.id === track.id && <Check className="w-3 h-3 text-roseGlow-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MobileDrawerMusicCard: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(audioEngine.getCurrentTrack());
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, track) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.65);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-roseGlow-500/30 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-roseGlow-600 to-purple-600 text-white shadow-glow ${
              isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
            }`}
          >
            <Disc className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
            <p className="text-[10px] font-mono text-roseGlow-300 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Quick Play/Pause & Skip */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => audioEngine.prevTrack()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            aria-label="Previous Track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleTogglePlay}
            className={`p-2 rounded-xl text-white shadow-glow active:scale-95 transition-all ${
              isPlaying ? 'bg-gradient-to-r from-roseGlow-500 to-purple-600' : 'bg-white/20'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => audioEngine.nextTrack()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
            aria-label="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <button onClick={handleToggleMute} className="text-slate-400 hover:text-white p-1">
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-roseGlow-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (isMuted) setIsMuted(false);
            audioEngine.setVolume(v);
          }}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-roseGlow-500"
          aria-label="Volume Slider"
        />
        <span className="text-[10px] font-mono text-slate-400 w-7 text-right">
          {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
        </span>
      </div>
    </div>
  );
};

