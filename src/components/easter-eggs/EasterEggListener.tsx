'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

interface EasterEggListenerProps {
  onTriggerSurprise: () => void;
}

export const EasterEggListener: React.FC<EasterEggListenerProps> = ({ onTriggerSurprise }) => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  // Keyboard shortcut listener (Shift + M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        onTriggerSurprise();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTriggerSurprise]);

  // Screen double click -> spawn floating heart
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const colors = ['#f43f5e', '#fb7185', '#fda4af', '#fde047', '#c084fc'];
      const newHeart: FloatingHeart = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 20 + 16,
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setHearts((prev) => [...prev, newHeart]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, 1500);
    };

    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, scale: 0.5, x: h.x - h.size / 2, y: h.y - h.size / 2 }}
            animate={{
              opacity: 0,
              scale: 1.5,
              y: h.y - 120,
              x: h.x + (Math.random() - 0.5) * 40,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute"
            style={{ color: h.color }}
          >
            <Heart
              className="fill-current filter drop-shadow-md"
              style={{ width: h.size, height: h.size }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
