"use client";

// GlobalBackground — Sistema de fondo global
// Capa 1: Campo geométrico flotante (SVG lines + polygons)
// Capa 2: Mesh gradient ambiental
// Capa 3: Noise/textura (via CSS globals)

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─── Capa 2 — Mesh gradient ────────────────────────────────
function MeshGradient() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
    >
      {/* Primary ambient gradient — dark */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(45, 212, 191, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 90%, rgba(45, 212, 191, 0.03) 0%, transparent 60%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(17, 17, 20, 0) 0%, var(--bg) 100%)
          `,
        }}
      />
      {/* Subtle warm tone bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(201, 169, 110, 0.02) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

// ─── Capa 1 — Geometric field ──────────────────────────────
interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
  speed: number;
  phase: number;
}

function GeometricField({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<Line[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function generateLines() {
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const lines: Line[] = [];
      const count = Math.floor((w * h) / 80000) + 6;

      // Diagonal structural lines
      for (let i = 0; i < count; i++) {
        const angle = (Math.random() * 0.5 + 0.1) * (Math.random() > 0.5 ? 1 : -1);
        const x1 = Math.random() * w;
        const y1 = Math.random() * h;
        const length = Math.random() * 400 + 200;
        lines.push({
          x1,
          y1,
          x2: x1 + Math.cos(angle) * length,
          y2: y1 + Math.sin(angle) * length,
          opacity: Math.random() * 0.04 + 0.01,
          speed: Math.random() * 0.0003 + 0.0001,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Horizontal faint lines (architectural)
      for (let i = 0; i < 3; i++) {
        const y = (h / 4) * (i + 1);
        lines.push({
          x1: 0,
          y1: y + Math.random() * 40 - 20,
          x2: w,
          y2: y + Math.random() * 40 - 20,
          opacity: 0.025,
          speed: 0.00005,
          phase: Math.random() * Math.PI * 2,
        });
      }

      linesRef.current = lines;
    }

    function draw(time: number) {
      if (!canvas || !ctx) return;
      timeRef.current = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mx = mouseX / window.innerWidth;
      const my = mouseY / window.innerHeight;

      for (const line of linesRef.current) {
        const pulse = Math.sin(time * line.speed + line.phase) * 0.015;
        const mouseDelta = (mx * 0.5 + my * 0.5 - 0.5) * 0.008;

        ctx.beginPath();
        ctx.moveTo(
          line.x1 + mouseDelta * canvas.width * 0.04,
          line.y1 + mouseDelta * canvas.height * 0.02
        );
        ctx.lineTo(
          line.x2 + mouseDelta * canvas.width * 0.04,
          line.y2 + mouseDelta * canvas.height * 0.02
        );

        const isDark = document.documentElement.getAttribute("data-theme") !== "light";
        const lineColor = isDark ? "255,255,255" : "0,0,0";
        ctx.strokeStyle = `rgba(${lineColor}, ${line.opacity + pulse})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    generateLines();
    rafRef.current = requestAnimationFrame(draw);

    const resizeObs = new ResizeObserver(resize);
    resizeObs.observe(document.documentElement);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObs.disconnect();
    };
  }, [mouseX, mouseY]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 1 }}
    />
  );
}

// ─── Main Component ────────────────────────────────────────
export function GlobalBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;
    const handle = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [prefersReduced]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Capa 2 — Mesh gradient */}
      <MeshGradient />

      {/* Capa 1 — Geometric lines */}
      {!prefersReduced && (
        <GeometricField
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />
      )}

      {/* Capa 3 — Noise overlay (defined in CSS) */}
      <div className="noise-overlay" />
    </div>
  );
}
