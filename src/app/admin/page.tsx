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
} from 'lucide-react';
import { Project, DirectMessage, ProjectCategory } from '@/types';
import { APP_CONFIG } from '@/data/config';
import {
  getProjects,
  saveProject,
  deleteProject,
  resetProjectsToDefault,
  getMessages,
  markMessageAsRead,
  replyToMessage,
  deleteMessage,
  isAdminLoggedIn,
  setAdminLoggedIn,
} from '@/lib/storage';
import { formatDate } from '@/lib/utils';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'messages' | 'projects' | 'sessions'>('messages');

  // Messages State
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Sessions State
  const [deviceSessions, setDeviceSessions] = useState<{
    id: string; deviceName: string; ip: string;
    createdAt: string; lastSeenAt: string; expiresAt: string;
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

  useEffect(() => {
    const logged = isAdminLoggedIn();
    setIsAuthenticated(logged);
    if (logged) {
      loadData();
    }
  }, []);

  const loadData = async () => {
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
  };

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
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.url) return;

    const slug =
      newProject.slug ||
      newProject.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const projectToSave: Project = {
      id: editingProject ? editingProject.id : `proj-${Date.now()}`,
      title: newProject.title || '',
      slug,
      description: newProject.description || '',
      detailedStory: newProject.detailedStory || '',
      category: (newProject.category as ProjectCategory) || 'Websites',
      url: newProject.url || '',
      githubUrl: newProject.githubUrl || '',
      thumbnail:
        newProject.thumbnail ||
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
      technologies:
        typeof newProject.technologies === 'string'
          ? (newProject.technologies as string).split(',').map((t) => t.trim())
          : newProject.technologies || ['HTML', 'CSS', 'JavaScript'],
      createdAt: newProject.createdAt || new Date().toISOString().split('T')[0],
      featured: Boolean(newProject.featured),
      order: Number(newProject.order) || 1,
    };

    const updated = saveProject(projectToSave);
    setProjects(updated);
    setIsAddingProject(false);
    setEditingProject(null);

    // Persist to Supabase Database
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projectToSave }),
      });
    } catch {}

    setNewProject({
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
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Delete this project from your showcase database?')) {
      const updated = deleteProject(id);
      setProjects(updated);
      try {
        await fetch(`/api/projects?id=${id}`, {
          method: 'DELETE',
        });
      } catch {}
    }
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setNewProject({
      ...proj,
    });
    setIsAddingProject(true);
  };

  const handleExportBackup = () => {
    const data = {
      projects: getProjects(),
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
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Messages from Mili ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('sessions'); loadSessions(); }}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-roseGlow-600 text-white shadow-glow'
                : 'glass-card text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Sessions ({deviceSessions.length})</span>
          </button>
        </div>

        {/* Tab 1: Messages Inbox */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Direct Messages Inbox</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Messages submitted by Mili through the website
                </p>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-slate-400 space-y-2">
                <MessageSquareHeart className="w-8 h-8 mx-auto text-roseGlow-400" />
                <p>No messages received yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`glass-card rounded-2xl p-6 border space-y-4 ${
                      msg.read ? 'border-white/10' : 'border-roseGlow-500/40 bg-roseGlow-950/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{msg.mood}</span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{msg.sender}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!msg.read && (
                          <button
                            onClick={() => handleMarkRead(msg.id)}
                            className="text-xs font-mono text-roseGlow-400 hover:text-white px-2 py-1 rounded-lg bg-roseGlow-500/10"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMsg(msg.id)}
                          className="p-1 text-slate-400 hover:text-red-400"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-200 font-light leading-relaxed bg-black/20 p-3.5 rounded-xl">
                      “{msg.message}”
                    </p>

                    {msg.reply ? (
                      <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                        <span className="font-mono text-purple-300 font-bold block">
                          Your Reply:
                        </span>
                        <p className="text-slate-300 italic">{msg.reply}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Type your reply message…"
                          value={replyTextMap[msg.id] || ''}
                          onChange={(e) =>
                            setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl glass-card text-xs text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                        />
                        <button
                          onClick={() => handleSendReply(msg.id)}
                          className="px-3 py-1.5 rounded-xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white text-xs font-mono"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
                    setIsAddingProject(!isAddingProject);
                    setEditingProject(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white text-xs font-mono uppercase tracking-wider shadow-glow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingProject ? 'Cancel' : 'Add New Project'}</span>
                </button>
              </div>
            </div>

            {/* Add / Edit Project Form */}
            {isAddingProject && (
              <form
                onSubmit={handleSaveProject}
                className="glass-card rounded-3xl p-6 sm:p-8 border border-roseGlow-500/30 space-y-4"
              >
                <h3 className="text-lg font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Add New Vercel Project'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Mili Anniversary Galaxy"
                      value={newProject.title || ''}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Category *
                    </label>
                    <select
                      value={newProject.category || 'Websites'}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          category: e.target.value as ProjectCategory,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white bg-obsidian-900 focus:outline-none focus:border-roseGlow-500"
                    >
                      <option value="Websites">Websites</option>
                      <option value="Special Projects">Special Projects</option>
                      <option value="Creative Projects">Creative Projects</option>
                      <option value="Interactive Experiences">Interactive Experiences</option>
                      <option value="Python Turtle">Python Turtle</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Deployed Vercel URL *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://your-project.vercel.app"
                      value={newProject.url || ''}
                      onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      GitHub URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={newProject.githubUrl || ''}
                      onChange={(e) =>
                        setNewProject({ ...newProject, githubUrl: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Thumbnail Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newProject.thumbnail || ''}
                      onChange={(e) =>
                        setNewProject({ ...newProject, thumbnail: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-300 block mb-1">
                      Technologies (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="React, Next.js, TypeScript, Tailwind CSS"
                      value={
                        Array.isArray(newProject.technologies)
                          ? newProject.technologies.join(', ')
                          : newProject.technologies || ''
                      }
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          technologies: e.target.value.split(',').map((t) => t.trim()),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief summary for the showcase card…"
                    value={newProject.description || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    The Story Behind It (Detailed)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Inspiration and background story behind this project…"
                    value={newProject.detailedStory || ''}
                    onChange={(e) =>
                      setNewProject({ ...newProject, detailedStory: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-500 focus:outline-none focus:border-roseGlow-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProject(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 rounded-xl glass-card text-xs font-mono text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-roseGlow-600 hover:bg-roseGlow-500 text-white text-xs font-mono uppercase tracking-wider shadow-glow"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            )}

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

        {/* Tab 3: Device Sessions */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Active Device Sessions</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Mili is logged in on {deviceSessions.length} / 3 devices
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadSessions}
                  disabled={sessionsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-xs font-mono text-slate-300 hover:text-white disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                {deviceSessions.length > 0 && (
                  <button
                    onClick={() => handleRevokeSession('', true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono text-red-400 hover:text-red-300 transition-all"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Revoke All Sessions</span>
                  </button>
                )}
              </div>
            </div>

            {sessionsLoading ? (
              <div className="glass-card p-12 rounded-3xl text-center text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 mx-auto text-roseGlow-400 animate-spin" />
                <p>Loading sessions…</p>
              </div>
            ) : deviceSessions.length === 0 ? (
              <div className="glass-card p-12 rounded-3xl text-center text-slate-400 space-y-3">
                <Smartphone className="w-8 h-8 mx-auto text-slate-600" />
                <p>No active sessions. Mili is not logged in anywhere.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deviceSessions.map((sess, i) => {
                  const isExpiringSoon =
                    new Date(sess.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
                  const relativeLastSeen = (() => {
                    const diff = Date.now() - new Date(sess.lastSeenAt).getTime();
                    const m = Math.floor(diff / 60000);
                    const h = Math.floor(m / 60);
                    const d = Math.floor(h / 24);
                    return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : m > 0 ? `${m}m ago` : 'Just now';
                  })();
                  const relativeLogin = (() => {
                    const diff = Date.now() - new Date(sess.createdAt).getTime();
                    const m = Math.floor(diff / 60000);
                    const h = Math.floor(m / 60);
                    const d = Math.floor(h / 24);
                    return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : m > 0 ? `${m}m ago` : 'Just now';
                  })();

                  return (
                    <div
                      key={sess.id}
                      className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 relative"
                    >
                      {/* Session Number Badge */}
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-roseGlow-600/20 border border-roseGlow-500/30 flex items-center justify-center text-[10px] font-bold text-roseGlow-400">
                        {i + 1}
                      </div>

                      {/* Device Icon + Name */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-roseGlow-500/10 border border-roseGlow-500/20 flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-5 h-5 text-roseGlow-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-white">{sess.deviceName}</p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {sess.ip !== '127.0.0.1' ? `IP: ${sess.ip}` : 'Local / Same Network'}
                          </p>
                        </div>
                      </div>

                      {/* Session Times */}
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Last seen
                          </span>
                          <span className="text-green-400">{relativeLastSeen}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            Logged in
                          </span>
                          <span>{relativeLogin}</span>
                        </div>
                        <div className={`flex items-center justify-between ${isExpiringSoon ? 'text-amber-400' : 'text-slate-500'}`}>
                          <span>Expires</span>
                          <span>
                            {new Date(sess.expiresAt).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Revoke Button */}
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="w-full py-2 rounded-xl bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/40 text-xs font-mono text-red-400/80 hover:text-red-300 transition-all flex items-center justify-center gap-1.5"
                      >
                        <WifiOff className="w-3.5 h-3.5" />
                        Revoke This Session
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info Banner */}
            <div className="glass-card rounded-2xl p-4 border border-white/5 flex items-start gap-3 text-xs font-mono text-slate-400">
              <Smartphone className="w-4 h-4 text-roseGlow-400 flex-shrink-0 mt-0.5" />
              <p>
                Mili can log in on up to <span className="text-roseGlow-400 font-bold">3 devices</span> simultaneously.
                Sessions expire automatically after 30 days of inactivity.
                Revoking a session logs that device out immediately.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
