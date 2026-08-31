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
    <div className="fixed bottom-6 left-4 sm:left-6 z-40 flex items-center gap-3">
      {/* Optional First Time Banner / Enter Experience Pill */}
      {!hasInteracted && !isPlaying && (
        <button
          onClick={togglePlay}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-roseGlow-500/30 hover:border-roseGlow-500/60 text-xs font-medium text-slate-200 shadow-glow transition-all hover:scale-105 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
          <span>Enter the experience 🎵</span>
        </button>
      )}

      {/* Floating Audio Controller */}
      <div className="glass-card px-3 py-2 rounded-full flex items-center gap-2 border border-white/10 shadow-lg">
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
          className={`p-2 rounded-full transition-colors ${
            isPlaying ? "bg-roseGlow-500 text-white shadow-glow" : "bg-white/5 text-slate-300 hover:text-white"
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-2 pr-1 animate-fadeIn">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white transition-colors"
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
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-roseGlow-500"
              aria-label="Volume slider"
            />
          </div>
        )}
      </div>
    </div>
  );
};
