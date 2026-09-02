'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  AlertTriangle,
  LogIn,
  ArrowLeft,
  Sparkles,
  Heart,
} from 'lucide-react';
import { AUTH_CONFIG } from '@/data/config';

interface BlockedSession {
  id: string;
  deviceName: string;
  userName?: string;
  createdAt: string;
  lastSeenAt: string;
}

type LoginStep = 'enter' | 'blocked' | 'success';

function LoginContent() {
  const searchParams = useSearchParams();
  const rawRedirect = searchParams?.get('redirect');
  const redirectTarget = rawRedirect && !rawRedirect.startsWith('/login') ? rawRedirect : '/';

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

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Read from state or directly from DOM inputs to support autofill & password managers
    const emailInput = (document.getElementById('login-email') as HTMLInputElement)?.value || email;
    const passInput = (document.getElementById('login-password') as HTMLInputElement)?.value || password;

    const cleanEmail = (emailInput || '').trim();
    const cleanPassword = (passInput || '').trim();

    if (!cleanEmail) {
      setError('Please enter your registered email address or phone number.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoggedInUser(data.user);
        setStep('success');
        try {
          localStorage.setItem('mili_user', JSON.stringify(data.user));
          if (data.user.role === 'sukhen' || data.user.role === 'mili') {
            localStorage.setItem('mili_admin_authenticated', 'true');
          }
          if (data.sessionId) {
            localStorage.setItem('mili_session_ref', data.sessionId);
          }
          window.dispatchEvent(new Event('auth-changed'));
        } catch {}

        setTimeout(() => {
          window.location.replace(redirectTarget);
        }, 600);
      } else if (res.status === 403 && data.code === 'MAX_DEVICES') {
        setBlockedSessions(data.sessions || []);
        setStep('blocked');
      } else {
        setError(data.error || 'Invalid email or password. Please try again.');
      }
    } catch {
      setError('Unable to connect to authentication server. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const isSukhenTyping =
    email.toLowerCase().includes('sukhen') || email.toLowerCase().includes('das');

  return (
    <main className="min-h-[100dvh] w-full bg-[#06040a] flex flex-col justify-between items-center py-6 sm:py-10 px-4 sm:px-6 relative overflow-hidden selection:bg-roseGlow-500 selection:text-white">
      {/* ── Rich Ambient Background Lighting ─────────────────────── */}
      {/* Top Center Glow */}
      <div
        className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-colors duration-700 ${
          isSukhenTyping ? 'bg-purple-600/20' : 'bg-roseGlow-600/20'
        }`}
      />

      {/* Center Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Bottom Subtle Ambient Sheen */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[400px] bg-gradient-to-t from-purple-900/25 via-roseGlow-950/20 to-transparent rounded-full blur-[130px] pointer-events-none" />

      {/* Floating Stardust Particles across entire viewport */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-roseGlow-400/40 animate-pulse-slow"
            style={{
              left: `${(i * 13 + 7) % 100}%`,
              top: `${(i * 19 + 5) % 100}%`,
              animationDelay: `${(i * 0.3) % 4}s`,
              animationDuration: `${3 + ((i * 0.5) % 4)}s`,
            }}
          />
        ))}
      </div>

      {/* Top Header Placeholder / Balance */}
      <div className="w-full flex items-center justify-center pt-2 opacity-0 select-none pointer-events-none sm:block">
        <span className="text-[10px] font-mono tracking-widest text-slate-600 uppercase">
          Suksharmi Universe Gate
        </span>
      </div>

      {/* ── Main Center Login Card Container ──────────────────────── */}
      <div className="relative z-10 w-full max-w-md my-auto py-2">
        {/* ── STEP 1: Email + Password Login Form ─────────────────── */}
        {step === 'enter' && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            {/* Header Title & Brand Emblem */}
            <div className="text-center space-y-2.5">
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 p-0.5 shadow-glow-lg mx-auto border border-white/20 overflow-hidden group hover:scale-105 transition-transform">
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
              </div>

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
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-email"
                    className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-roseGlow-400" />
                    <span>Email Address or Phone</span>
                  </label>
                  <input
                    type="text"
                    id="login-email"
                    name="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter email or phone number"
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500/60 focus:ring-2 focus:ring-roseGlow-500/20 transition-all"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-roseGlow-400" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
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
                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-mono flex items-start gap-2 animate-fadeIn">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 cursor-pointer"
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
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-white/5">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-roseGlow-400" />
                  <span>Max {AUTH_CONFIG.maxDevices} devices</span>
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>Encrypted Session</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Max Devices Blocked ─────────────────────────── */}
        {step === 'blocked' && (
          <div className="space-y-6 animate-fade-in">
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
              className="w-full py-3 rounded-2xl glass-card text-sm text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 font-mono cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </button>
          </div>
        )}

        {/* ── STEP 3: Login Success ────────────────────────────────── */}
        {step === 'success' && loggedInUser && (
          <div className="text-center space-y-6 animate-fade-in">
            <div
              className={`inline-flex w-20 h-20 rounded-full bg-gradient-to-tr ${
                loggedInUser.role === 'sukhen'
                  ? 'from-purple-600 to-indigo-600'
                  : 'from-roseGlow-600 to-pink-600'
              } items-center justify-center text-white text-3xl font-bold shadow-glow-lg mx-auto`}
            >
              {loggedInUser.name[0]}
            </div>

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
          </div>
        )}
      </div>

      {/* ── Bottom Brand Romantic Footer ──────────────────────────── */}
      <footer className="relative z-10 w-full text-center pt-4 pb-2 animate-fadeIn">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm shadow-sm text-[11px] font-mono text-slate-400">
          <Sparkles className="w-3 h-3 text-roseGlow-400" />
          <span>Designed with infinite love for</span>
          <span className="text-roseGlow-300 font-semibold flex items-center gap-0.5">
            Mili <Heart className="w-2.5 h-2.5 fill-roseGlow-500 text-roseGlow-500 inline" />
          </span>
          <span className="text-slate-500">• Forever</span>
        </div>
      </footer>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#06040a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-roseGlow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
