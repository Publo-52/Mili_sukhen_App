'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  Smartphone,
  AlertTriangle,
  LogIn,
  Shield,
  ArrowLeft,
  KeyRound,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AUTH_USERS, AUTH_CONFIG } from '@/data/config';

interface BlockedSession {
  id: string;
  deviceName: string;
  userName?: string;
  createdAt: string;
  lastSeenAt: string;
}

type LoginStep = 'enter' | 'blocked' | 'success';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<LoginStep>('enter');
  const [blockedSessions, setBlockedSessions] = useState<BlockedSession[]>([]);
  const [loggedInUser, setLoggedInUser] = useState<{
    name: string;
    role: string;
    avatar: string;
    title: string;
    greeting: string;
  } | null>(null);
  const [showAccountsGuide, setShowAccountsGuide] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace(redirectTarget);
        }
      })
      .catch(() => {});
  }, [router, redirectTarget]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoggedInUser(data.user);
        setStep('success');
        try {
          localStorage.setItem('mili_user', JSON.stringify(data.user));
          if (data.sessionId) {
            localStorage.setItem('mili_session_ref', data.sessionId);
          }
          window.dispatchEvent(new Event('auth-changed'));
        } catch {}
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 1200);
      } else if (res.status === 403 && data.code === 'MAX_DEVICES') {
        setBlockedSessions(data.sessions || []);
        setStep('blocked');
      } else {
        setError(data.error || 'Invalid email or password. Please try again.');
      }
    } catch {
      setError('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (userType: 'mili' | 'sukhen') => {
    const user = AUTH_USERS[userType];
    setEmail(user.defaultEmail);
    setPassword(user.defaultPassword);
    setError('');
  };

  const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  const isSukhenTyping = email.toLowerCase().includes('sukhen') || email.toLowerCase().includes('admin');

  return (
    <main className="min-h-screen bg-[#06040a] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden selection:bg-roseGlow-500 selection:text-white">
      {/* Ambient background glows */}
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
          isSukhenTyping ? 'bg-purple-600/15' : 'bg-roseGlow-600/15'
        }`}
      />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-roseGlow-400/30 animate-pulse-slow"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${(i * 0.4) % 4}s`,
              animationDuration: `${3 + ((i * 0.7) % 4)}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Email + Password Login Form ─────────────────── */}
          {step === 'enter' && (
            <motion.div
              key="enter"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Header Title */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 240, delay: 0.1 }}
                  className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 p-0.5 shadow-glow-lg mx-auto border border-white/20 overflow-hidden"
                >
                  <div className="w-full h-full rounded-[22px] bg-[#0c0817] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Suksharmi Logo"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </motion.div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2 flex-wrap">
                    <span>Sign in to</span>
                    <span className="font-stylish text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-pink-300 to-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                      Suksharmi
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 font-light">
                    Enter your email address and password to enter the universe
                  </p>
                </div>
              </div>

              {/* Login Card */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-5">
                {/* 1-Click Quick Fill Chips */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Quick 1-Click Accounts:</span>
                    <button
                      type="button"
                      onClick={() => setShowAccountsGuide(!showAccountsGuide)}
                      className="text-roseGlow-400 hover:underline flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" />
                      <span>{showAccountsGuide ? 'Hide info' : 'View logins'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('mili')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-roseGlow-600/20 border border-white/10 hover:border-roseGlow-500/40 text-left transition-all group flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-roseGlow-500/20 text-roseGlow-400 border border-roseGlow-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        M
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white group-hover:text-roseGlow-300">
                          Mili
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          mandalsharmili@06gmail.com
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill('sukhen')}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/10 hover:border-purple-500/40 text-left transition-all group flex items-center gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        S
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white group-hover:text-purple-300">
                          Sukhen (Admin)
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          dassukhen@gmail.com
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Accounts Guide Dropdown */}
                <AnimatePresence>
                  {showAccountsGuide && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs"
                    >
                      <p className="font-mono text-slate-300 font-semibold text-[11px]">
                        Registered User Credentials:
                      </p>
                      <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-roseGlow-300 font-bold block">Mili</span>
                          <span>Email: <code>mandalsharmili@06gmail.com</code> (or <code>mandalsharmili06@gmail.com</code>)</span>
                          <span className="block">Password: <code>mili@123</code></span>
                        </div>
                        <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-purple-300 font-bold block">Sukhen (Creator & Admin)</span>
                          <span>Email: <code>dassukhen@gmail.com</code></span>
                          <span className="block">Password: <code>das@123</code></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-roseGlow-400" />
                      <span>Email Address</span>
                    </label>
                    <input
                      type="text"
                      id="login-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter your email address"
                      required
                      autoFocus
                      className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/60 focus:ring-2 focus:ring-roseGlow-500/20 transition-all"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-roseGlow-400" />
                      <span>Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="Enter your password"
                        required
                        className="w-full px-4 py-3.5 pr-12 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/60 focus:ring-2 focus:ring-roseGlow-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-red-400 font-mono flex items-center gap-1.5 pt-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{error}</span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password.trim()}
                    className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing you in…</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer status */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-roseGlow-400" />
                    <span>Max {AUTH_CONFIG.maxDevices} active devices</span>
                  </span>
                  <span className="text-slate-500">Secure Session</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Max Devices Blocked ─────────────────────────── */}
          {step === 'blocked' && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 items-center justify-center mx-auto shadow-glow-gold">
                  <Smartphone className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    Maximum Devices Reached
                  </h2>
                  <p className="text-sm text-slate-400 mt-1 font-light max-w-sm mx-auto">
                    You are already logged in on{' '}
                    <span className="text-amber-400 font-semibold">
                      {AUTH_CONFIG.maxDevices} devices
                    </span>
                    . Please log out from another device or clear sessions from the Admin portal.
                  </p>
                </div>
              </div>

              {/* Blocked Sessions List */}
              <div className="glass-card rounded-3xl p-5 border border-white/10 space-y-3">
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-1">
                  Active Devices
                </p>

                {blockedSessions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Session list unavailable.
                  </p>
                ) : (
                  blockedSessions.map((session, i) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-roseGlow-500/10 border border-roseGlow-500/20 flex items-center justify-center text-roseGlow-400 text-xs font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{session.deviceName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Last active {formatRelativeTime(session.lastSeenAt)}
                          </p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setStep('enter')}
                className="w-full py-3 rounded-2xl glass-card text-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Login Success ────────────────────────────────── */}
          {step === 'success' && loggedInUser && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
                className={`inline-flex w-20 h-20 rounded-full bg-gradient-to-tr ${
                  loggedInUser.role === 'sukhen'
                    ? 'from-purple-600 to-indigo-600'
                    : 'from-roseGlow-600 to-pink-600'
                } items-center justify-center text-white text-3xl font-bold shadow-glow-lg mx-auto`}
              >
                {loggedInUser.name[0]}
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white">
                  Welcome, {loggedInUser.name}!
                </h2>
                <p className="text-slate-300 font-light text-base max-w-sm mx-auto">
                  {loggedInUser.greeting}
                </p>
                <p className="text-xs text-roseGlow-400 font-mono animate-pulse pt-2">
                  Opening universe portal…
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-roseGlow-500 animate-bounce" />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                />
                <div
                  className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06040a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-roseGlow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
