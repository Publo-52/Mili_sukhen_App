'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Heart as HeartIcon, Gift } from 'lucide-react';
import { TurtleCreation } from '@/types';

interface TurtleCanvasViewerProps {
  creation: TurtleCreation;
}

// ─── Mathematical Python Turtle Virtual Machine ──────────────────────────────────
interface TurtlePathSegment {
  type: 'line' | 'fill' | 'text' | 'confetti';
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  points?: { x: number; y: number }[];
  pencolor?: string;
  fillcolor?: string;
  pensize?: number;
  text?: string;
  font?: string;
  align?: CanvasTextAlign;
}

class PythonTurtleVM {
  x = 0;
  y = 0;
  heading = 0; // in degrees, 0 = East, 90 = North, 180 = West, 270 = South
  isDown = true;
  penColor = '#000000';
  fillColor = '#000000';
  penSize = 2;
  isFilling = false;
  fillPoints: { x: number; y: number }[] = [];
  segments: TurtlePathSegment[] = [];

  up() {
    this.isDown = false;
  }
  down() {
    this.isDown = true;
    if (this.isFilling) {
      this.fillPoints.push({ x: this.x, y: this.y });
    }
  }
  setpos(nx: number, ny: number) {
    if (this.isDown) {
      this.segments.push({
        type: 'line',
        x1: this.x,
        y1: this.y,
        x2: nx,
        y2: ny,
        pencolor: this.penColor,
        pensize: this.penSize,
      });
      if (this.isFilling) {
        this.fillPoints.push({ x: nx, y: ny });
      }
    }
    this.x = nx;
    this.y = ny;
  }
  goto(nx: number, ny: number) {
    this.setpos(nx, ny);
  }
  forward(distance: number) {
    const rad = (this.heading * Math.PI) / 180;
    const nx = this.x + distance * Math.cos(rad);
    const ny = this.y + distance * Math.sin(rad);
    this.setpos(nx, ny);
  }
  fd(d: number) {
    this.forward(d);
  }
  backward(distance: number) {
    this.forward(-distance);
  }
  bk(d: number) {
    this.backward(d);
  }
  left(angle: number) {
    this.heading = (this.heading + angle) % 360;
  }
  right(angle: number) {
    this.heading = (this.heading - angle) % 360;
  }
  setheading(angle: number) {
    this.heading = angle % 360;
  }
  pencolor(c: string) {
    this.penColor = c;
  }
  color(c: string) {
    this.penColor = c;
  }
  fillcolor(c: string) {
    this.fillColor = c;
  }
  pensize(s: number) {
    this.penSize = s;
  }
  begin_fill() {
    this.isFilling = true;
    this.fillPoints = [{ x: this.x, y: this.y }];
  }
  end_fill() {
    this.isFilling = false;
    if (this.fillPoints.length > 2) {
      this.segments.push({
        type: 'fill',
        points: [...this.fillPoints],
        fillcolor: this.fillColor,
        pencolor: this.penColor,
        pensize: this.penSize,
      });
    }
    this.fillPoints = [];
  }

  // Exact Python turtle.circle(radius, extent, steps) implementation
  circle(radius: number, extent = 360) {
    const isPositive = radius >= 0;
    const absR = Math.abs(radius);
    const radH = (this.heading * Math.PI) / 180;

    // Center of circle in Turtle coordinates
    const cx = isPositive ? this.x - absR * Math.sin(radH) : this.x + absR * Math.sin(radH);
    const cy = isPositive ? this.y + absR * Math.cos(radH) : this.y - absR * Math.cos(radH);

    // Initial angle from center to turtle
    const theta0 = Math.atan2(this.y - cy, this.x - cx);
    const stepCount = Math.max(12, Math.floor((Math.abs(extent) / 360) * 48));
    const stepRad = (extent * Math.PI) / (180 * stepCount);

    for (let i = 1; i <= stepCount; i++) {
      const currentTheta = isPositive ? theta0 + i * stepRad : theta0 - i * stepRad;
      const nx = cx + absR * Math.cos(currentTheta);
      const ny = cy + absR * Math.sin(currentTheta);

      if (this.isDown) {
        this.segments.push({
          type: 'line',
          x1: this.x,
          y1: this.y,
          x2: nx,
          y2: ny,
          pencolor: this.penColor,
          pensize: this.penSize,
        });
        if (this.isFilling) {
          this.fillPoints.push({ x: nx, y: ny });
        }
      }
      this.x = nx;
      this.y = ny;
    }

    // Update heading
    this.heading = isPositive ? (this.heading + extent) % 360 : (this.heading - extent) % 360;
  }

  write(text: string, font = '14px sans-serif', align: CanvasTextAlign = 'left') {
    this.segments.push({
      type: 'text',
      x1: this.x,
      y1: this.y,
      text,
      font,
      align,
      pencolor: this.penColor,
    });
  }
}

// ─── Generate Segments for Teddy Day ─────────────────────────────────────────────
function generateTeddySegments(): { bg: string; segments: TurtlePathSegment[]; confetti: { x: number; y: number; dx: number; dy: number; color: string; size: number }[] } {
  const t = new PythonTurtleVM();

  const ring = (col: string, rad: number) => {
    t.fillcolor(col);
    t.begin_fill();
    t.circle(rad);
    t.end_fill();
  };

  // Ears
  t.up(); t.setpos(-105, 185); t.down();
  ring('blue', 45);
  t.up(); t.setpos(105, 185); t.down();
  ring('blue', 45);

  // Face
  t.up(); t.setpos(0, 5); t.down();
  ring('white', 120);

  // Eyes
  t.up(); t.setpos(-54, 125); t.down();
  ring('black', 24);
  t.up(); t.setpos(54, 125); t.down();
  ring('black', 24);

  // Eye highlights
  t.up(); t.setpos(-54, 131); t.down();
  ring('white', 12);
  t.up(); t.setpos(54, 131); t.down();
  ring('white', 12);

  // Nose
  t.up(); t.setpos(0, 65); t.down();
  ring('#795548', 15);

  // Mouth
  t.pensize(2);
  t.color('#000000');
  t.up(); t.setpos(0, 65); t.down();
  t.right(90); t.circle(15, 180);
  t.up(); t.setpos(0, 65); t.down();
  t.left(360); t.circle(15, -180);

  // Blush
  t.setheading(0);
  t.up(); t.setpos(-80, 60); t.down();
  ring('#FFD1DC', 15);
  t.up(); t.setpos(80, 60); t.down();
  ring('#FFD1DC', 15);

  // Confetti particles
  const confettiColors = ['#FF69B4', '#FFD700', '#ADFF2F', '#00BFFF', '#FF4500', '#DA70D6'];
  const confetti = [];
  for (let i = 0; i < 200; i++) {
    const x = (Math.random() - 0.5) * 1200;
    const y = (Math.random() - 0.5) * 900;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 25 + 15;
    confetti.push({
      x,
      y,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: Math.random() * 3 + 2,
    });
  }

  return { bg: '#DBE4BA', segments: t.segments, confetti };
}

// ─── Generate Segments for Rose Day ──────────────────────────────────────────────
function generateRoseDaySegments(): { bg: string; segments: TurtlePathSegment[] } {
  const t = new PythonTurtleVM();
  t.pensize(2);

  // Message 1
  t.up();
  t.goto(-250, -280);
  t.color('#5d4037');
  t.write("Happy rose day my dear mili.....!!!", "italic 16px Verdana", 'left');

  // Go to rose top start
  t.goto(0, 0);
  t.up();
  t.left(90);
  t.fd(200);
  t.down();
  t.right(90);

  // Blooming Rose Petals Fill
  t.fillcolor('#ff0000');
  t.begin_fill();
  t.circle(10, 180);
  t.circle(25, 110);
  t.left(50);
  t.circle(60, 45);
  t.circle(20, 170);
  t.right(24);
  t.fd(30);
  t.left(10);
  t.circle(30, 110);
  t.fd(20);
  t.left(40);
  t.circle(90, 70);
  t.circle(30, 150);
  t.right(30);
  t.fd(15);
  t.circle(80, 90);
  t.left(15);
  t.fd(45);
  t.right(165);
  t.fd(20);
  t.left(155);
  t.circle(150, 80);
  t.left(50);
  t.circle(150, 90);
  t.end_fill();

  // Inner petal shading curves
  t.left(150);
  t.circle(-90, 70);
  t.left(20);
  t.circle(75, 105);
  t.setheading(60);
  t.circle(80, 98);
  t.circle(-90, 40);

  t.left(180);
  t.circle(90, 40);
  t.circle(-80, 98);
  t.setheading(-83);

  // Stem & Leaves
  t.fd(30);
  t.left(90);
  t.fd(25);
  t.left(45);
  t.fillcolor('#4caf50');
  t.begin_fill();
  t.circle(-80, 90);
  t.right(90);
  t.circle(-80, 90);
  t.end_fill();

  t.right(135);
  t.fd(60);
  t.left(180);
  t.fd(85);
  t.left(90);
  t.fd(80);

  t.right(90);
  t.right(45);
  t.fillcolor('#4caf50');
  t.begin_fill();
  t.circle(80, 90);
  t.left(90);
  t.circle(80, 90);
  t.end_fill();

  t.left(135);
  t.fd(60);
  t.left(180);
  t.fd(60);
  t.right(90);
  t.circle(226, 60);

  // Bounding Heart in Crimson Red pensize(4) #ff1744
  t.pensize(4);
  t.color('#ff1744');
  t.left(50);
  t.forward(160);
  t.circle(55, 200);
  t.right(140);
  t.circle(55, 200);
  t.forward(160);

  return { bg: '#DDD9D9', segments: t.segments };
}

const LOVE_MESSAGES = [
  "তুমি আমার সবচেয়ে সুন্দর স্বপ্ন 🌙",
  "তোমার হাসি দেখলে আমার পৃথিবী আলো হয়ে যায় ☀️",
  "তুমি রাগলেও তুমি world's most cute person 🥺",
  "I'm sorry... but I love you MORE than sorry! 💕",
  "তোমাকে ছাড়া একটা দিনও ভাবতে পারি না 🫶",
  "তোমার রাগ দেখতেও ভালো লাগে, তুমি জানো? 😄",
  "আমি সবসময় তোমার পাশে আছি, ভালো-মন্দ সব সময়ে 💗",
  "তুমি শুধু আমার GF না, তুমি আমার best friend ও 🌸",
  "তোমার সাথে প্রতিটা মুহূর্ত special 💫",
  "Smile koro please? Tumake khub miss korchi! 🙏💕",
];

const SORRY_MESSAGES = [
  "Maaf koro amar sonaar meye 🥺",
  "Please smile koro na... 🌸",
  "Tumi rele ami kemon thakbo bolo? 💔",
  "Sorry sorry sorry... 1000 times! 🙏",
  "Tomar ragta dekhe moner khub kharap lage 😢",
];

// ─── Main Component ──────────────────────────────────────────────────────────────
export const TurtleCanvasViewer: React.FC<TurtleCanvasViewerProps> = ({ creation }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const [sorryMessage, setSorryMessage] = useState('');
  const [burstTrigger, setBurstTrigger] = useState(0);

  const handleBurstHearts = () => {
    setBurstTrigger((prev) => prev + 1);
  };

  const handleShowSorry = () => {
    const randomSorry = SORRY_MESSAGES[Math.floor(Math.random() * SORRY_MESSAGES.length)];
    setSorryMessage(randomSorry);
    setBurstTrigger((prev) => prev + 1);
    setTimeout(() => setSorryMessage(''), 4000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 560);
    const height = (canvas.height = 440);
    const type = creation.canvasDrawingType || 'rose';

    // Precalculate Turtle VM segments
    const teddyData = type === 'teddy' ? generateTeddySegments() : null;
    const roseData = type === 'rose-day' ? generateRoseDaySegments() : null;

    // Love app state
    interface TkinterHeart {
      x: number;
      y: number;
      size: number;
      color: string;
      speed: number;
      drift: number;
      alpha: number;
      opacityStep: number;
    }
    const heartColors = ["#ff69b4", "#ff1493", "#ff85c0", "#ffb3d9", "#e91e8c", "#f48fb1", "#ff4d94", "#ff007f"];
    const hearts: TkinterHeart[] = [];
    let msgIndex = 0;
    let charIndex = 0;
    let typeTimer = 0;

    const spawnHearts = (count = 3, startY = height + 20) => {
      for (let i = 0; i < count; i++) {
        hearts.push({
          x: Math.random() * (width - 60) + 30,
          y: startY + Math.random() * 30,
          size: Math.random() * 0.7 + 0.4,
          color: heartColors[Math.floor(Math.random() * heartColors.length)],
          speed: Math.random() * 2 + 1.2,
          drift: (Math.random() - 0.5) * 1.5,
          alpha: 1,
          opacityStep: Math.random() * 0.008 + 0.004,
        });
      }
    };

    if (type === 'love-app') {
      spawnHearts(12, height / 2);
    }

    // OpenCV sketch image
    const sketchImg = new Image();
    let imgLoaded = false;
    if (type === 'opencv-sketch') {
      sketchImg.src = creation.artworkImage || '/images/mili_sketch.jpg';
      sketchImg.onload = () => {
        imgLoaded = true;
      };
    }

    const drawFrame = () => {
      // ═════════════════════════════════════════════════════════════════════════════
      // 1. TEDDY DAY (100% Exact Python Turtle VM Replayer)
      // ═════════════════════════════════════════════════════════════════════════════
      if (type === 'teddy' && teddyData) {
        ctx.fillStyle = teddyData.bg;
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2 - 10;
        const scale = Math.min(width, height) / 520;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, -scale); // Invert Y for turtle coordinate conversion!

        const totalSegs = teddyData.segments.length;
        const visibleSegs = Math.min(totalSegs, Math.floor(step * 4));

        for (let i = 0; i < visibleSegs; i++) {
          const seg = teddyData.segments[i];
          if (seg.type === 'fill' && seg.points && seg.points.length > 2) {
            ctx.fillStyle = seg.fillcolor || '#ffffff';
            ctx.beginPath();
            ctx.moveTo(seg.points[0].x, seg.points[0].y);
            for (let p = 1; p < seg.points.length; p++) {
              ctx.lineTo(seg.points[p].x, seg.points[p].y);
            }
            ctx.closePath();
            ctx.fill();
          } else if (seg.type === 'line') {
            ctx.strokeStyle = seg.pencolor || '#000000';
            ctx.lineWidth = (seg.pensize || 2) / scale;
            ctx.beginPath();
            ctx.moveTo(seg.x1 || 0, seg.y1 || 0);
            ctx.lineTo(seg.x2 || 0, seg.y2 || 0);
            ctx.stroke();
          }
        }

        ctx.restore();

        // Typewriter text in normal (non-inverted) canvas coordinates
        if (step > 60) {
          ctx.save();
          ctx.fillStyle = '#000000';
          ctx.font = 'bold italic 18px Arial, sans-serif';
          ctx.textAlign = 'center';

          const msg1 = "Happy teddy day my dear wife mili❤️";
          const len1 = Math.min(msg1.length, Math.floor((step - 60) / 2));
          ctx.fillText(msg1.slice(0, len1), width / 2, height - 70);

          if (step > 110) {
            const msg2 = "I love you❤️";
            const len2 = Math.min(msg2.length, Math.floor((step - 110) / 2));
            ctx.fillText(msg2.slice(0, len2), width / 2, height - 40);
          }
          ctx.restore();
        }

        // Confetti burst replayer
        if (step > 140) {
          ctx.save();
          ctx.translate(cx, cy);
          const confettiCount = Math.min(teddyData.confetti.length, Math.floor((step - 140) * 4));
          for (let i = 0; i < confettiCount; i++) {
            const c = teddyData.confetti[i];
            ctx.strokeStyle = c.color;
            ctx.lineWidth = c.size * scale;
            ctx.beginPath();
            ctx.moveTo(c.x * scale, -c.y * scale);
            ctx.lineTo((c.x + c.dx) * scale, -(c.y + c.dy) * scale);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // ═════════════════════════════════════════════════════════════════════════════
      // 2. ROSE DAY (100% Exact Python Turtle VM Replayer)
      // ═════════════════════════════════════════════════════════════════════════════
      else if (type === 'rose-day' && roseData) {
        ctx.fillStyle = roseData.bg;
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2 + 10;
        const scale = Math.min(width, height) / 580;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, -scale); // Invert Y for exact turtle coordinates

        const totalSegs = roseData.segments.length;
        const visibleSegs = Math.min(totalSegs, Math.floor(step * 3));

        for (let i = 0; i < visibleSegs; i++) {
          const seg = roseData.segments[i];
          if (seg.type === 'fill' && seg.points && seg.points.length > 2) {
            ctx.fillStyle = seg.fillcolor || '#ff0000';
            ctx.beginPath();
            ctx.moveTo(seg.points[0].x, seg.points[0].y);
            for (let p = 1; p < seg.points.length; p++) {
              ctx.lineTo(seg.points[p].x, seg.points[p].y);
            }
            ctx.closePath();
            ctx.fill();
          } else if (seg.type === 'line') {
            ctx.strokeStyle = seg.pencolor || '#ff0000';
            ctx.lineWidth = (seg.pensize || 2) / scale;
            ctx.beginPath();
            ctx.moveTo(seg.x1 || 0, seg.y1 || 0);
            ctx.lineTo(seg.x2 || 0, seg.y2 || 0);
            ctx.stroke();
          }
        }

        ctx.restore();

        // Text in normal canvas orientation
        ctx.save();
        ctx.fillStyle = '#5d4037';
        ctx.font = 'italic 16px Verdana, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Happy rose day my dear mili.....!!!", width / 2, height - 25);
        ctx.restore();
      }

      // ═════════════════════════════════════════════════════════════════════════════
      // 3. OPENCV CONTOUR SKETCHER (Hand Drawing Mili Portrait)
      // ═════════════════════════════════════════════════════════════════════════════
      else if (type === 'opencv-sketch') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        const imgSize = Math.min(width * 0.75, height * 0.82);
        const imgX = (width - imgSize) / 2;
        const imgY = (height - imgSize) / 2 - 10;
        const maxSteps = 240;

        if (imgLoaded && sketchImg) {
          const revealY = (step / maxSteps) * (imgSize + 20);

          ctx.save();
          ctx.beginPath();
          ctx.rect(imgX, imgY, imgSize, revealY);
          ctx.clip();
          ctx.drawImage(sketchImg, imgX, imgY, imgSize, imgSize);
          ctx.restore();

          // Active moving pencil tip
          if (step < maxSteps) {
            const penX = imgX + (imgSize / 2) + Math.sin(step * 0.45) * (imgSize * 0.4);
            const penY = imgY + revealY;

            ctx.save();
            ctx.fillStyle = '#374151';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(penX, penY, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(penX, penY);
            ctx.lineTo(penX + 18, penY - 35);
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`OpenCV Stroke Tracing: ${Math.min(100, Math.round((step / maxSteps) * 100))}% • Hand Drawn for Mili`, width / 2, height - 15);
      }

      // ═════════════════════════════════════════════════════════════════════════════
      // 4. LOVE APP (Tkinter Floating Hearts Simulator)
      // ═════════════════════════════════════════════════════════════════════════════
      else if (type === 'love-app') {
        ctx.fillStyle = '#1a0a1a';
        ctx.fillRect(0, 0, width, height);

        // Sparkles bar
        ctx.font = '12px sans-serif';
        const sparkleColors = ["#ff69b4", "#ffb3de", "#ff1493", "#ff85c0", "#ffc0cb"];
        const sparkles = ["✦", "✧", "⋆", "✨", "·"];
        for (let i = 20; i < width; i += 40) {
          ctx.fillStyle = sparkleColors[(i + step) % sparkleColors.length];
          ctx.fillText(sparkles[(i * 3 + step) % sparkles.length], i, 25);
        }

        // Floating Cardioid Hearts
        for (let i = hearts.length - 1; i >= 0; i--) {
          const h = hearts[i];
          h.y -= h.speed;
          h.x += h.drift;
          h.alpha -= h.opacityStep;

          if (h.alpha <= 0 || h.y < -30) {
            hearts.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.translate(h.x, h.y);
          ctx.globalAlpha = Math.max(0, h.alpha);
          ctx.fillStyle = h.color;
          ctx.shadowColor = h.color;
          ctx.shadowBlur = 10;

          ctx.beginPath();
          const s = h.size * 0.8;
          for (let angle = 0; angle <= 360; angle += 10) {
            const rad = (angle * Math.PI) / 180;
            const hx = s * 16 * Math.pow(Math.sin(rad), 3);
            const hy = -s * (13 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad));
            if (angle === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        if (Math.random() < 0.25) {
          spawnHearts(1);
        }

        // Header: "For My Mili 💕"
        ctx.save();
        ctx.textAlign = 'center';
        const nameColors = ["#ff69b4", "#ff85c0", "#ff1493", "#ffb3d9", "#e91e8c"];
        ctx.fillStyle = nameColors[Math.floor(step / 30) % nameColors.length];
        ctx.font = 'bold 22px Georgia, serif';
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 12;
        ctx.fillText("For My Mili 💕", width / 2, 70);

        // Typewriter Message Box
        const boxW = Math.min(width - 60, 460);
        const boxH = 90;
        const boxX = (width - boxW) / 2;
        const boxY = 95;

        ctx.fillStyle = '#2d0a2d';
        ctx.strokeStyle = '#ff69b440';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#2d0a2d';

        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 16);
        ctx.fill();
        ctx.stroke();

        const currentMsg = LOVE_MESSAGES[msgIndex % LOVE_MESSAGES.length];
        typeTimer++;
        if (typeTimer % 2 === 0 && charIndex < currentMsg.length) {
          charIndex++;
        }
        if (charIndex >= currentMsg.length && typeTimer > 180) {
          charIndex = 0;
          typeTimer = 0;
          msgIndex++;
        }

        const displayed = currentMsg.slice(0, charIndex) + (charIndex < currentMsg.length ? '█' : '');
        ctx.fillStyle = '#ffe4f0';
        ctx.font = '15px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(displayed, width / 2, boxY + 52);

        // Signature
        ctx.font = 'italic 12px Georgia, serif';
        ctx.fillStyle = '#9e5070';
        ctx.textAlign = 'center';
        ctx.fillText("— With all my love, Sukhen 🌸", width / 2, height - 30);
        ctx.restore();
      }

      // ═════════════════════════════════════════════════════════════════════════════
      // 5. DEFAULT TURTLE (Radiant Rose, Galaxy, Tree)
      // ═════════════════════════════════════════════════════════════════════════════
      else {
        if (step === 0) {
          ctx.fillStyle = '#06040a';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.save();
        ctx.translate(width / 2, height / 2);

        const colors = ["#ff2d55", "#fb7185", "#f43f5e", "#fda4af", "#ffe4e6", "#fde047", "#c084fc"];

        if (type === 'rose') {
          const radius = (170 - (step % 140)) * 0.7;
          const angle = (step * 18 * Math.PI) / 180;
          ctx.strokeStyle = colors[step % colors.length];
          ctx.lineWidth = 1.5;
          ctx.shadowColor = colors[step % colors.length];
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * 30, Math.sin(angle) * 30, Math.max(10, radius), 0, Math.PI * 0.5);
          ctx.stroke();
        } else if (type === 'tree') {
          const len = 80 * Math.pow(0.8, (step % 5));
          const angle = ((step % 60) - 30) * (Math.PI / 180);
          ctx.strokeStyle = colors[step % colors.length];
          ctx.lineWidth = Math.max(1, 4 - (step % 5));
          ctx.beginPath();
          ctx.moveTo(0, 80);
          ctx.lineTo(Math.sin(angle) * len, 80 - Math.cos(angle) * len);
          ctx.stroke();
        } else {
          const t = step * 0.08;
          const x = 12 * 16 * Math.pow(Math.sin(t), 3);
          const y = -12 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          ctx.fillStyle = colors[step % colors.length];
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, (step % 6) + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      step++;
      setProgress(Math.min(100, Math.round((step / 280) * 100)));

      if (type === 'love-app' || step < 280) {
        if (isPlaying) {
          animRef.current = requestAnimationFrame(drawFrame);
        }
      }
    };

    if (isPlaying) {
      animRef.current = requestAnimationFrame(drawFrame);
    }

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [creation, isPlaying, burstTrigger]);

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  const isLoveApp = creation.canvasDrawingType === 'love-app';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-white/10 flex flex-col">
      {/* Canvas Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-obsidian-900/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-roseGlow-400" />
          <span className="text-xs font-mono text-slate-300">
            {creation.canvasDrawingType === 'love-app' && '⚡ Live Python Tkinter App Simulator'}
            {creation.canvasDrawingType === 'teddy' && '🧸 Live Python Turtle Teddy Day Engine (Exact Virtual VM)'}
            {creation.canvasDrawingType === 'rose-day' && '🌹 Live Python Turtle Rose Day Engine (Exact Virtual VM)'}
            {creation.canvasDrawingType === 'opencv-sketch' && '✍️ Live OpenCV Contour Pencil Sketcher'}
            {!['love-app', 'teddy', 'rose-day', 'opencv-sketch'].includes(creation.canvasDrawingType || '') && 'Live Python Turtle Replayer'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Redraw"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Tkinter Controls if Love App */}
      {isLoveApp && (
        <div className="bg-[#2d0a2d]/90 px-4 py-2 flex items-center justify-between border-b border-rose-500/20">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShowSorry}
              className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Gift className="w-3 h-3" />
              <span>Tap for a Surprise!</span>
            </button>
            <button
              onClick={handleBurstHearts}
              className="px-3 py-1 rounded-full bg-pink-900/60 hover:bg-pink-800 text-pink-300 text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <HeartIcon className="w-3 h-3 text-pink-400 fill-pink-400" />
              <span>Heart Burst!</span>
            </button>
          </div>

          {sorryMessage && (
            <span className="text-xs italic text-pink-200 font-serif animate-pulse">
              {sorryMessage}
            </span>
          )}
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="relative aspect-[16/10] w-full bg-[#07050d] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/5 w-full">
        <div
          className="h-full bg-gradient-to-r from-roseGlow-500 to-purple-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

