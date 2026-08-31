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

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const particles: Particle[] = [];
    const particleCount = isMobile ? 24 : 45;
    const hues = [345, 350, 45, 275, 330];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.35 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.25 - 0.08,
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
        hue: hues[i % hues.length],
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angle += 0.008;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(angle + p.y * 0.01) * 0.08;
        p.y += p.vy;
        p.alpha = p.baseAlpha + Math.sin(angle * 2 + p.x * 0.01) * 0.1;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 6.283); // Math.PI * 2
        ctx.fillStyle = `hsla(${p.hue}, 85%, 75%, ${Math.max(0.08, p.alpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transform-gpu"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  );
};
