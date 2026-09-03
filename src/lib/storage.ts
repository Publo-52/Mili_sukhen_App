'use client';

import { Project, LoveNote, MemoryMilestone, DirectMessage, TurtleCreation } from '@/types';
import { INITIAL_PROJECTS } from '@/data/projects';
import { INITIAL_LOVE_NOTES } from '@/data/loveNotes';
import { INITIAL_MEMORIES } from '@/data/memories';
import { INITIAL_TURTLE_CREATIONS } from '@/data/turtleCreations';

const KEYS = {
  PROJECTS: 'mili_universe_projects',
  LOVE_NOTES: 'mili_universe_love_notes',
  MEMORIES: 'mili_universe_memories',
  FAVORITE_PROJECTS: 'mili_fav_projects',
  FAVORITE_NOTES: 'mili_fav_notes',
  FAVORITE_MEMORIES: 'mili_fav_memories',
  DIRECT_MESSAGES: 'mili_direct_messages',
  INTRO_SEEN: 'mili_intro_seen_v1',
  ADMIN_LOGGED_IN: 'mili_admin_authenticated',
  CONTACT_UNLOCKED: 'mili_contact_unlocked',
  CUSTOM_TURTLE: 'mili_custom_turtle',
  DELETED_PROJECTS: 'mili_deleted_project_ids',
  DELETED_TURTLE: 'mili_deleted_turtle_ids',
  DELETED_NOTES: 'mili_deleted_note_ids',
  DELETED_MEMORIES: 'mili_deleted_memory_ids',
};

// Legacy key for backward-compatibility migration
const LEGACY_MEMORIES_ALL_KEY = 'mili_fav_memories_all';

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

// ----------------- Deleted IDs Tracking (Prevents resurrecting deleted defaults) -----------------
export function getDeletedProjectIds(): string[] {
  return getStorageItem<string[]>(KEYS.DELETED_PROJECTS, []);
}
export function markProjectDeleted(id: string): void {
  const deleted = getDeletedProjectIds();
  if (!deleted.includes(id)) {
    setStorageItem(KEYS.DELETED_PROJECTS, [...deleted, id]);
  }
}

export function getDeletedTurtleIds(): string[] {
  return getStorageItem<string[]>(KEYS.DELETED_TURTLE, []);
}
export function markTurtleDeleted(id: string): void {
  const deleted = getDeletedTurtleIds();
  if (!deleted.includes(id)) {
    setStorageItem(KEYS.DELETED_TURTLE, [...deleted, id]);
  }
}

export function getDeletedNoteIds(): string[] {
  return getStorageItem<string[]>(KEYS.DELETED_NOTES, []);
}
export function markNoteDeleted(id: string): void {
  const deleted = getDeletedNoteIds();
  if (!deleted.includes(id)) {
    setStorageItem(KEYS.DELETED_NOTES, [...deleted, id]);
  }
}

export function getDeletedMemoryIds(): string[] {
  return getStorageItem<string[]>(KEYS.DELETED_MEMORIES, []);
}
export function markMemoryDeleted(id: string): void {
  const deleted = getDeletedMemoryIds();
  if (!deleted.includes(id)) {
    setStorageItem(KEYS.DELETED_MEMORIES, [...deleted, id]);
  }
}

// ----------------- Projects Storage -----------------
export function getProjects(): Project[] {
  const saved = getStorageItem<Project[] | null>(KEYS.PROJECTS, null);
  return saved === null || saved.length === 0 ? INITIAL_PROJECTS : saved;
}

export function saveProject(project: Project): Project[] {
  const deletedIds = getDeletedProjectIds().filter((id) => id !== project.id);
  setStorageItem(KEYS.DELETED_PROJECTS, deletedIds);

  const current = getProjects();
  const index = current.findIndex((p) => p.id === project.id);
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
  markProjectDeleted(id);
  const current = getProjects();
  const updated = current.filter((p) => p.id !== id);
  setStorageItem(KEYS.PROJECTS, updated);
  return updated;
}

export function resetProjectsToDefault(): Project[] {
  setStorageItem(KEYS.DELETED_PROJECTS, []);
  setStorageItem(KEYS.PROJECTS, INITIAL_PROJECTS);
  return INITIAL_PROJECTS;
}

export function restoreAllDefaults(): void {
  setStorageItem(KEYS.DELETED_PROJECTS, []);
  setStorageItem(KEYS.DELETED_TURTLE, []);
  setStorageItem(KEYS.DELETED_NOTES, []);
  setStorageItem(KEYS.DELETED_MEMORIES, []);
  setStorageItem(KEYS.PROJECTS, INITIAL_PROJECTS);
  setStorageItem(KEYS.CUSTOM_TURTLE, INITIAL_TURTLE_CREATIONS);
  setStorageItem(KEYS.LOVE_NOTES, INITIAL_LOVE_NOTES);
  setStorageItem(KEYS.MEMORIES, INITIAL_MEMORIES);
  setStorageItem(LEGACY_MEMORIES_ALL_KEY, INITIAL_MEMORIES);
}

// ----------------- Turtle Creations Storage -----------------
export function getTurtleCreations(): TurtleCreation[] {
  const saved = getStorageItem<TurtleCreation[] | null>(KEYS.CUSTOM_TURTLE, null);
  return saved === null || saved.length === 0 ? INITIAL_TURTLE_CREATIONS : saved;
}

export function saveTurtleCreation(creation: TurtleCreation): TurtleCreation[] {
  const deletedIds = getDeletedTurtleIds().filter((id) => id !== creation.id);
  setStorageItem(KEYS.DELETED_TURTLE, deletedIds);

  const current = getTurtleCreations();
  const index = current.findIndex((t) => t.id === creation.id);
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
  markTurtleDeleted(id);
  const current = getTurtleCreations();
  const updated = current.filter((t) => t.id !== id);
  setStorageItem(KEYS.CUSTOM_TURTLE, updated);
  return updated;
}

export function resetTurtleToDefault(): TurtleCreation[] {
  setStorageItem(KEYS.DELETED_TURTLE, []);
  setStorageItem(KEYS.CUSTOM_TURTLE, INITIAL_TURTLE_CREATIONS);
  return INITIAL_TURTLE_CREATIONS;
}

// ----------------- Love Notes Storage -----------------
export function getLoveNotes(): LoveNote[] {
  const saved = getStorageItem<LoveNote[] | null>(KEYS.LOVE_NOTES, null);
  return saved === null || saved.length === 0 ? INITIAL_LOVE_NOTES : saved;
}

export function saveLoveNote(note: LoveNote): LoveNote[] {
  const deletedIds = getDeletedNoteIds().filter((id) => id !== note.id);
  setStorageItem(KEYS.DELETED_NOTES, deletedIds);

  const current = getLoveNotes();
  const index = current.findIndex((n) => n.id === note.id);
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
  markNoteDeleted(id);
  const current = getLoveNotes();
  const updated = current.filter((n) => n.id !== id);
  setStorageItem(KEYS.LOVE_NOTES, updated);
  return updated;
}

export function resetLoveNotesToDefault(): LoveNote[] {
  setStorageItem(KEYS.DELETED_NOTES, []);
  setStorageItem(KEYS.LOVE_NOTES, INITIAL_LOVE_NOTES);
  return INITIAL_LOVE_NOTES;
}

// ----------------- Favorites -----------------
export function getFavoriteProjectIds(): string[] {
  return getStorageItem<string[]>(KEYS.FAVORITE_PROJECTS, ['mili-special', 'mili-envelope', 'mili-universe']);
}

export function toggleFavoriteProject(id: string): string[] {
  const current = getFavoriteProjectIds();
  const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  setStorageItem(KEYS.FAVORITE_PROJECTS, updated);
  return updated;
}

export function getFavoriteNoteIds(): string[] {
  return getStorageItem<string[]>(KEYS.FAVORITE_NOTES, ['note-1', 'note-2', 'note-4']);
}

export function toggleFavoriteNote(id: string): string[] {
  const current = getFavoriteNoteIds();
  const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  setStorageItem(KEYS.FAVORITE_NOTES, updated);
  return updated;
}

// ----------------- Memories / Photo & Video Storage -----------------
export function getMemories(): MemoryMilestone[] {
  // 1. Check semantically correct new key
  const savedNew = getStorageItem<MemoryMilestone[] | null>(KEYS.MEMORIES, null);
  if (savedNew !== null && Array.isArray(savedNew) && savedNew.length > 0) {
    return savedNew;
  }

  // 2. If missing or empty in new key, check legacy key (backward-compatibility)
  const savedLegacy = getStorageItem<MemoryMilestone[] | null>(LEGACY_MEMORIES_ALL_KEY, null);
  if (savedLegacy !== null && Array.isArray(savedLegacy) && savedLegacy.length > 0) {
    // 3. Migrate data to new key seamlessly without deleting old data
    setStorageItem(KEYS.MEMORIES, savedLegacy);
    return savedLegacy;
  }

  return INITIAL_MEMORIES;
}

export function saveMemory(memory: MemoryMilestone): MemoryMilestone[] {
  const deletedIds = getDeletedMemoryIds().filter((id) => id !== memory.id);
  setStorageItem(KEYS.DELETED_MEMORIES, deletedIds);

  const current = getMemories();
  const index = current.findIndex((m) => m.id === memory.id);
  let updated: MemoryMilestone[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = memory;
  } else {
    updated = [memory, ...current];
  }
  setStorageItem(KEYS.MEMORIES, updated);
  setStorageItem(LEGACY_MEMORIES_ALL_KEY, updated);
  return updated;
}

export function deleteMemory(id: string): MemoryMilestone[] {
  markMemoryDeleted(id);
  const current = getMemories();
  const updated = current.filter((m) => m.id !== id);
  setStorageItem(KEYS.MEMORIES, updated);
  setStorageItem(LEGACY_MEMORIES_ALL_KEY, updated);
  return updated;
}

export function resetMemoriesToDefault(): MemoryMilestone[] {
  setStorageItem(KEYS.DELETED_MEMORIES, []);
  setStorageItem(KEYS.MEMORIES, INITIAL_MEMORIES);
  setStorageItem(LEGACY_MEMORIES_ALL_KEY, INITIAL_MEMORIES);
  return INITIAL_MEMORIES;
}

export function getFavoriteMemoryIds(): string[] {
  const saved = getStorageItem<string[] | null>(KEYS.FAVORITE_MEMORIES, null);
  if (saved !== null && Array.isArray(saved)) {
    return saved;
  }
  const initialFavs = INITIAL_MEMORIES.filter((m) => m.isFavorite).map((m) => m.id);
  const defaultList = initialFavs.length > 0 ? initialFavs : ['mem-sample-1'];
  setStorageItem(KEYS.FAVORITE_MEMORIES, defaultList);
  return defaultList;
}

export function toggleFavoriteMemory(id: string): string[] {
  const current = getFavoriteMemoryIds();
  const updated = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  setStorageItem(KEYS.FAVORITE_MEMORIES, updated);
  return updated;
}

// ----------------- Messages -----------------
const SAMPLE_MESSAGES: DirectMessage[] = [
  {
    id: 'msg-1',
    sender: 'Mili',
    message: 'Thank you for the sweet surprise today! You made my whole week ❤️',
    mood: '❤️',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    reply: 'Always for you my love! You deserve the universe.',
  },
  {
    id: 'msg-2',
    sender: 'Mili',
    message: 'I loved the vinyl music player so much!! Listening to our songs right now 🎶🥹',
    mood: '🥹',
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
  const updated = current.map((m) => (m.id === id ? { ...m, read: true } : m));
  setStorageItem(KEYS.DIRECT_MESSAGES, updated);
  return updated;
}

export function replyToMessage(id: string, replyText: string): DirectMessage[] {
  const current = getMessages();
  const updated = current.map((m) => (m.id === id ? { ...m, reply: replyText, read: true } : m));
  setStorageItem(KEYS.DIRECT_MESSAGES, updated);
  return updated;
}

export function deleteMessage(id: string): DirectMessage[] {
  const current = getMessages();
  const updated = current.filter((m) => m.id !== id);
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
  return getStorageItem<boolean>(KEYS.CONTACT_UNLOCKED, false);
}

export function setContactUnlocked(status: boolean): void {
  setStorageItem(KEYS.CONTACT_UNLOCKED, status);
}
