'use client';

import { Project, LoveNote, MemoryMilestone, DirectMessage, TurtleCreation } from '@/types';
import { INITIAL_PROJECTS } from '@/data/projects';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';
import { INITIAL_MEMORIES } from '@/data/memories';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';
import { APP_CONFIG } from '@/data/config';

const KEYS = {
  PROJECTS: 'mili_universe_projects',
  LOVE_NOTES: 'mili_universe_love_notes',
  FAVORITE_PROJECTS: 'mili_fav_projects',
  FAVORITE_NOTES: 'mili_fav_notes',
  FAVORITE_MEMORIES: 'mili_fav_memories',
  DIRECT_MESSAGES: 'mili_direct_messages',
  INTRO_SEEN: 'mili_intro_seen_v1',
  ADMIN_LOGGED_IN: 'mili_admin_authenticated',
  CONTACT_UNLOCKED: 'mili_contact_unlocked',
  CUSTOM_TURTLE: 'mili_custom_turtle',
};

// Safe LocalStorage access
function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving localStorage key "${key}":`, error);
  }
}

// ----------------- Projects Storage -----------------
export function getProjects(): Project[] {
  const saved = getStorageItem<Project[] | null>(KEYS.PROJECTS, null);
  if (!saved || saved.length === 0) {
    return INITIAL_PROJECTS;
  }
  return saved;
}

export function saveProject(project: Project): Project[] {
  const current = getProjects();
  const index = current.findIndex(p => p.id === project.id);
  let updated: Project[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = project;
  } else {
    updated = [project, ...current];
  }
  setStorageItem(KEYS.PROJECTS, updated);
  return updated;
}

export function deleteProject(id: string): Project[] {
  const current = getProjects();
  const updated = current.filter(p => p.id !== id);
  setStorageItem(KEYS.PROJECTS, updated);
  return updated;
}

export function resetProjectsToDefault(): Project[] {
  setStorageItem(KEYS.PROJECTS, INITIAL_PROJECTS);
  return INITIAL_PROJECTS;
}

// ----------------- Turtle Creations Storage -----------------
export function getTurtleCreations(): TurtleCreation[] {
  const saved = getStorageItem<TurtleCreation[] | null>(KEYS.CUSTOM_TURTLE, null);
  if (!saved || saved.length === 0) {
    return INITIAL_TURTLE_CREATIONS;
  }
  return saved;
}

export function saveTurtleCreation(creation: TurtleCreation): TurtleCreation[] {
  const current = getTurtleCreations();
  const index = current.findIndex(c => c.id === creation.id);
  let updated: TurtleCreation[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = creation;
  } else {
    updated = [creation, ...current];
  }
  setStorageItem(KEYS.CUSTOM_TURTLE, updated);
  return updated;
}

export function deleteTurtleCreation(id: string): TurtleCreation[] {
  const current = getTurtleCreations();
  const updated = current.filter(c => c.id !== id);
  setStorageItem(KEYS.CUSTOM_TURTLE, updated);
  return updated;
}

// ----------------- Love Notes Storage (Unlimited) -----------------
export function getLoveNotes(): LoveNote[] {
  const saved = getStorageItem<LoveNote[] | null>(KEYS.LOVE_NOTES, null);
  if (!saved || saved.length === 0) {
    return INITIAL_LOVE_NOTES;
  }
  return saved;
}

export function saveLoveNote(note: LoveNote): LoveNote[] {
  const current = getLoveNotes();
  const index = current.findIndex(n => n.id === note.id);
  let updated: LoveNote[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = note;
  } else {
    updated = [note, ...current];
  }
  setStorageItem(KEYS.LOVE_NOTES, updated);
  return updated;
}

export function deleteLoveNote(id: string): LoveNote[] {
  const current = getLoveNotes();
  const updated = current.filter(n => n.id !== id);
  setStorageItem(KEYS.LOVE_NOTES, updated);
  return updated;
}

export function resetLoveNotesToDefault(): LoveNote[] {
  setStorageItem(KEYS.LOVE_NOTES, INITIAL_LOVE_NOTES);
  return INITIAL_LOVE_NOTES;
}

// ----------------- Favorites -----------------
export function getFavoriteProjectIds(): string[] {
  return getStorageItem<string[]>(KEYS.FAVORITE_PROJECTS, []);
}

export function toggleFavoriteProject(id: string): string[] {
  const current = getFavoriteProjectIds();
  const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  setStorageItem(KEYS.FAVORITE_PROJECTS, updated);
  return updated;
}

export function getFavoriteNoteIds(): string[] {
  return getStorageItem<string[]>(KEYS.FAVORITE_NOTES, ['note-1', 'note-2', 'note-4']);
}

export function toggleFavoriteNote(id: string): string[] {
  const current = getFavoriteNoteIds();
  const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  setStorageItem(KEYS.FAVORITE_NOTES, updated);
  return updated;
}

// ----------------- Memories / Photo & Video Storage -----------------
export function getMemories(): MemoryMilestone[] {
  const saved = getStorageItem<MemoryMilestone[] | null>(KEYS.FAVORITE_MEMORIES + '_all', null);
  if (saved === null) {
    return INITIAL_MEMORIES;
  }
  return saved;
}

export function saveMemory(memory: MemoryMilestone): MemoryMilestone[] {
  const current = getMemories();
  const index = current.findIndex(m => m.id === memory.id);
  let updated: MemoryMilestone[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = memory;
  } else {
    updated = [memory, ...current];
  }
  setStorageItem(KEYS.FAVORITE_MEMORIES + '_all', updated);
  return updated;
}

export function deleteMemory(id: string): MemoryMilestone[] {
  const current = getMemories();
  const updated = current.filter(m => m.id !== id);
  setStorageItem(KEYS.FAVORITE_MEMORIES + '_all', updated);
  return updated;
}

export function resetMemoriesToDefault(): MemoryMilestone[] {
  setStorageItem(KEYS.FAVORITE_MEMORIES + '_all', INITIAL_MEMORIES);
  return INITIAL_MEMORIES;
}

export function getFavoriteMemoryIds(): string[] {
  return getStorageItem<string[]>(KEYS.FAVORITE_MEMORIES, ['mem-sample-1']);
}

export function toggleFavoriteMemory(id: string): string[] {
  const current = getFavoriteMemoryIds();
  const updated = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  setStorageItem(KEYS.FAVORITE_MEMORIES, updated);
  return updated;
}

// ----------------- Messages -----------------
const SAMPLE_MESSAGES: DirectMessage[] = [
  {
    id: "msg-1",
    sender: "Mili",
    message: "Thank you for the sweet surprise today! You made my whole week ❤️",
    mood: "❤️",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    reply: "Always for you my love! You deserve the universe.",
  },
  {
    id: "msg-2",
    sender: "Mili",
    message: "I loved the vinyl music player so much!! Listening to our songs right now 🎶🥹",
    mood: "🥹",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    read: false,
  },
];

export function getMessages(): DirectMessage[] {
  return getStorageItem<DirectMessage[]>(KEYS.DIRECT_MESSAGES, SAMPLE_MESSAGES);
}

export function addMessage(message: Omit<DirectMessage, 'id' | 'createdAt' | 'read'>): DirectMessage {
  const newMessage: DirectMessage = {
    ...message,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const current = getMessages();
  const updated = [newMessage, ...current];
  setStorageItem(KEYS.DIRECT_MESSAGES, updated);
  return newMessage;
}

export function markMessageAsRead(id: string): DirectMessage[] {
  const current = getMessages();
  const updated = current.map(m => (m.id === id ? { ...m, read: true } : m));
  setStorageItem(KEYS.DIRECT_MESSAGES, updated);
  return updated;
}

export function replyToMessage(id: string, replyText: string): DirectMessage[] {
  const current = getMessages();
  const updated = current.map(m => (m.id === id ? { ...m, reply: replyText, read: true } : m));
  setStorageItem(KEYS.DIRECT_MESSAGES, updated);
  return updated;
}

export function deleteMessage(id: string): DirectMessage[] {
  const current = getMessages();
  const updated = current.filter(m => m.id !== id);
  setStorageItem(KEYS.DIRECT_MESSAGES, updated);
  return updated;
}

// ----------------- Intro State -----------------
export function isIntroSeen(): boolean {
  return getStorageItem<boolean>(KEYS.INTRO_SEEN, false);
}

export function setIntroSeen(seen: boolean): void {
  setStorageItem(KEYS.INTRO_SEEN, seen);
}

// ----------------- Admin Auth -----------------
export function isAdminLoggedIn(): boolean {
  return getStorageItem<boolean>(KEYS.ADMIN_LOGGED_IN, false);
}

export function setAdminLoggedIn(status: boolean): void {
  setStorageItem(KEYS.ADMIN_LOGGED_IN, status);
}

// ----------------- Contact Unlock -----------------
export function isContactUnlocked(): boolean {
  if (APP_CONFIG.contactVisibility === 'PUBLIC') return true;
  return getStorageItem<boolean>(KEYS.CONTACT_UNLOCKED, false);
}

export function setContactUnlocked(status: boolean): void {
  setStorageItem(KEYS.CONTACT_UNLOCKED, status);
}
