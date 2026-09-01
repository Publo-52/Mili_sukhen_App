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
  Wand2,
  Terminal,
  Heart,
  Feather,
  BookOpen,
  Film,
  Camera,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Project, DirectMessage, ProjectCategory, TurtleCreation, LoveNote, MemoryItem } from '@/types';
import { APP_CONFIG, AUTH_CONFIG } from '@/data/config';
import { ProjectEditorModal } from '@/components/projects/ProjectEditorModal';
import { TurtleEditorModal } from '@/components/turtle/TurtleEditorModal';
import { LoveNoteEditorModal } from '@/components/love-notes/LoveNoteEditorModal';
import { MemoryEditorModal } from '@/components/timeline/MemoryEditorModal';
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
  getMemories,
  saveMemory,
  deleteMemory,
  getMessages,
  markMessageAsRead,
  replyToMessage,
  deleteMessage,
  isAdminLoggedIn,
  setAdminLoggedIn,
} from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'projects' | 'turtle' | 'love-notes' | 'memories' | 'sessions'>('projects');

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

  // Memories / Photos & Videos State
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);

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

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { 'x-admin-token': APP_CONFIG.adminPasscode },
        cache: 'no-store',
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
      const msgRes = await fetch('/api/messages', { cache: 'no-store' });
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
      const projRes = await fetch('/api/projects', { cache: 'no-store' });
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
      const turtleRes = await fetch('/api/turtle', { cache: 'no-store' });
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

    // 4. Load Love Notes from API / Supabase
    try {
      const noteRes = await fetch('/api/love-notes', { cache: 'no-store' });
      if (noteRes.ok) {
        const noteData = await noteRes.json();
        if (noteData.notes && noteData.notes.length > 0) {
          setLoveNotes(noteData.notes);
        } else {
          setLoveNotes(getLoveNotes());
        }
      } else {
        setLoveNotes(getLoveNotes());
      }
    } catch {
      setLoveNotes(getLoveNotes());
    }

    // 5. Load Memories from API / Supabase
    try {
      const memRes = await fetch('/api/memories', { cache: 'no-store' });
      if (memRes.ok) {
        const memData = await memRes.json();
        if (memData.memories && memData.memories.length > 0) {
          setMemories(memData.memories);
        } else {
          setMemories(getMemories());
        }
      } else {
        setMemories(getMemories());
      }
    } catch {
      setMemories(getMemories());
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      setIsAuthenticated(true);
      loadData();
    }
  }, [loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === APP_CONFIG.adminPasscode || passcode === 'mili@123' || passcode === 'das@123') {
      setIsAuthenticated(true);
      setAdminLoggedIn(true);
      setLoginError(false);
      loadData();
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setIsAuthenticated(false);
  };

  const handleRevokeSession = async (sessionId: string, revokeAll: boolean = false) => {
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ sessionId, revokeAll }),
      });
      if (res.ok) {
        await loadSessions();
      }
    } catch {
      // ignore
    }
  };

  // --- Handlers for Project Editor Modal ---
  const handleSaveProjectModal = async (project: Project) => {
    const updated = saveProject(project);
    setProjects(updated);
    setIsAddingProject(false);
    setEditingProject(null);

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

    window.dispatchEvent(new Event('mili-projects-updated'));
    await loadData();
  };

  const handleDeleteProject = async (id: string) => {
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

    window.dispatchEvent(new Event('mili-projects-updated'));
    await loadData();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsAddingProject(true);
  };

  // --- Handlers for Turtle Editor Modal ---
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

    window.dispatchEvent(new Event('mili-turtle-updated'));
    await loadData();
  };

  const handleDeleteTurtle = async (id: string) => {
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

    window.dispatchEvent(new Event('mili-turtle-updated'));
    await loadData();
  };

  // --- Handlers for Love Notes ---
  const handleSaveNoteModal = async (note: LoveNote) => {
    const updated = saveLoveNote(note);
    setLoveNotes(updated);
    setIsAddingNote(false);
    setEditingNote(null);

    try {
      await fetch('/api/love-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ note }),
      });
    } catch {}

    window.dispatchEvent(new Event('mili-notes-updated'));
    await loadData();
  };

  const handleDeleteNote = async (id: string) => {
    const updated = deleteLoveNote(id);
    setLoveNotes(updated);

    try {
      await fetch(`/api/love-notes?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
      });
    } catch {}

    window.dispatchEvent(new Event('mili-notes-updated'));
    await loadData();
  };

  const handleEditNote = (note: LoveNote) => {
    setEditingNote(note);
    setIsAddingNote(true);
  };

  // --- Handlers for Memories ---
  const handleSaveMemoryModal = async (memory: MemoryItem) => {
    const updated = saveMemory(memory);
    setMemories(updated);
    setIsAddingMemory(false);
    setEditingMemory(null);

    try {
      await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
        body: JSON.stringify({ memory }),
      });
    } catch {}

    window.dispatchEvent(new Event('mili-memories-updated'));
    await loadData();
  };

  const handleDeleteMemory = async (id: string) => {
    const updated = deleteMemory(id);
    setMemories(updated);

    try {
      await fetch(`/api/memories?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': APP_CONFIG.adminPasscode,
        },
      });
    } catch {}

    window.dispatchEvent(new Event('mili-memories-updated'));
    await loadData();
  };

  const handleEditMemory = (memory: MemoryItem) => {
    setEditingMemory(memory);
    setIsAddingMemory(true);
  };

  const handleExportBackup = () => {
    const data = {
      projects: getProjects(),
      turtleCreations: getTurtleCreations(),
      loveNotes: getLoveNotes(),
      memories: getMemories(),
      messages: getMessages(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suksharmi-backup-${new Date().toISOString().split('T')[0]}.json`;
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
              Manage creations, memories, and security settings
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
                Incorrect passcode. (Passcode: das@123 / mili@123)
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white font-medium text-sm shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <span>Return to Suksharmi Sanctuary</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100 pb-20">
      {/* Sleek Modern Top Bar */}
      <header className="border-b border-white/10 bg-[#0d091a]/90 backdrop-blur-xl sticky top-0 z-30 px-3 sm:px-8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="p-2 rounded-xl glass-card hover:border-white/30 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Return to Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 truncate">
                <Shield className="w-4 h-4 text-roseGlow-400 shrink-0" />
                <span>Admin Studio</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                Logged in as <span className="text-roseGlow-300 font-semibold">{user?.name || 'Sukhen'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportBackup}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
              title="Download full backup JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-xs text-slate-300 font-mono transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <div className="max-w-7xl mx-auto px-3 sm:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Apple-style Segmented Category Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-roseGlow-600 text-white shadow-glow font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('turtle')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'turtle'
                ? 'bg-amber-600 text-white shadow-glow-gold font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Python Art ({turtleCreations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('love-notes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'love-notes'
                ? 'bg-pink-600 text-white shadow-glow font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Love Notes ({loveNotes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'memories'
                ? 'bg-purple-600 text-white shadow-glow-violet font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Memories ({memories.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('sessions'); loadSessions(); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'sessions'
                ? 'bg-blue-600 text-white shadow-glow font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Devices ({deviceSessions.length})</span>
          </button>
        </div>

        {/* Tab 1: Projects Management */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Section Header */}
            <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-roseGlow-400" />
                  <span>Project Catalog</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Manage deployed creations, Vercel web apps, and live games
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsAddingProject(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-roseGlow-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>+ Add Project</span>
              </button>
            </div>

            {/* List of Existing Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between space-y-3 hover:border-roseGlow-500/40 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    {/* Category & Action Pills */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-roseGlow-500/15 text-roseGlow-300 border border-roseGlow-500/30">
                        {proj.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditProject(proj)}
                          className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit project"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                      {proj.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-300 line-clamp-2 font-light leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* URL & Live Link */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono gap-2">
                    <span className="text-slate-400 truncate max-w-[200px] text-[11px]">
                      {proj.url}
                    </span>
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-roseGlow-400 hover:text-roseGlow-300 font-medium shrink-0"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Python Turtle Art Management */}
        {activeTab === 'turtle' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  <span>Python Turtle Artworks</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Manage mathematical sketches, algorithms, and turtle animations
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingTurtle(null);
                  setIsAddingTurtle(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>+ Add Python Art</span>
              </button>
            </div>

            {/* List of Python Artworks */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {turtleCreations.map((art) => (
                <div
                  key={art.id}
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between space-y-3 hover:border-amber-500/40 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {art.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingTurtle(art);
                            setIsAddingTurtle(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit art"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTurtle(art.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete art"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-300 line-clamp-2 font-light leading-relaxed">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Drawing: {art.canvasDrawingType || 'mandala'}</span>
                    <span>{formatDate(art.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Love Notes Management */}
        {activeTab === 'love-notes' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-roseGlow-500 fill-roseGlow-500" />
                  <span>Private Love Notes Vault ({loveNotes.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Write unlimited private love letters and heartfelt thoughts for Mili
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingNote(null);
                  setIsAddingNote(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-roseGlow-600 via-pink-600 to-purple-600 hover:from-roseGlow-500 hover:to-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>+ Write New Note</span>
              </button>
            </div>

            {/* List of Existing Love Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {loveNotes.map((note, index) => (
                <div
                  key={note.id}
                  className="glass-card rounded-2xl p-4 sm:p-5 border border-roseGlow-500/20 flex flex-col justify-between space-y-3 hover:border-roseGlow-500/50 transition-all shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-roseGlow-500/10 text-roseGlow-300 border border-roseGlow-500/30">
                        #{index + 1} • {note.moodTag || 'deep'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit note"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="px-2 py-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-serif font-bold text-white leading-snug">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-serif italic line-clamp-2 border-l-2 border-roseGlow-500 pl-2">
                      “{note.snippet}”
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                    📅 {note.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Photo & Video Memories Management */}
        {activeTab === 'memories' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span>Memories & Timeline Vault ({memories.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Upload, manage, and stream high-definition photos & videos
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingMemory(null);
                  setIsAddingMemory(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-roseGlow-600 hover:from-purple-500 hover:to-roseGlow-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-glow transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Upload Memory</span>
              </button>
            </div>

            {/* List of Existing Memories */}
            {memories.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl glass-card border border-white/10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto">
                  <Film className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">No photos or videos uploaded yet</h4>
                  <p className="text-xs text-slate-400">Click &apos;Upload Memory&apos; above to add your first media memory.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-sm"
                  >
                    <div className="relative aspect-[16/9] w-full bg-obsidian-950">
                      <Image
                        src={memory.thumbnailUrl || memory.url}
                        alt={memory.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1 border border-white/10">
                        {memory.type === 'video' ? <Video className="w-3 h-3 text-purple-400" /> : <ImageIcon className="w-3 h-3 text-roseGlow-400" />}
                        <span>{memory.type === 'video' ? 'Video' : 'Photo'}</span>
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{memory.title}</h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditMemory(memory)}
                            className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit media"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(memory.id)}
                            className="px-2 py-1 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            title="Delete media"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {memory.description && (
                        <p className="text-xs text-slate-300 line-clamp-2 font-light">{memory.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono">
                        📅 {memory.date} {memory.location ? `• 📍 ${memory.location}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Device Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <span>Active Device Sessions</span>
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {deviceSessions.length} of {AUTH_CONFIG.maxDevices} maximum concurrent devices active
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={loadSessions}
                  disabled={sessionsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                  title="Refresh sessions"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                {deviceSessions.length > 0 && (
                  <button
                    onClick={() => handleRevokeSession('', true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-mono transition-all cursor-pointer"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Revoke All</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {deviceSessions.map((sess) => {
                  const isExpired = new Date(sess.expiresAt).getTime() < Date.now();
                  const isSukhen = sess.userRole === 'sukhen';
                  return (
                    <div
                      key={sess.id}
                      className={`glass-card rounded-2xl p-4 sm:p-5 border space-y-3 ${
                        isExpired ? 'border-red-500/30 opacity-60' : 'border-white/10'
                      }`}
                    >
                      {/* User Profile & Role Info */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
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
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 flex-shrink-0">
                          {sess.deviceName.toLowerCase().includes('phone') ||
                          sess.deviceName.toLowerCase().includes('iphone') ||
                          sess.deviceName.toLowerCase().includes('android') ? (
                            <Smartphone className="w-4 h-4 text-roseGlow-400" />
                          ) : (
                            <Monitor className="w-4 h-4 text-purple-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-200 leading-tight truncate">
                            {sess.deviceName}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-400">
                            IP: {sess.ip || '127.0.0.1'}
                          </p>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="space-y-1 text-[10px] font-mono text-slate-400 bg-white/5 rounded-xl p-2.5 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span>First Login:</span>
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
                          <span>Last Active:</span>
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
                        className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-mono text-red-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        <span>Revoke Session</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* Memory / Photo & Video Editor Modal */}
      <MemoryEditorModal
        isOpen={isAddingMemory}
        editingMemory={editingMemory}
        onClose={() => {
          setIsAddingMemory(false);
          setEditingMemory(null);
        }}
        onSave={handleSaveMemoryModal}
      />
    </main>
  );
}
