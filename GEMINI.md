# Strict Data Preservation Policy (GEMINI.md)

> **CRITICAL BEHAVIORAL RULE**:
> Never delete, truncate, drop, remove, or destructively overwrite any user data, database records, media assets, or content without explicit written permission from the user.

## Protected Assets & Data Categories
1. **User Memories & Media**:
   - Never delete any photo, video, or audio files from `/public/images/`, `/public/audio/`, Supabase `memories` table, or Cloudinary.
   - Never clear or delete `mili_universe_memories` or `mili_fav_memories` in local storage or server cache.
2. **Love Notes & Letters**:
   - Never delete notes from `INITIAL_LOVE_NOTES`, Supabase `love_notes` table, or local storage.
3. **Python Artworks**:
   - Never delete turtle code, drawings, or gallery items from `INITIAL_TURTLE_CREATIONS`, Supabase `turtle_artworks`, or local storage.
4. **Projects & Portfolios**:
   - Never delete projects from `INITIAL_PROJECTS`, Supabase `projects` table, or local storage.
5. **Reels & Video Clips**:
   - Never delete reels from `INITIAL_REELS`, custom reels, or local storage.
6. **User Accounts, Messages & Sessions**:
   - Never delete login credentials, user profiles, love messages, or active session records without explicit instruction.

## Behavioral Requirements
- All data operations must be **additive** (creating new entries) or **protective** (backup before modifying).
- If any operation might remove or replace data, STOP and obtain explicit confirmation first.
