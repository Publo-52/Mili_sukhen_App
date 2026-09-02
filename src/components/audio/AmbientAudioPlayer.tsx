import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Sparkles, SkipBack, SkipForward } from 'lucide-react';
import { audioEngine, AudioTrack } from '@/lib/audio';

export const AmbientAudioPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack>(audioEngine.getCurrentTrack());
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((playing, track) => {
      setIsPlaying(playing);
      setCurrentTrack(track);
      if (playing) setHasInteracted(true);
    });
    return () => unsubscribe();
  }, []);

  const togglePlay = () => {
    if (audioEngine.getIsPlaying()) {
      audioEngine.pause();
    } else {
      audioEngine.play();
      setHasInteracted(true);
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
    <div className="hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-2.5">
      {/* First Time Intro Banner (Hidden once interacted) */}
      {!hasInteracted && !isPlaying && (
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border border-roseGlow-500/40 hover:border-roseGlow-500/70 text-xs font-mono text-slate-200 shadow-glow transition-all hover:scale-105 animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
          <span>Play Special Song 🎵</span>
        </button>
      )}

      {/* Floating Audio Controller */}
      <div className={`glass-card px-3 py-2 rounded-full flex items-center gap-2 border transition-all duration-300 shadow-2xl ${
        isPlaying ? 'border-roseGlow-500/50 shadow-glow bg-obsidian-950/95' : 'border-white/10 bg-obsidian-950/80'
      }`}>
        <button
          onClick={() => audioEngine.prevTrack()}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          title="Previous Track"
          aria-label="Previous Track"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause ambient sound" : "Play ambient sound"}
          className={`p-2.5 rounded-full transition-all duration-300 active:scale-90 ${
            isPlaying ? "bg-gradient-to-r from-roseGlow-600 to-purple-600 text-white shadow-glow animate-pulse" : "bg-white/10 text-slate-300 hover:text-white hover:bg-white/20"
          }`}
          title={isPlaying ? `Pause (${currentTrack.title})` : `Play Romantic Music (${currentTrack.title})`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => audioEngine.nextTrack()}
          className="text-slate-400 hover:text-white p-1 transition-colors"
          title="Next Track"
          aria-label="Next Track"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {isPlaying && (
          <div className="flex items-center gap-2 pr-1 animate-fadeIn">
            <span className="text-[10px] font-mono text-roseGlow-300 max-w-[110px] truncate">
              {currentTrack.title}
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
              className="w-14 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-roseGlow-500"
              aria-label="Volume slider"
            />
          </div>
        )}
      </div>
    </div>
  );
};
