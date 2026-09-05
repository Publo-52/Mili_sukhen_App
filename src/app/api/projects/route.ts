import { NextResponse } from 'next/server';
import { INITIAL_PROJECTS } from '@/data/projects';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { markProjectDeletedOnServer, isProjectDeletedOnServer } from '@/lib/server-deleted-tracker';
import { sanitizeText, isSafeExternalUrl } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data !== null) {
        const filtered = data
          .filter((p) => !isProjectDeletedOnServer(p.id))
          .map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            detailedStory: p.detailed_story,
            category: p.category,
            url: p.url,
            githubUrl: p.github_url,
            thumbnail: p.thumbnail,
            technologies: Array.isArray(p.technologies) ? p.technologies : (p.technologies ? JSON.parse(p.technologies) : ['React', 'Tailwind CSS']),
            featured: p.featured,
            order: p.order_index,
            createdAt: p.created_at,
            themeGradient: p.theme_gradient,
            themeGlow: p.theme_glow,
            themeAccent: p.theme_accent,
            themeBadge: p.theme_badge,
            themeBorder: p.theme_border,
            themeTextAccent: p.theme_text_accent,
          }));

        return NextResponse.json(
          { projects: filtered },
          {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              Pragma: 'no-cache',
            },
          }
        );
      }
    } catch {
      // ignore
    }
  }

  const baselineFiltered = INITIAL_PROJECTS.filter((p) => !isProjectDeletedOnServer(p.id));

  return NextResponse.json(
    { projects: baselineFiltered },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admins can add or edit projects.' }, { status: 403 });
    }

    const body = await request.json();
    const project = body.project;

    if (!project || !project.title || !project.url) {
      return NextResponse.json({ error: 'Missing required fields (title, url)' }, { status: 400 });
    }

    const cleanTitle = sanitizeText(project.title, 200);
    const cleanSlug = sanitizeText(project.slug, 200) || `proj-${Date.now()}`;
    const cleanDesc = sanitizeText(project.description, 1000);
    const cleanDetailedStory = sanitizeText(project.detailedStory, 10000);
    const cleanCategory = sanitizeText(project.category, 50) || 'Websites';
    const cleanUrl = sanitizeText(project.url, 1000);
    const cleanGithubUrl = project.githubUrl ? sanitizeText(project.githubUrl, 1000) : null;
    const cleanThumbnail = project.thumbnail ? sanitizeText(project.thumbnail, 1000) : null;
    const cleanTech = Array.isArray(project.technologies)
      ? project.technologies.map((t: any) => sanitizeText(String(t), 50)).filter(Boolean)
      : ['React', 'Next.js', 'Tailwind CSS'];

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').upsert([
        {
          id: sanitizeText(project.id, 64) || `proj-${Date.now()}`,
          title: cleanTitle,
          slug: cleanSlug,
          description: cleanDesc,
          detailed_story: cleanDetailedStory,
          category: cleanCategory,
          url: cleanUrl,
          github_url: cleanGithubUrl,
          thumbnail: cleanThumbnail,
          technologies: cleanTech,
          featured: Boolean(project.featured),
          order_index: typeof project.order === 'number' ? project.order : 1,
          theme_gradient: project.themeGradient ? sanitizeText(project.themeGradient, 100) : null,
          theme_glow: project.themeGlow ? sanitizeText(project.themeGlow, 100) : null,
          theme_accent: project.themeAccent ? sanitizeText(project.themeAccent, 50) : null,
          theme_badge: project.themeBadge ? sanitizeText(project.themeBadge, 100) : null,
          theme_border: project.themeBorder ? sanitizeText(project.themeBorder, 100) : null,
          theme_text_accent: project.themeTextAccent ? sanitizeText(project.themeTextAccent, 100) : null,
          created_at: project.createdAt || new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn('Supabase upsert warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, project });
  } catch {
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admins can delete projects.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Permanently register deletion on server
    markProjectDeletedOnServer(id);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, id, message: 'Project permanently deleted.' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
