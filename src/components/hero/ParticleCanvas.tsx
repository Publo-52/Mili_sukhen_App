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
  twinkleSpeed: number;
}

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);

    // Warm colors: soft pinks, rubies, starlight gold, subtle lavenders
    const hues = [345, 350, 45, 275, 330];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.35 - 0.1, // gently float upwards
        alpha: baseAlpha,
        baseAlpha: baseAlpha,
        hue: hues[Math.floor(Math.random() * hues.length)],
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient vignette gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.3,
        50,
        width / 2,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, 'rgba(244, 63, 94, 0.05)');
      bgGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.03)');
      bgGrad.addColorStop(1, 'rgba(6, 4, 10, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      angle += 0.01;

      particles.forEach((p) => {
        p.x += p.vx + Math.sin(angle + p.y * 0.01) * 0.1;
        p.y += p.vy;
        p.alpha = p.baseAlpha + Math.sin(angle * 3 + p.x) * 0.15;

        // Wrap edges
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${Math.max(0.05, p.alpha)})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, 0.8)`;
        ctx.shadowBlur = p.radius * 6;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
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
