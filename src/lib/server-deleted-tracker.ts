// Global In-Memory and Server-Side Deleted Item Registry
// Prevents deleted projects, python art, memories, or love notes from ever resurrecting.

const deletedProjectIds = new Set<string>();
const deletedTurtleIds = new Set<string>();
const deletedNoteIds = new Set<string>();
const deletedMemoryIds = new Set<string>();

export function markProjectDeletedOnServer(id: string) {
  if (id) deletedProjectIds.add(id);
}

export function isProjectDeletedOnServer(id: string): boolean {
  return deletedProjectIds.has(id);
}

export function markTurtleDeletedOnServer(id: string) {
  if (id) deletedTurtleIds.add(id);
}

export function isTurtleDeletedOnServer(id: string): boolean {
  return deletedTurtleIds.has(id);
}

export function markNoteDeletedOnServer(id: string) {
  if (id) deletedNoteIds.add(id);
}

export function isNoteDeletedOnServer(id: string): boolean {
  return deletedNoteIds.has(id);
}

export function markMemoryDeletedOnServer(id: string) {
  if (id) deletedMemoryIds.add(id);
}

export function isMemoryDeletedOnServer(id: string): boolean {
  return deletedMemoryIds.has(id);
}

export function clearAllDeletedOnServer() {
  deletedProjectIds.clear();
  deletedTurtleIds.clear();
  deletedNoteIds.clear();
  deletedMemoryIds.clear();
}
