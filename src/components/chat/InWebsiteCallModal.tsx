'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { ActiveCallState } from '@/app/api/calls/route';

interface InWebsiteCallModalProps {
  call: ActiveCallState | null;
  currentUserRole: 'sukhen' | 'mili' | 'guest';
  onEndCall: () => void;
  onAcceptCall: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const InWebsiteCallModal: React.FC<InWebsiteCallModalProps> = ({
  call,
  currentUserRole,
  onEndCall,
  onAcceptCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; scale: number }[]>([]);
  const [activeFilter, setActiveFilter] = useState<'none' | 'rose' | 'starlight' | 'vintage'>('none');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnRef = useRef<RTCPeerConnection | null>(null);
  const ringtoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isIncoming = call && call.status === 'ringing' && call.receiverRole === currentUserRole;
  const isOutgoingRinging = call && call.status === 'ringing' && call.callerRole === currentUserRole;
  const isConnected = call && call.status === 'connected';

  const partnerName = currentUserRole === 'sukhen' ? 'Mili' : 'Sukhen';
  const partnerAvatar = currentUserRole === 'sukhen' ? 'M' : 'S';
  const partnerPhone = currentUserRole === 'sukhen' ? '+91 97329 34032' : '+91 98326 95291';

  // ─── 1. Sweet Ringtone Synthesizer & Phone Vibration ────────────────────────────
  const playRingtoneChime = () => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.28);
      });

      // Vibrate mobile devices on ring
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([300, 150, 300, 150, 500]);
      }
    } catch (e) {
      // Audio context may be restricted before interaction
    }
  };

  useEffect(() => {
    if (call?.status === 'ringing') {
      playRingtoneChime();
      ringtoneTimerRef.current = setInterval(playRingtoneChime, 2400);
    }
    return () => {
      if (ringtoneTimerRef.current) clearInterval(ringtoneTimerRef.current);
    };
  }, [call?.status]);

  // ─── 2. WebRTC Peer Connection & Media Streams ───────────────────────────────────
  useEffect(() => {
    let activePeer: RTCPeerConnection | null = null;

    const initWebRTC = async () => {
      if (!call || call.status === 'ended' || call.status === 'declined') return;

      try {
        // 1. Get Local Camera & Microphone
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: call.type === 'video' ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
            audio: true,
          });
          localStreamRef.current = stream;
          setHasCameraPermission(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (mediaErr) {
          console.warn('Camera/Mic permission fallback:', mediaErr);
          setHasCameraPermission(false);
          // Audio-only fallback
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true }).catch(() => new MediaStream());
          localStreamRef.current = stream;
        }

        // 2. Setup RTCPeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        activePeer = pc;
        peerConnRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream tracks
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = event.streams[0];
            }
            setHasRemoteVideo(true);
          }
        };

        // ICE candidate exchange
        pc.onicecandidate = async (event) => {
          if (event.candidate) {
            try {
              await fetch('/api/calls', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  newCandidate: {
                    role: currentUserRole,
                    candidate: event.candidate.toJSON(),
                  },
                }),
              });
            } catch (err) {
              console.warn('ICE candidate send error:', err);
            }
          }
        };

        // 3. Caller: Create SDP Offer if caller
        if (call.callerRole === currentUserRole && !call.sdpOffer) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await fetch('/api/calls', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sdpOffer: JSON.stringify(offer) }),
          });
        }

        // 4. Receiver: If connected and SDP offer exists, create Answer
        if (call.status === 'connected' && call.receiverRole === currentUserRole && call.sdpOffer && !call.sdpAnswer) {
          const remoteOffer = JSON.parse(call.sdpOffer);
          await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await fetch('/api/calls', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sdpAnswer: JSON.stringify(answer) }),
          });
        }

        // 5. Caller: Set Remote Description when SDP Answer arrives
        if (call.status === 'connected' && call.callerRole === currentUserRole && call.sdpAnswer && !pc.remoteDescription) {
          const remoteAnswer = JSON.parse(call.sdpAnswer);
          await pc.setRemoteDescription(new RTCSessionDescription(remoteAnswer));
        }

        // 6. Consume remote ICE candidates
        if (call.iceCandidates && call.iceCandidates.length > 0) {
          for (const cand of call.iceCandidates) {
            if (cand.role !== currentUserRole && cand.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand.candidate));
              } catch (e) {
                // candidate could already be added
              }
            }
          }
        }
      } catch (err) {
        console.warn('WebRTC Initialization warning:', err);
      }
    };

    initWebRTC();

    return () => {
      if (activePeer) {
        activePeer.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [isConnected, isOutgoingRinging, isIncoming, call, currentUserRole]);

  // ─── 3. Call Duration Timer ────────────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  // ─── 4. Toggle Controls ────────────────────────────────────────────────────────
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const sendInCallHeart = () => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 + 10;
    const scale = Math.random() * 0.6 + 0.8;
    setFloatingHearts((prev) => [...prev, { id, x, scale }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2500);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!call || call.status === 'ended' || call.status === 'declined') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#06040a]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none"
      >
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* CASE A: INCOMING CALL RINGING SCREEN */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {isIncoming && (
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-3xl bg-[#111b21] border border-emerald-500/40 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Animated Glow Rings */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-rose-500/5 to-transparent pointer-events-none" />

            <div className="relative mx-auto w-28 h-28">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-5xl shadow-2xl border-4 border-emerald-400">
                {partnerAvatar}
              </div>
              <span className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-60" />
            </div>

            <div className="space-y-1 relative z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Incoming {call.type === 'video' ? '📹 Video Call' : '📞 Voice Call'}
              </span>
              <h3 className="text-2xl font-bold text-white pt-2">
                {partnerName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {partnerPhone} • In-Website Private Line
              </p>
              <p className="text-xs text-emerald-400 font-medium animate-pulse pt-2">
                Calling your heart right now… 💕
              </p>
            </div>

            {/* Accept / Decline Buttons */}
            <div className="flex items-center justify-center gap-6 pt-4 relative z-10">
              <button
                onClick={onEndCall}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-slate-400">Decline</span>
              </button>

              <button
                onClick={onAcceptCall}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 transition-transform group-hover:scale-110 animate-bounce">
                  <Phone className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-medium text-emerald-300 font-bold">Accept Call</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* CASE B: OUTGOING RINGING SCREEN */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {isOutgoingRinging && (
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm rounded-3xl bg-[#111b21] border border-white/15 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="relative mx-auto w-24 h-24">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-4xl shadow-xl">
                {partnerAvatar}
              </div>
              <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-white/5 text-roseGlow-300 border border-white/10">
                Calling {call.type === 'video' ? 'Video' : 'Voice'}…
              </span>
              <h3 className="text-xl font-bold text-white pt-2">
                {partnerName}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {partnerPhone}
              </p>
              <p className="text-xs text-rose-400 font-medium animate-pulse pt-2">
                Ringing on {partnerName}&apos;s device…
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={onEndCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white mx-auto flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                title="Cancel Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {/* CASE C: ACTIVE CONNECTED CALL ROOM */}
        {/* ═════════════════════════════════════════════════════════════════════════ */}
        {isConnected && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="relative w-full max-w-4xl h-[85vh] max-h-[720px] rounded-3xl bg-[#0c1317] border border-white/15 overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-lg shadow-md font-bold text-white">
                  {partnerAvatar}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{partnerName}</h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{formatTimer(callDuration)}</span>
                    <span className="text-slate-400">• Private In-Website Call</span>
                  </div>
                </div>
              </div>

              {/* Romantic Filter Selector */}
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-roseGlow-400" />
                <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">Filter:</span>
                {(['none', 'rose', 'starlight', 'vintage'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono transition-colors ${
                      activeFilter === f
                        ? 'bg-roseGlow-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Stage (Partner Screen) */}
            <div
              className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-700 ${
                activeFilter === 'rose'
                  ? 'hue-rotate-[-20deg] saturate-150'
                  : activeFilter === 'starlight'
                  ? 'brightness-110 contrast-105'
                  : activeFilter === 'vintage'
                  ? 'sepia-[0.3] contrast-95'
                  : ''
              }`}
              style={{
                backgroundColor: '#111b21',
                backgroundImage: 'radial-gradient(#1f2c34 1.5px, transparent 1.5px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Remote Video Stream or Avatar Mode */}
              {hasRemoteVideo && call.type === 'video' ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              ) : (
                /* Partner Viewport Simulation */
                <div className="text-center space-y-4 relative z-10">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center text-6xl shadow-2xl">
                      {partnerAvatar}
                    </div>
                    {/* Dancing Sound Equalizer Rings */}
                    <span className="absolute -inset-2 rounded-full border-2 border-emerald-400/40 animate-ping opacity-40" />
                    <span className="absolute -inset-6 rounded-full border border-pink-400/20 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white tracking-wide">
                      {partnerName}
                    </h3>
                    <p className="text-xs text-rose-300 font-serif italic">
                      Connected live in your digital universe ❤️
                    </p>
                  </div>

                  {/* Simulated Audio Equalizer Bars */}
                  <div className="flex items-center justify-center gap-1 pt-2 h-8">
                    {[40, 75, 100, 50, 85, 30, 95, 60, 45].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: isMuted ? 6 : [8, h * 0.35, 12, h * 0.28, 8] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.1 }}
                        className="w-1 rounded-full bg-gradient-to-t from-emerald-500 to-pink-400"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Picture-in-Picture Local Camera View */}
              <div className="absolute bottom-24 right-6 w-36 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-black/80 border-2 border-white/20 shadow-2xl z-20">
                {call.type === 'video' && !isVideoOff && hasCameraPermission ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-mono">You (Camera Off)</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                  You
                </div>
              </div>

              {/* Floating In-Call Hearts Animation */}
              {floatingHearts.map((h) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 1, y: 150, scale: h.scale }}
                  animate={{ opacity: 0, y: -300 }}
                  transition={{ duration: 2.2, ease: 'easeOut' }}
                  className="absolute pointer-events-none text-rose-500 text-3xl filter drop-shadow-glow"
                  style={{ left: `${h.x}%`, bottom: '20%' }}
                >
                  ❤️
                </motion.div>
              ))}
            </div>

            {/* Bottom Control Bar */}
            <div className="px-6 py-4 bg-[#111b21] border-t border-white/10 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <button
                  onClick={sendInCallHeart}
                  className="px-4 py-2 rounded-full bg-rose-600/30 hover:bg-rose-600 border border-rose-500/40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                >
                  <Heart className="w-4 h-4 fill-white text-white" />
                  <span>Send Love 💕</span>
                </button>
              </div>

              {/* Main Call Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`p-3.5 rounded-full transition-colors ${
                    isMuted
                      ? 'bg-rose-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {call.type === 'video' && (
                  <button
                    onClick={toggleVideo}
                    className={`p-3.5 rounded-full transition-colors ${
                      isVideoOff
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                    title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                <button
                  onClick={onEndCall}
                  className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/60 transition-transform hover:scale-110 active:scale-95 ml-2"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

              <div className="hidden sm:block text-right">
                <span className="text-[11px] text-slate-400 font-mono block">
                  Encrypted Direct Stream
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  HD Audio/Video • Active
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
