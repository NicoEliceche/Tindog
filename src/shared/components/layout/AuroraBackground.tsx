// src/shared/components/layout/AuroraBackground.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// ── Aurora (CSS puro, compositor-friendly) ────────────────────────────────
const auroraDrift = keyframes`
  0%   { transform: translate3d(-8%, -6%, 0) rotate(0deg)   scale(1); }
  33%  { transform: translate3d(6%, 4%, 0)   rotate(4deg)   scale(1.12); }
  66%  { transform: translate3d(-4%, 8%, 0)  rotate(-3deg)  scale(1.05); }
  100% { transform: translate3d(-8%, -6%, 0) rotate(0deg)   scale(1); }
`;

const auroraDriftAlt = keyframes`
  0%   { transform: translate3d(5%, 8%, 0)   rotate(0deg)  scale(1.08); }
  50%  { transform: translate3d(-6%, -5%, 0) rotate(-6deg) scale(1); }
  100% { transform: translate3d(5%, 8%, 0)   rotate(0deg)  scale(1.08); }
`;

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: ${({ theme }) => theme.color.background};
`;

const AuroraLayer = styled.div<{ $variant: 'a' | 'b' | 'c' }>`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  will-change: transform;
  opacity: ${({ $variant }) => ($variant === 'a' ? 0.4 : $variant === 'b' ? 0.28 : 0.22)};

  ${({ $variant, theme }) => {
    if ($variant === 'a') {
      return `
        width: 60vw; height: 60vw;
        top: -18vw; left: -10vw;
        background: radial-gradient(circle, ${theme.color.primary} 0%, transparent 68%);
      `;
    }
    if ($variant === 'b') {
      return `
        width: 52vw; height: 52vw;
        bottom: -16vw; right: -8vw;
        background: radial-gradient(circle, ${theme.color.accent} 0%, transparent 68%);
      `;
    }
    return `
      width: 44vw; height: 44vw;
      top: 32%; left: 42%;
      background: radial-gradient(circle, ${theme.color.primaryLight} 0%, transparent 70%);
    `;
  }}

  animation: ${({ $variant }) => ($variant === 'b' ? auroraDriftAlt : auroraDrift)}
    ${({ $variant }) => ($variant === 'a' ? '26s' : $variant === 'b' ? '32s' : '38s')}
    ease-in-out infinite;
  animation-delay: ${({ $variant }) => ($variant === 'b' ? '-8s' : $variant === 'c' ? '-16s' : '0s')};

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

// Velo que baja el contraste del aurora para que el contenido siga legible.
const Veil = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.color.background}CC 0%,
    ${({ theme }) => theme.color.background}80 40%,
    ${({ theme }) => theme.color.background}E6 100%
  );
`;

const ParticleCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

interface Particle { x: number; y: number; vx: number; vy: number; r: number; }

const PARTICLE_DENSITY = 0.00008; // partículas por px² (se escala con el viewport)
const MAX_PARTICLES = 90;
const LINK_DISTANCE = 130;
const CURSOR_RADIUS = 180;

/**
 * Red de partículas doradas conectadas que reaccionan al cursor, sobre una
 * aurora dorada en movimiento.
 *
 * Rinde en canvas (no DOM) para que 90 partículas + sus líneas no generen
 * cientos de nodos ni layout thrashing. Se detiene sola cuando la pestaña
 * queda oculta y respeta prefers-reduced-motion.
 */
export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let frame = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(Math.round(width * height * PARTICLE_DENSITY), MAX_PARTICLES);
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 0.8 + Math.random() * 1.6,
      }));
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) frame = requestAnimationFrame(draw);
    };

    function draw() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Repulsión suave alrededor del cursor.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < CURSOR_RADIUS && dist > 0.001) {
          const push = (1 - dist / CURSOR_RADIUS) * 0.6;
          p.x += (dx / dist) * push;
          p.y += (dy / dist) * push;
        }

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;
      }

      // Líneas entre partículas cercanas.
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.strokeStyle = `rgba(232, 194, 82, ${0.16 * (1 - d / LINK_DISTANCE)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Partículas (las cercanas al cursor brillan más).
      for (const p of particles) {
        const near = Math.hypot(p.x - pointer.x, p.y - pointer.y) < CURSOR_RADIUS;
        ctx.fillStyle = near ? 'rgba(255, 244, 194, 0.85)' : 'rgba(232, 194, 82, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduceMotion]);

  return (
    <Root aria-hidden="true">
      <AuroraLayer $variant="a" />
      <AuroraLayer $variant="b" />
      <AuroraLayer $variant="c" />
      <Veil />
      {/* El canvas se renderiza siempre (para que SSR y cliente coincidan);
          cuando el usuario prefiere menos movimiento simplemente no se
          dibuja nada en él y queda transparente. */}
      <ParticleCanvas ref={canvasRef} />
    </Root>
  );
}
