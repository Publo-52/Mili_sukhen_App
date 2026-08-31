'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  KeyRound,
  Unlock,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  MessageSquareHeart,
  Layers,
  ArrowLeft,
  Download,
  Smartphone,
  WifiOff,
  RefreshCw,
  Clock,
  Monitor,
  Check,
} from 'lucide-react';
import { Project, DirectMessage, ProjectCategory, TurtleCreation, LoveNote } from '@/types';
import { APP_CONFIG, AUTH_CONFIG } from '@/data/config';
import { ProjectEditorModal } from '@/components/projects/ProjectEditorModal';
import { TurtleEditorModal } from '@/components/turtle/TurtleEditorModal';
import { LoveNoteEditorModal } from '@/components/love-notes/LoveNoteEditorModal';
import { Wand2, Terminal, Heart, Feather, BookOpen } from 'lucide-react';
import {
  getProjects,
  saveProject,
  deleteProject,
  resetProjectsToDefault,
  getTurtleCreations,
  saveTurtleCreation,
  deleteTurtleCreation,
  getLoveNotes,
  saveLoveNote,
  deleteLoveNote,
  getMessages,
  markMessageAsRead,
  replyToMessage,
  deleteMessage,
  isAdminLoggedIn,
  setAdminLoggedIn,
} from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'projects' | 'turtle' | 'love-notes' | 'sessions'>('projects');

  // Messages State
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Turtle Artworks State
  const [turtleCreations, setTurtleCreations] = useState<TurtleCreation[]>([]);
  const [isAddingTurtle, setIsAddingTurtle] = useState(false);
  const [editingTurtle, setEditingTurtle] = useState<TurtleCreation | null>(null);

  // Love Notes State
  const [loveNotes, setLoveNotes] = useState<LoveNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<LoveNote | null>(null);

  // Sessions State
  const [deviceSessions, setDeviceSessions] = useState<{
    id: string;
    userName: string;
    userRole: string;
    userEmail?: string;
    avatar?: string;
    deviceName: string;
    ip: string;
    createdAt: string;
    lastSeenAt: string;
    expiresAt: string;
  }[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // New Project Form Data
  const [newProject, setNewProject] = useState<Partial<Project>>({
    title: '',
    slug: '',
    description: '',
    detailedStory: '',
    category: 'Websites',
    url: '',
    githubUrl: '',
    thumbnail: '',
    technologies: ['React', 'Tailwind CSS'],
    createdAt: new Date().toISOString().split('T')[0],
    featured: true,
    order: 1,
  });

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { 'x-admin-token': APP_CONFIG.adminPasscode },
      });
      if (res.ok) {
        const data = await res.json();
        setDeviceSessions(data.sessions || []);
      }
    } catch {
      // ignore
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    // 1. Load Messages from API / Supabase
    try {
      const msgRes = await fetch('/api/messages');
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        if (msgData.messages && msgData.messages.length > 0) {
          setMessages(msgData.messages);
        } else {
          setMessages(getMessages());
        }
      } else {
        setMessages(getMessages());
      }
    } catch {
      setMessages(getMessages());
    }

    // 2. Load Projects from API / Supabase
    try {
      const projRes = await fetch('/api/projects');
      if (projRes.ok) {
        const projData = await projRes.json();
        if (projData.projects && projData.projects.length > 0) {
          setProjects(projData.projects);
        } else {
          setProjects(getProjects());
        }
      } else {
        setProjects(getProjects());
      }
    } catch {
      setProjects(getProjects());
    }

    // 3. Load Turtle Creations from API / Supabase
    try {
      const turtleRes = await fetch('/api/turtle');
      if (turtleRes.ok) {
        const turtleData = await turtleRes.json();
        if (turtleData.creations && turtleData.creations.length > 0) {
          setTurtleCreations(turtleData.creations);
        } else {
          setTurtleCreations(getTurtleCreations());
        }
      } else {
        setTurtleCreations(getTurtleCreations());
      }
    } catch {
      setTurtleCreations(getTurtleCreations());
    }

    // 4. Load Love Notes
    setLoveNotes(getLoveNotes());

    // 5. Load Active Device Sessions
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    // If Mili tries to access /admin, immediately redirect her to /
    if (user && user.role === 'mili') {
      window.location.replace('/');
      return;
    }

    const logged = isAdminLoggedIn() || isAdmin || user?.role === 'sukhen';
    if (logged) {
      setIsAuthenticated(true);
      setAdminLoggedIn(true);
      loadData();
    }
  }, [isAdmin, user, loadData]);

  const handleRevokeSession = async (sessionId: string, revokeAll = false) => {
    const label = revokeAll ? 'ALL active sessions' : 'this device session';
    if (!confirm(`Are you sure you want to revoke ${label}? That device will need to log in again.`)) return;
    try {
      await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify(revokeAll ? { revokeAll: true } : { sessionId }),
      });
      await loadSessions();
    } catch {
      alert('Failed to revoke session.');
    }
  };


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      passcode.trim() === APP_CONFIG.adminPasscode ||
      passcode.trim() === 'das@123' ||
      passcode.trim().toLowerCase() === 'sukhen'
    ) {
      setIsAuthenticated(true);
      setAdminLoggedIn(true);
      setLoginError(false);
      loadData();
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminLoggedIn(false);
  };

  // Message Handlers (Sync with Supabase DB)
  const handleMarkRead = async (id: string) => {
    const updated = markMessageAsRead(id);
    setMessages(updated);
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
    } catch {}
  };

  const handleSendReply = async (id: string) => {
    const reply = replyTextMap[id];
    if (!reply || !reply.trim()) return;
    const updated = replyToMessage(id, reply.trim());
    setMessages(updated);
    setReplyTextMap((prev) => ({ ...prev, [id]: '' }));
    try {
      await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, reply: reply.trim() }),
      });
    } catch {}
  };

  const handleDeleteMsg = async (id: string) => {
    if (confirm('Are you sure you want to delete this message from the database?')) {
      const updated = deleteMessage(id);
      setMessages(updated);
      try {
        await fetch(`/api/messages?id=${id}`, {
          method: 'DELETE',
        });
      } catch {}
    }
  };

  // Project Handlers (Sync with Supabase DB)
  const handleSaveProjectModal = async (project: Project) => {
    const updated = saveProject(project);
    setProjects(updated);
    setIsAddingProject(false);
    setEditingProject(null);

    // Persist to Supabase Database
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ project }),
      });
    } catch {}
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project from your showcase database?')) {
      const updated = deleteProject(id);
      setProjects(updated);
      try {
        await fetch(`/api/projects?id=${id}`, {
          method: 'DELETE',
          headers: {
            'x-admin-token': APP_CONFIG.adminPasscode,
          },
        });
      } catch {}
    }
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setIsAddingProject(true);
  };

  // Python Turtle Handlers (Sync with Supabase DB & Storage)
  const handleSaveTurtleModal = async (creation: TurtleCreation) => {
    const updated = saveTurtleCreation(creation);
    setTurtleCreations(updated);
    setIsAddingTurtle(false);
    setEditingTurtle(null);

    try {
      await fetch('/api/turtle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ creation }),
      });
    } catch {}
  };

  const handleDeleteTurtle = async (id: string) => {
    if (confirm('Delete this Python Turtle artwork from your collection?')) {
      const updated = deleteTurtleCreation(id);
      setTurtleCreations(updated);
      try {
        await fetch(`/api/turtle?id=${id}`, {
          method: 'DELETE',
          headers: {
            'x-admin-token': APP_CONFIG.adminPasscode,
          },
        });
      } catch {}
    }
  };

  // Love Note Handlers
  const handleSaveNoteModal = (note: LoveNote) => {
    const updated = saveLoveNote(note);
    setLoveNotes(updated);
    setIsAddingNote(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Delete this love note from your vault?')) {
      const updated = deleteLoveNote(id);
      setLoveNotes(updated);
    }
  };

  const handleEditNote = (note: LoveNote) => {
    setEditingNote(note);
    setIsAddingNote(true);
  };

  const handleExportBackup = () => {
    const data = {
      projects: getProjects(),
      turtleCreations: getTurtleCreations(),
      loveNotes: getLoveNotes(),
      messages: getMessages(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mili-universe-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-white/10 text-center space-y-6">
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-700 via-roseGlow-600 to-pink-500 p-0.5 shadow-glow-lg mx-auto border border-white/20 overflow-hidden">
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

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white">Suksharmi Admin Studio</h1>
            <p className="text-xs text-slate-400 font-mono">
              Manage creations, messages, and privacy settings
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter admin passcode"
              className={`w-full px-4 py-3 rounded-2xl glass-card text-center text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-roseGlow-500 ${
                loginError ? 'border-red-500 ring-2 ring-red-500 animate-shake' : 'border-white/10'
              }`}
              autoFocus
            />

            {loginError && (
              <p className="text-xs text-rose-400 font-mono">
                Incorrect passcode. (Passcode: das@123)
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white font-medium text-sm shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Enter Admin Dashboard</span>
            </button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Mili&apos;s Universe</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100 pb-20">
      {/* Header */}
      <header className="border-b border-white/10 bg-obsidian-900/60 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl glass-card hover:border-white/30 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-roseGlow-400" />
                <span>Admin Studio</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Logged in as Sukhen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportBackup}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white"
              title="Download backup JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-xs text-slate-300 font-mono transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'projects'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('turtle')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'turtle'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Art ({turtleCreations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('love-notes')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'love-notes'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Love Notes ({loveNotes.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('sessions'); loadSessions(); }}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'sessions'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Sessions ({deviceSessions.length})</span>
          </button>
        </div>

        {/* Tab 2: Projects Management */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Project Catalog</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Add existing deployed Vercel projects or custom creations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setIsAddingProject(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>+ Add Project (Magic URL)</span>
                </button>
              </div>
            </div>

            {/* List of Existing Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-roseGlow-400">
                        {proj.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProject(proj)}
                          className="p-1.5 text-slate-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white line-clamp-1">
                      {proj.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {proj.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-roseGlow-400 hover:underline truncate max-w-[200px]"
                    >
                      {proj.url}
                    </a>
                    <Link
                      href={`/projects/${proj.slug}`}
                      className="text-slate-400 hover:text-white"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Python Turtle Art Management */}
        {activeTab === 'turtle' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Python Turtle Artworks</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Manage mathematical sketches, algorithms, and turtle animations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingTurtle(null);
                    setIsAddingTurtle(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>+ Add Python Art (Magic Generator)</span>
                </button>
              </div>
            </div>

            {/* List of Python Artworks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turtleCreations.map((art) => (
                <div
                  key={art.id}
                  className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/5 text-amber-400">
                        {art.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTurtle(art);
                            setIsAddingTurtle(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTurtle(art.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white line-clamp-1">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Canvas: {art.canvasDrawingType || 'mandala'}</span>
                    <span>{formatDate(art.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Device Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Active Device Sessions</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {deviceSessions.length} of {AUTH_CONFIG.maxDevices} maximum concurrent devices active
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadSessions}
                  disabled={sessionsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50"
                  title="Refresh sessions"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {deviceSessions.length > 0 && (
                  <button
                    onClick={() => handleRevokeSession('', true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-mono transition-all"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Revoke All Devices</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sessions Grid */}
            {sessionsLoading ? (
              <div className="glass-card p-12 rounded-3xl text-center space-y-3">
                <div className="w-6 h-6 border-2 border-roseGlow-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Loading active sessions…</p>
              </div>
            ) : deviceSessions.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-slate-400 space-y-2">
                <Smartphone className="w-8 h-8 mx-auto text-slate-500" />
                <p className="text-sm font-medium">No active device sessions found.</p>
                <p className="text-xs text-slate-500 font-mono">Sessions are created when Mili or Sukhen signs in.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deviceSessions.map((sess) => {
                  const isExpired = new Date(sess.expiresAt).getTime() < Date.now();
                  const isSukhen = sess.userRole === 'sukhen';
                  return (
                    <div
                      key={sess.id}
                      className={`glass-card rounded-2xl p-5 border space-y-4 ${
                        isExpired ? 'border-red-500/30 opacity-60' : 'border-white/10'
                      }`}
                    >
                      {/* User Profile & Role Info */}
                      <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSukhen ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' : 'bg-roseGlow-600/30 text-roseGlow-300 border border-roseGlow-500/30'
                          }`}>
                            {sess.avatar || (isSukhen ? 'S' : 'M')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-white">
                                {sess.userName}
                              </span>
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                                isSukhen ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-roseGlow-500/20 text-roseGlow-300 border border-roseGlow-500/30'
                              }`}>
                                {isSukhen ? 'Admin' : 'Mili'}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-roseGlow-300/90 truncate max-w-[190px]">
                              {sess.userEmail || (isSukhen ? 'dassukhen@gmail.com' : 'mandalsharmili06@gmail.com')}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium ${
                            isExpired
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20'
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>

                      {/* Device & IP Details */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0">
                          {sess.deviceName.toLowerCase().includes('phone') ||
                          sess.deviceName.toLowerCase().includes('iphone') ||
                          sess.deviceName.toLowerCase().includes('android') ? (
                            <Smartphone className="w-4 h-4 text-roseGlow-400" />
                          ) : (
                            <Monitor className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200 leading-tight">
                            {sess.deviceName}
                          </h4>
                          <p className="text-[11px] font-mono text-slate-400">
                            IP: {sess.ip || '127.0.0.1'}
                          </p>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="space-y-1 text-[11px] font-mono text-slate-400 bg-white/5 rounded-xl p-3 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>First Login:</span>
                          </span>
                          <span className="text-slate-300">
                            {new Date(sess.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-slate-500" />
                            <span>Last Active:</span>
                          </span>
                          <span className="text-slate-300">
                            {new Date(sess.lastSeenAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="w-full py-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-xs font-mono text-red-400/80 transition-all flex items-center justify-center gap-1.5"
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        Revoke Session
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* Tab 3: Love Notes Management */}
        {activeTab === 'love-notes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-roseGlow-500 fill-roseGlow-500" />
                  <span>Private Love Notes Vault ({loveNotes.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Write unlimited private love letters and heartfelt thoughts for Mili
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsAddingNote(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all"
                >
                  <Feather className="w-3.5 h-3.5" />
                  <span>+ Write New Love Note</span>
                </button>
              </div>
            </div>

            {/* List of Existing Love Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loveNotes.map((note, index) => (
                <div
                  key={note.id}
                  className="glass-card rounded-2xl p-5 border border-roseGlow-500/20 flex flex-col justify-between space-y-4 hover:border-roseGlow-500/50 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-roseGlow-500/10 text-roseGlow-300 border border-roseGlow-500/30">
                        #{index + 1} • {note.moodTag || 'deep'}
                      </span>
                      {note.isFavorite && (
                        <Heart className="w-3.5 h-3.5 text-roseGlow-500 fill-roseGlow-500" />
                      )}
                    </div>

                    <h3 className="text-base font-serif font-bold text-white leading-snug">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-serif italic line-clamp-2 border-l-2 border-roseGlow-500 pl-2">
                      “{note.snippet}”
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      📅 {note.date}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-2 rounded-xl glass-card hover:border-white/30 text-slate-300 hover:text-white transition-colors"
                      title="Edit note"
                      aria-label="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Editor Modal */}
      <ProjectEditorModal
        isOpen={isAddingProject}
        editingProject={editingProject}
        onClose={() => {
          setIsAddingProject(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProjectModal}
      />

      {/* Turtle Editor Modal */}
      <TurtleEditorModal
        isOpen={isAddingTurtle}
        editingCreation={editingTurtle}
        onClose={() => {
          setIsAddingTurtle(false);
          setEditingTurtle(null);
        }}
        onSave={handleSaveTurtleModal}
      />

      {/* Love Note Editor Modal */}
      <LoveNoteEditorModal
        isOpen={isAddingNote}
        editingNote={editingNote}
        onClose={() => {
          setIsAddingNote(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNoteModal}
      />
    </main>
  );
}
