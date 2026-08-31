import { NextResponse } from 'next/server';
import { INITIAL_PROJECTS } from '@/data/projects';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSessionFromRequest } from '@/lib/sessions';

export async function GET() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data && data.length > 0) {
      return NextResponse.json({
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
          technologies: p.technologies,
          featured: p.featured,
          order: p.order_index,
          createdAt: p.created_at,
        })),
      });
    }
  }

  return NextResponse.json({
    projects: INITIAL_PROJECTS,
  });
}

export async function POST(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.userRole !== 'sukhen') {
      return NextResponse.json({ error: 'Unauthorized. Only Sukhen can add or edit projects.' }, { status: 403 });
    }

    const body = await request.json();
    const project = body.project;

    if (!project || !project.title || !project.url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
          order_index: project.order,
          created_at: project.createdAt || new Date().toISOString(),
        },
      ]);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, project });
  } catch {
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session || session.userRole !== 'sukhen') {
      return NextResponse.json({ error: 'Unauthorized. Only Sukhen can delete projects.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Project deleted from database' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

