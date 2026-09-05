import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/admin-auth';
import { Project, ProjectCategory } from '@/types';

// Theme presets for automatic styling
const THEME_PRESETS = [
  {
    key: 'rose',
    accent: '#f43f5e',
    gradient: 'from-rose-600/20 via-pink-600/10 to-transparent',
    glow: 'rgba(244, 63, 94, 0.4)',
    border: 'group-hover:border-rose-500/50',
    textAccent: 'group-hover:text-rose-400',
    badge: 'Heartfelt Creation',
  },
  {
    key: 'purple',
    accent: '#8b5cf6',
    gradient: 'from-purple-600/20 via-indigo-600/10 to-transparent',
    glow: 'rgba(139, 92, 246, 0.4)',
    border: 'group-hover:border-purple-500/50',
    textAccent: 'group-hover:text-purple-300',
    badge: 'Cosmic Keepsake',
  },
  {
    key: 'amber',
    accent: '#f59e0b',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    glow: 'rgba(245, 158, 11, 0.4)',
    border: 'group-hover:border-amber-500/50',
    textAccent: 'group-hover:text-amber-300',
    badge: 'Golden Memories',
  },
  {
    key: 'emerald',
    accent: '#10b981',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    glow: 'rgba(16, 185, 129, 0.4)',
    border: 'group-hover:border-emerald-500/50',
    textAccent: 'group-hover:text-emerald-300',
    badge: 'Enchanted Realm',
  },
  {
    key: 'cyan',
    accent: '#06b6d4',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    glow: 'rgba(6, 182, 212, 0.4)',
    border: 'group-hover:border-cyan-500/50',
    textAccent: 'group-hover:text-cyan-300',
    badge: 'Starlight Odyssey',
  },
  {
    key: 'pink',
    accent: '#ec4899',
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    glow: 'rgba(236, 72, 153, 0.4)',
    border: 'group-hover:border-pink-500/50',
    textAccent: 'group-hover:text-pink-300',
    badge: 'Love Symphony',
  },
];

const FALLBACK_THUMBNAILS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
];

function extractMetaContent(html: string, nameOrProp: string): string {
  const regexes = [
    new RegExp(`<meta[^>]+(?:property|name)=["'](?:og:|twitter:)?${nameOrProp}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:|twitter:)?${nameOrProp}["']`, 'i'),
  ];
  for (const re of regexes) {
    const match = html.match(re);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function extractTitle(html: string, url: string): string {
  const ogTitle = extractMetaContent(html, 'title');
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  // Fallback from URL
  try {
    const parsed = new URL(url);
    const hostPart = parsed.hostname.split('.')[0];
    const pathPart = parsed.pathname.replace(/^\/|\/$/g, '').split('/').pop() || '';
    const name = pathPart || hostPart;
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return 'Romantic Web Creation';
  }
}

function detectTechStack(html: string, url: string): string[] {
  const detected = new Set<string>();
  const lowerHtml = html.toLowerCase();
  const lowerUrl = url.toLowerCase();

  if (lowerHtml.includes('next') || lowerHtml.includes('__next') || lowerHtml.includes('_next/static')) {
    detected.add('Next.js');
  }
  if (lowerHtml.includes('react') || lowerHtml.includes('react-dom') || lowerHtml.includes('__react')) {
    detected.add('React');
  }
  if (lowerHtml.includes('tailwind') || lowerHtml.includes('bg-') || lowerHtml.includes('text-')) {
    detected.add('Tailwind CSS');
  }
  if (lowerHtml.includes('framer-motion') || lowerHtml.includes('motion.')) {
    detected.add('Framer Motion');
  }
  if (lowerHtml.includes('three') || lowerHtml.includes('webgl') || lowerHtml.includes('canvas')) {
    detected.add('Three.js');
    detected.add('HTML5 Canvas');
  }
  if (lowerHtml.includes('lucide') || lowerHtml.includes('svg')) {
    detected.add('Lucide Icons');
  }
  if (lowerUrl.includes('turtle') || lowerHtml.includes('turtle') || lowerHtml.includes('python')) {
    detected.add('Python');
    detected.add('Turtle Graphics');
  }

  // Always ensure essential tech tags
  if (detected.size === 0) {
    detected.add('React');
    detected.add('Tailwind CSS');
    detected.add('JavaScript');
  }

  return Array.from(detected);
}

function detectCategory(title: string, desc: string, url: string): ProjectCategory {
  const text = `${title} ${desc} ${url}`.toLowerCase();

  if (text.includes('turtle') || text.includes('python') || text.includes('sketch') || text.includes('drawing')) {
    return 'Python Turtle';
  }
  if (text.includes('envelope') || text.includes('letter') || text.includes('surprise') || text.includes('special') || text.includes('anniversary') || text.includes('valentine') || text.includes('proposal') || text.includes('wife')) {
    return 'Special Projects';
  }
  if (text.includes('game') || text.includes('quiz') || text.includes('canvas') || text.includes('3d') || text.includes('audio') || text.includes('music') || text.includes('piano') || text.includes('interactive')) {
    return 'Interactive Experiences';
  }
  if (text.includes('art') || text.includes('poetry') || text.includes('galaxy') || text.includes('stars') || text.includes('creative') || text.includes('animation')) {
    return 'Creative Projects';
  }

  return 'Websites';
}

function isSafeUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Admins (Sukhen & Mili) can auto-extract and create projects.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const rawUrl = (body.url || '').trim();

    if (!rawUrl) {
      return NextResponse.json({ error: 'Please enter a valid Project URL.' }, { status: 400 });
    }

    // Ensure valid URL format
    let validUrl = rawUrl;
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = `https://${validUrl}`;
    }

    if (!isSafeUrl(validUrl)) {
      return NextResponse.json({ error: 'Invalid or restricted URL host provided.' }, { status: 400 });
    }

    let html = '';
    try {
      const response = await fetch(validUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Suksharmi Auto-Theme Bot)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        html = await response.text();
      }
    } catch {
      // If fetching directly fails, proceed with intelligent fallback extraction from URL
    }

    // Extract Title
    const title = extractTitle(html, validUrl);

    // Extract Description
    let description = extractMetaContent(html, 'description');
    if (!description) {
      description = `A personalized digital creation built with love and devotion for Mili. Deployed live on Vercel.`;
    }

    // Generate emotional romantic story
    const detailedStory = `I created this project especially for my love, Sharmili. Every line of code, interactive animation, and detail was designed to make her feel cherished and remind her of our unforgettable journey together.`;

    // Detect / Generate Thumbnail
    let thumbnail = extractMetaContent(html, 'image');
    if (!thumbnail) {
      // Use dynamic website preview service or fallback
      thumbnail = `https://image.thum.io/get/width/1200/crop/675/maxAge/24/noanimate/${validUrl}`;
    }

    // Detect Technologies & Category
    const technologies = detectTechStack(html, validUrl);
    const category = detectCategory(title, description, validUrl);

    // Pick Theme Preset
    const hash = Array.from(title + validUrl).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const theme = THEME_PRESETS[hash % THEME_PRESETS.length];

    // Generate clean Slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `proj-${Date.now()}`;

    const project: Project = {
      id: `proj-${Date.now()}`,
      title,
      slug,
      description,
      detailedStory,
      category,
      url: validUrl,
      githubUrl: validUrl.includes('github.com') ? validUrl : undefined,
      thumbnail,
      screenshots: [thumbnail],
      technologies,
      createdAt: new Date().toISOString().split('T')[0],
      featured: true,
      order: 1,
      tags: [category, ...technologies.slice(0, 3), 'Mili Special'],
      iframeSupported: true,
      themeGradient: theme.gradient,
      themeGlow: theme.glow,
      themeAccent: theme.accent,
      themeBadge: theme.badge,
      themeBorder: theme.border,
      themeTextAccent: theme.textAccent,
    };

    return NextResponse.json({
      success: true,
      project,
      availableThemes: THEME_PRESETS,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to auto-extract project from URL' },
      { status: 500 }
    );
  }
}
