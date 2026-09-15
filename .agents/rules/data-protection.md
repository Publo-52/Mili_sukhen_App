# Global Data Protection Rule

> **MANDATORY POLICY**:
> You must NEVER delete, truncate, drop, remove, or destructively overwrite any user data, database records, media assets, memories, notes, art, or projects without explicit written permission from the user.

## Protected Elements
- **Memories**: Supabase `memories` table, local storage `mili_universe_memories`, `/public/images/`
- **Love Notes**: Supabase `love_notes` table, local storage `mili_universe_love_notes`
- **Turtle Artworks**: Supabase `turtle_artworks` table, local storage `mili_custom_turtle`
- **Projects**: Supabase `projects` table, local storage `mili_universe_projects`
- **Reels**: Local storage `mili_reels_custom_v1`, initial reels
- **Sessions & Accounts**: User credentials and device sessions

## Rule Enforcement
Any request or code modification that could delete or overwrite user data must be blocked until explicit user authorization is provided.
