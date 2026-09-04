'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  hue: number;
}

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Pause particle animation during user scrolling for butter-smooth 120fps scrolling
    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 120);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    const particles: Particle[] = [];
    const particleCount = isMobile ? 8 : 18;
    const hues = [345, 350, 45, 275, 330];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.25 + 0.08;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.1 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -Math.random() * 0.15 - 0.04,
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
        hue: hues[i % hues.length],
      });
    }

    let angle = 0;
    let lastTime = 0;

    const render = (time: number) => {
      // 1. If user is scrolling or tab is hidden, skip frame calculation entirely (0% GPU workload during scroll!)
      if (isScrolling || document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // 2. Battery saver: on mobile throttle to 25-30fps; on desktop ~45-50fps
      const minInterval = isMobile ? 38 : 20;
      if (time - lastTime < minInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      angle += 0.005;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(angle + p.y * 0.01) * 0.05;
        p.y += p.vy;
        p.alpha = p.baseAlpha + Math.sin(angle * 2 + p.x * 0.01) * 0.06;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 6.283);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${Math.max(0.05, p.alpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      cancelAnimationFrame(animationFrameId);
      if (!document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(scrollTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
