import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { INITIAL_PROJECTS } from '@/data/projects';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Calendar,
  Layers,
  Sparkles,
  Heart,
  Code2,
  Share2
} from 'lucide-react';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/footer/Footer';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return INITIAL_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const project = INITIAL_PROJECTS.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100 selection:bg-roseGlow-500 selection:text-white">
      <Navbar />

      <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-roseGlow-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ALL CREATIONS</span>
          </Link>
        </div>

        {/* Header Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-roseGlow-500/10 text-roseGlow-400 border border-roseGlow-500/30">
              {project.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-roseGlow-400" />
              <span>Created {formatDate(project.createdAt)}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {project.title}
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 font-light max-w-3xl leading-relaxed">
            {project.description}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-roseGlow-600 hover:bg-roseGlow-500 text-white font-medium text-sm shadow-glow transition-all hover:scale-105"
            >
              <span>Launch Live Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass-card hover:border-white/40 text-slate-200 hover:text-white font-medium text-sm transition-all"
              >
                <Github className="w-4 h-4" />
                <span>View Source Code</span>
              </a>
            )}
          </div>
        </div>

        {/* Large Media Preview */}
        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/15 aspect-[16/9] shadow-2xl">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent flex items-end p-6 sm:p-8">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase text-roseGlow-300 tracking-wider">
                Vercel Production Deployment
              </span>
              <p className="text-sm text-slate-300 font-mono truncate max-w-md">
                {project.url}
              </p>
            </div>
          </div>
        </div>

        {/* The Story Behind The Creation */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 space-y-6 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-roseGlow-500/20 text-roseGlow-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                The Story Behind This Creation
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Why and how I built this for you
              </p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-slate-300 text-base leading-relaxed space-y-4">
            <p>
              {project.detailedStory || project.description}
            </p>
            <p className="text-sm font-serif italic text-roseGlow-200/90 pt-2 border-t border-white/5">
              “Every website is more than just code. It’s a captured moment in time dedicated to you.”
            </p>
          </div>
        </div>

        {/* Technologies Breakdown */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-200">
            <Code2 className="w-5 h-5 text-roseGlow-400" />
            <h3 className="text-lg font-semibold">Technologies Used</h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-mono tracking-wide"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Screenshots Showcase */}
        {project.screenshots && project.screenshots.length > 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Visual Gallery</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.screenshots.map((img, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden glass-card aspect-[16/10] border border-white/10"
                >
                  <Image
                    src={img}
                    alt={`${project.title} screenshot ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="text-center py-8 space-y-4">
          <p className="text-sm font-serif italic text-slate-400">
            Created with endless love by Sukhen for Mili ❤️
          </p>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card hover:border-roseGlow-500/40 text-slate-200 hover:text-white text-xs font-mono uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Next Creation</span>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
