'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Sparkles } from 'lucide-react';
import { audioEngine } from '@/lib/audio';

export const AmbientAudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if user previously had music on
    const saved = localStorage.getItem('mili_ambient_audio');
    if (saved === 'playing') {
      // Browsers restrict auto audio until first gesture
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
      localStorage.setItem('mili_ambient_audio', 'paused');
    } else {
      audioEngine.play();
      setIsPlaying(true);
      setHasInteracted(true);
      localStorage.setItem('mili_ambient_audio', 'playing');
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted) setIsMuted(false);
    audioEngine.setVolume(val);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 flex items-center gap-2.5">
      {/* First Time Intro Banner (Hidden once interacted) */}
      {!hasInteracted && !isPlaying && (
        <button
          onClick={togglePlay}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-roseGlow-500/40 hover:border-roseGlow-500/70 text-xs font-mono text-slate-200 shadow-glow transition-all hover:scale-105 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
          <span>Play Romantic Music 🎵</span>
        </button>
      )}

      {/* Floating Audio Controller */}
      <div className={`glass-card px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full flex items-center gap-2 border transition-all duration-300 shadow-2xl ${
        isPlaying ? 'border-roseGlow-500/50 shadow-glow bg-obsidian-950/95' : 'border-white/10 bg-obsidian-950/80'
      }`}>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
          className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 active:scale-90 ${
            isPlaying ? "bg-gradient-to-r from-roseGlow-600 to-purple-600 text-white shadow-glow animate-pulse" : "bg-white/10 text-slate-300 hover:text-white hover:bg-white/20"
          }`}
          title={isPlaying ? "Pause Romantic Music" : "Play Romantic Music"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-2 pr-1 animate-fadeIn">
            <span className="hidden sm:inline-block text-[10px] font-mono text-roseGlow-300 animate-pulse">
              Playing 🎵
            </span>
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Toggle mute"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-roseGlow-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-14 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-roseGlow-500"
              aria-label="Volume slider"
            />
          </div>
        )}
      </div>
    </div>
  );
};
