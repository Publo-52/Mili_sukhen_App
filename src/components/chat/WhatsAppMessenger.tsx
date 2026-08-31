'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  X,
  Phone,
  Video,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
  Check,
  CheckCheck,
  ExternalLink,
  Heart,
  Sparkles,
  Play,
  Pause,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  Volume2,
} from 'lucide-react';
import { DirectMessage } from '@/types';
import { AUTH_USERS, APP_CONFIG } from '@/data/config';
import { getWhatsAppUrl } from '@/lib/utils';
import { addMessage } from '@/lib/storage';
import { InWebsiteCallModal } from './InWebsiteCallModal';
import { ActiveCallState } from '@/app/api/calls/route';
import { useAuth } from '@/lib/auth-context';

export const WhatsAppMessenger: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Determine Current User & Partner
  const isSukhen = user?.role === 'sukhen';
  const partnerName = isSukhen ? 'Mili' : 'Sukhen';
  const partnerPhone = isSukhen ? '9732934032' : '9832695291';
  const partnerFormattedPhone = isSukhen ? '+91 97329 34032' : '+91 98326 95291';
  const partnerAvatar = isSukhen ? 'M' : 'S';
  const partnerWhatsAppUrl = getWhatsAppUrl(
    partnerPhone,
    inputText.trim() || `Hi ${isSukhen ? 'Mili' : 'Sukhen'}!`
  );

  // Fetch & Poll Messages & Active Calls
  const fetchMessagesAndCalls = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // 1. Messages
      const msgRes = await fetch('/api/messages');
      if (msgRes.ok) {
        const data = await msgRes.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);

          if (!isOpen) {
            const currentRole = user?.role;
            const unread = data.messages.filter(
              (m: DirectMessage) =>
                !m.read &&
                ((currentRole === 'sukhen' && m.senderRole === 'mili') ||
                  (currentRole === 'mili' && m.senderRole === 'sukhen'))
            ).length;
            setUnreadCount(unread);
          }
        }
      }

      // 2. Active Call Signaling
      const callRes = await fetch('/api/calls');
      if (callRes.ok) {
        const callData = await callRes.json();
        if (callData.success) {
          setActiveCall(callData.activeCall);
        }
      }
    } catch (e) {
      console.warn('Poll error:', e);
    }
  }, [isAuthenticated, isOpen, user?.role]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchMessagesAndCalls();
    const interval = setInterval(fetchMessagesAndCalls, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchMessagesAndCalls]);

  // Call Actions
  const handleStartCall = async (type: 'audio' | 'video') => {
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeCall) {
          setActiveCall(data.activeCall);
        }
      }
    } catch (e) {
      console.error('Call initiation error:', e);
    }
  };

  const handleAcceptCall = async () => {
    try {
      const res = await fetch('/api/calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'connected' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeCall) {
          setActiveCall(data.activeCall);
        }
      }
    } catch (e) {
      console.error('Call accept error:', e);
    }
  };

  const handleEndCall = async () => {
    try {
      await fetch('/api/calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      });
      setActiveCall(null);
    } catch (e) {
      console.error('Call end error:', e);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen, partnerTyping]);

  // Play subtle incoming message pop chime
  const playChime = () => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  // Send Message
  const handleSendMessage = async (customText?: string, extraData?: Partial<DirectMessage>) => {
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() && !extraData?.isVoiceNote && !extraData?.mediaUrl) return;

    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    const tempMsg: DirectMessage = {
      id: `temp-${Date.now()}`,
      sender: user?.name || (isSukhen ? 'Sukhen' : 'Mili'),
      senderRole: user?.role === 'sukhen' ? 'sukhen' : 'mili',
      senderPhone: isSukhen ? '+91 98326 95291' : '+91 97329 34032',
      message: textToSend.trim(),
      mood: '❤️',
      createdAt: new Date().toISOString(),
      read: false,
      ...extraData,
    };

    setMessages((prev) => [...prev, tempMsg]);
    playChime();

    // Also persist in localStorage for offline resilience
    try {
      addMessage({
        sender: tempMsg.sender,
        message: tempMsg.message,
        mood: tempMsg.mood as any,
      });
    } catch {}

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempMsg),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.data) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempMsg.id ? result.data : m))
          );
        }
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  // Send Preset Love Reactions / Stickers
  const handleSendSticker = (sticker: string, label: string) => {
    handleSendMessage(`${sticker} ${label}`, {
      mediaType: 'sticker',
      mood: sticker,
    });
  };

  // Send Voice Note Simulation
  const handleSendVoiceNote = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      handleSendMessage('🎤 Voice Note (0:12) — "I love you so much Mili ❤️"', {
        isVoiceNote: true,
        voiceDuration: '0:12',
      });
    }, 1800);
  };

  // React to Message
  const handleReactToMessage = async (msgId: string, reactionEmoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reaction: m.reaction === reactionEmoji ? undefined : reactionEmoji }
          : m
      )
    );

    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: msgId, reaction: reactionEmoji }),
      });
    } catch (e) {
      console.warn('React error:', e);
    }
  };

  const quickLoveEmojis = ['❤️', '🥺', '🌸', '😘', '🍫', '🧸', '🌹', '💍', '✨', '🥰', '🌙', '💌'];

  const quickStickers = [
    { emoji: '🌹', title: 'A Red Rose for You' },
    { emoji: '🍫', title: 'Sweet Chocolate' },
    { emoji: '🧸', title: 'Teddy Hug' },
    { emoji: '💌', title: 'Love Letter' },
    { emoji: '💍', title: 'Forever Promise' },
    { emoji: '👑', title: 'For My Queen' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 1. Floating WhatsApp Launcher Widget at Bottom-Right */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-xl backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{unreadCount} new message from {partnerName}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-3.5 sm:p-4 rounded-full bg-gradient-to-tr from-[#25D366] via-[#128C7E] to-[#075E54] text-white shadow-2xl shadow-emerald-900/60 border border-emerald-400/40 flex items-center justify-center group"
          aria-label="Open WhatsApp Messenger"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              {/* WhatsApp Icon SVG */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>

              {/* Glowing unread badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center border-2 border-obsidian-950 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </motion.button>
      </div>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 2. Full WhatsApp Messenger Modal / Drawer */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 bottom-20 right-3 left-3 sm:left-auto sm:right-6 bg-[#111b21] rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col transition-all duration-300 ${
              isExpanded
                ? 'w-auto sm:w-[620px] h-[85dvh] max-h-[800px]'
                : 'w-auto sm:w-[420px] h-[560px] max-h-[82dvh]'
            }`}
          >
            {/* ─── Header Bar (WhatsApp Emerald / Dark Theme) ────────────────────────── */}
            <div className="bg-[#202c33] px-4 py-3 border-b border-white/10 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {/* Partner Avatar with Online Ring */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-lg font-bold text-white shadow-md">
                    {partnerAvatar}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] border-2 border-[#202c33]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {partnerName}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-500/30">
                      Private
                    </span>
                  </div>
                  <p className="text-[11px] text-[#25D366] font-medium flex items-center gap-1">
                    <span>online</span>
                    <span className="text-slate-400 text-[10px]">• {partnerFormattedPhone}</span>
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 text-slate-300">
                <button
                  onClick={() => handleStartCall('video')}
                  className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                  title="In-Website Video Call"
                >
                  <Video className="w-4 h-4 text-emerald-400" />
                </button>
                <button
                  onClick={() => handleStartCall('audio')}
                  className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                  title="In-Website Voice Call"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                </button>
                <a
                  href={partnerWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Open in WhatsApp App"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:block p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors ml-1"
                  title="Close Chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─── WhatsApp Chat Feed (Wallpaper Pattern) ────────────────────────────── */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 relative"
              style={{
                backgroundColor: '#0b141a',
                backgroundImage: `radial-gradient(#1f2c34 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
              }}
            >
              {/* E2E Encryption Banner */}
              <div className="flex justify-center my-2">
                <div className="px-3 py-1 rounded-lg bg-[#182229] border border-white/5 text-[11px] text-[#ffd279] text-center max-w-xs shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#ffd279] flex-shrink-0" />
                  <span>🔒 End-to-end private love line between Sukhen & Mili.</span>
                </div>
              </div>

              {/* Messages list */}
              {messages.map((msg) => {
                const isMine =
                  (user?.role === 'sukhen' && msg.senderRole === 'sukhen') ||
                  (user?.role === 'mili' && msg.senderRole === 'mili') ||
                  (user?.name ? msg.sender?.toLowerCase().includes(user.name.toLowerCase()) : false);

                const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                  >
                    <div
                      className={`relative max-w-[82%] sm:max-w-[75%] px-3.5 py-2 rounded-2xl shadow-md text-sm leading-relaxed ${
                        isMine
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none'
                          : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                      }`}
                    >
                      {/* Sender tag if received */}
                      {!isMine && (
                        <p className="text-[11px] font-bold text-[#53bdeb] mb-0.5">
                          {msg.sender}
                        </p>
                      )}

                      {/* Message Content */}
                      {msg.isVoiceNote ? (
                        <div className="flex items-center gap-2.5 py-1">
                          <button
                            onClick={() =>
                              setPlayingVoiceId(playingVoiceId === msg.id ? null : msg.id)
                            }
                            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                          >
                            {playingVoiceId === msg.id ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-28 bg-white/20 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-[#25D366] transition-all duration-300 ${
                                  playingVoiceId === msg.id ? 'w-full animate-pulse' : 'w-1/3'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {msg.voiceDuration || '0:14'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      )}

                      {/* Timestamp and Double Checkmark */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                        <span>{timeFormatted}</span>
                        {isMine && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        )}
                      </div>

                      {/* Message Reaction Badge */}
                      {msg.reaction && (
                        <span className="absolute -bottom-2 right-2 px-1.5 py-0.2 rounded-full bg-[#202c33] border border-white/10 text-xs shadow-sm">
                          {msg.reaction}
                        </span>
                      )}
                    </div>

                    {/* Quick Reaction Tray on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1">
                      {['❤️', '🥺', '🌸', '😘', '🔥'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReactToMessage(msg.id, emoji)}
                          className="text-xs hover:scale-125 transition-transform p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Partner typing indicator */}
              {partnerTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono italic">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce delay-200" />
                  </div>
                  <span>{partnerName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Emoji / Sticker Tray Popup ────────────────────────────────────────── */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#202c33] px-3 py-2.5 border-t border-white/10 flex flex-wrap gap-2 z-10"
                >
                  {quickLoveEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setInputText((prev) => prev + emoji)}
                      className="text-xl p-1 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Attachment Menu Popup ────────────────────────────────────────────── */}
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-[#202c33] p-3 border-t border-white/10 grid grid-cols-3 gap-2 z-10"
                >
                  {quickStickers.map((sticker) => (
                    <button
                      key={sticker.title}
                      onClick={() => handleSendSticker(sticker.emoji, sticker.title)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs transition-colors"
                    >
                      <span className="text-2xl">{sticker.emoji}</span>
                      <span className="text-[10px] text-center font-medium truncate w-full">
                        {sticker.title}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── WhatsApp Input Bar ────────────────────────────────────────────────── */}
            <div className="bg-[#202c33] px-3 py-2.5 border-t border-white/10 flex items-center gap-2 z-10">
              <button
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowAttachMenu(false);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showEmojiPicker ? 'text-[#25D366] bg-white/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Love Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setShowAttachMenu(!showAttachMenu);
                  setShowEmojiPicker(false);
                }}
                className={`p-2 rounded-full transition-colors ${
                  showAttachMenu ? 'text-[#25D366] bg-white/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Send Stickers & Cards"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message…"
                className="flex-1 bg-[#2a3942] text-white text-base sm:text-sm px-4 py-2.5 rounded-xl border border-transparent focus:border-emerald-500/50 focus:outline-none placeholder-slate-400"
              />

              {inputText.trim() ? (
                <div className="flex items-center gap-1.5">
                  <a
                    href={getWhatsAppUrl(partnerPhone, inputText.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/30 transition-all flex items-center justify-center"
                    title="Send via official WhatsApp app"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleSendMessage()}
                    className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#029071] text-white shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="Send in-app"
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <a
                    href={partnerWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white/5 hover:bg-[#25D366]/20 text-slate-300 hover:text-[#25D366] transition-all flex items-center justify-center"
                    title="Open WhatsApp app"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={handleSendVoiceNote}
                    disabled={isRecordingVoice}
                    className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                      isRecordingVoice
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                    }`}
                    title="Hold/Tap to send voice note"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────────────────────── */}
      {/* 3. In-Website Audio & Video Calling Room Modal */}
      {/* ───────────────────────────────────────────────────────────────────────── */}
      <InWebsiteCallModal
        call={activeCall}
        currentUserRole={user?.role === 'sukhen' ? 'sukhen' : 'mili'}
        onAcceptCall={handleAcceptCall}
        onEndCall={handleEndCall}
      />
    </>
  );
};
