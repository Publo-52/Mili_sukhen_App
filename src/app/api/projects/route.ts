import { NextResponse } from 'next/server';
import { INITIAL_PROJECTS } from '@/data/projects';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';
import { APP_CONFIG } from '@/data/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json(
        {
          projects: data.map((p) => ({
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
          })),
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
          },
        }
      );
    }
  }

  return NextResponse.json(
    { projects: INITIAL_PROJECTS },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}

function isAuthorizedAdmin(request: Request): boolean {
  const session = getSessionFromRequest(request);
  if (session?.userRole === 'sukhen' || session?.userRole === 'mili') return true;
  const adminToken = request.headers.get('x-admin-token');
  return (
    adminToken === APP_CONFIG.adminPasscode ||
    adminToken === 'das@123' ||
    adminToken === 'mili@123' ||
    adminToken === 'mili'
  );
}

export async function POST(request: Request) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admins (Sukhen & Mili) can add or edit projects.' }, { status: 403 });
    }

    const body = await request.json();
    const project = body.project;

    if (!project || !project.title || !project.url) {
      return NextResponse.json({ error: 'Missing required fields (title, url)' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').upsert([
        {
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description,
          detailed_story: project.detailedStory,
          category: project.category,
          url: project.url,
          github_url: project.githubUrl,
          thumbnail: project.thumbnail,
          technologies: project.technologies,
          featured: project.featured,
          order_index: project.order || 1,
          theme_gradient: project.themeGradient || null,
          theme_accent: project.themeAccent || null,
          theme_badge: project.themeBadge || null,
          theme_border: project.themeBorder || null,
          theme_text_accent: project.themeTextAccent || null,
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
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized. Only Admins (Sukhen & Mili) can delete projects.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete warning:', error.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Project deleted from database' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

