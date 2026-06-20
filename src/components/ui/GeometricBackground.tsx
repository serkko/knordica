"use client";

import { useEffect, useRef, useState } from "react";

interface GeometricBackgroundProps {
  variant?: "lines" | "isometric";
}

export function GeometricBackground({ variant = "lines" }: GeometricBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Media query detection for reduced motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    interface IsometricDot {
      x: number;
      y: number;
      duration: number;
      delay: number;
    }

    let dots: IsometricDot[] = [];

    // Handles layout dimensions
    const resizeCanvas = () => {
      if (typeof window === "undefined" || !canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width || window.innerWidth;
      height = rect?.height || window.innerHeight;
      
      // Support high DPI screens
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Re-generate dots for isometric grid
      if (variant === "isometric") {
        dots = [];
        const isMobile = width < 768;
        const spacingH = isMobile ? 64 : 32;
        const spacingV = isMobile ? 36 : 18;

        const rows = Math.ceil(height / spacingV) + 2;
        const cols = Math.ceil(width / spacingH) + 2;

        for (let r = -1; r < rows; r++) {
          const y = r * spacingV;
          const offset = r % 2 === 0 ? 0 : spacingH / 2;
          for (let c = -1; c < cols; c++) {
            const x = c * spacingH + offset;
            dots.push({
              x,
              y,
              duration: 2000 + Math.random() * 3000, // 2s to 5s
              delay: Math.random() * 3000, // 0 to 3s
            });
          }
        }
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Main animation loop
    const render = (timestamp: number) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";

      if (variant === "lines") {
        // --- Variant Lines ---
        const spacing = isMobile ? 96 : 48;
        const baseOpacity = isDark ? 0.06 : 0.04;
        const finalOpacity = isMobile ? baseOpacity * 0.5 : baseOpacity;

        // Fetch border variable
        const style = getComputedStyle(canvas);
        const borderColor = style.getPropertyValue("--color-border").trim() || (isDark ? "#353028" : "#BEB9AF");

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = finalOpacity;

        // Drift speed: full spacing cycle (48px) every 20s = 2.4px/sec
        // If reduced motion is active, freeze the offset at 0
        const driftOffset = prefersReduced ? 0 : ((timestamp / 1000) * 2.4) % spacing;

        const theta = 35 * Math.PI / 180;
        const nx = -Math.sin(theta);
        const ny = Math.cos(theta);

        // Find range of line distances cutting the canvas
        // Projects the four corners onto normal vector
        const d00 = 0;
        const d10 = width * nx;
        const d01 = height * ny;
        const d11 = width * nx + height * ny;

        const dMin = Math.min(d00, d10, d01, d11);
        const dMax = Math.max(d00, d10, d01, d11);

        const dStart = Math.floor(dMin / spacing) * spacing;
        const dEnd = Math.ceil(dMax / spacing) * spacing;

        for (let dValue = dStart; dValue <= dEnd; dValue += spacing) {
          const d = dValue + driftOffset;

          // Find intersection points with boundaries
          const pts: { x: number; y: number }[] = [];

          // Left (x = 0)
          if (ny !== 0) {
            const y = d / ny;
            if (y >= 0 && y <= height) pts.push({ x: 0, y });
          }
          // Right (x = W)
          if (ny !== 0) {
            const y = (d - nx * width) / ny;
            if (y >= 0 && y <= height) pts.push({ x: width, y });
          }
          // Top (y = 0)
          if (nx !== 0) {
            const x = d / nx;
            if (x >= 0 && x <= width) pts.push({ x, y: 0 });
          }
          // Bottom (y = H)
          if (nx !== 0) {
            const x = (d - ny * height) / nx;
            if (x >= 0 && x <= width) pts.push({ x, y: height });
          }

          // Draw the unique segment
          if (pts.length >= 2 && pts[0] && pts[1]) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            ctx.lineTo(pts[1].x, pts[1].y);
            ctx.stroke();
          }
        }
      } else {
        // --- Variant Isometric ---
        const style = getComputedStyle(canvas);
        const goldColor = style.getPropertyValue("--color-gold").trim() || "#A8864A";
        ctx.fillStyle = goldColor;

        dots.forEach((dot) => {
          let alpha = 0.06; // Default static fallback value

          if (!prefersReduced) {
            const elapsed = Math.max(0, timestamp - dot.delay);
            const cycle = (elapsed % dot.duration) / dot.duration;
            // Opacity pulses between 0.04 and 0.10
            alpha = 0.04 + 0.06 * (0.5 + 0.5 * Math.sin(cycle * 2 * Math.PI - Math.PI / 2));
          }

          if (isMobile) {
            alpha *= 0.5;
          }

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
    />
  );
}
