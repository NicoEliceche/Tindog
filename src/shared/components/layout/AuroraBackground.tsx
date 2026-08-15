// src/shared/components/layout/AuroraBackground.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import styled, { useTheme } from 'styled-components';

const Root = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: ${({ theme }) => theme.color.background};
`;

/* El canvas no hereda estilos, así que publicamos los dorados del theme
   como custom properties y los leemos con getComputedStyle al dibujar. */
const Canvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  --tindog-gold: ${({ theme }) => theme.color.primary};
  --tindog-gold-light: ${({ theme }) => theme.color.primaryLight};
  --tindog-gold-deep: ${({ theme }) => theme.color.primaryDark};
`;

// Velo que baja el contraste del fondo para que el contenido siga legible.
const Veil = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    ${({ theme }) => theme.color.background}B3 0%,
    ${({ theme }) => theme.color.background}66 40%,
    ${({ theme }) => theme.color.background}D9 100%
  );
`;

interface Drifter {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  hue: 'primary' | 'accent' | 'light';
  wobble: number;
  wobbleSpeed: number;
}

interface Paw {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  angle: number;
  spin: number;
  alpha: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  /** Rotación propia del nodo: gira sobre su eje mientras se desplaza. */
  angle: number;
  spin: number;
}

const AURORA_COUNT = 5;
/** Cada "paw" dibuja un par de huellas, como un paso. */
const PAW_COUNT = 21;
const PARTICLE_DENSITY = 0.00021;
const MAX_PARTICLES = 240;
const LINK_DISTANCE = 118;
/**
 * Vecinas a comparar por partícula al trazar enlaces (ver nota en draw).
 * Medido con la densidad actual: 36 conserva ~99.9% de los enlaces del
 * bucle completo a ~0.13ms por frame.
 */
const LINK_NEIGHBOURS = 36;
const CURSOR_RADIUS = 180;

/** Dibuja el contorno de una huella: almohadilla central y cuatro dedos. */
function strokeSinglePaw(ctx: CanvasRenderingContext2D, size: number) {
  const pad = size * 0.42;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.18, pad * 0.62, pad * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  const toes: Array<[number, number, number]> = [
    [-size * 0.34, -size * 0.18, size * 0.15],
    [-size * 0.13, -size * 0.34, size * 0.16],
    [size * 0.13, -size * 0.34, size * 0.16],
    [size * 0.34, -size * 0.18, size * 0.15],
  ];
  for (const [tx, ty, tr] of toes) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, tr * 0.85, tr, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/**
 * Dibuja un par de huellas, como el paso de un perro: una adelantada
 * respecto de la otra y ambas levemente abiertas hacia afuera.
 */
function strokePawPair(ctx: CanvasRenderingContext2D, size: number) {
  ctx.save();
  ctx.translate(-size * 0.36, size * 0.2);
  ctx.rotate(-0.18);
  strokeSinglePaw(ctx, size * 0.82);
  ctx.restore();

  ctx.save();
  ctx.translate(size * 0.36, -size * 0.24);
  ctx.rotate(0.18);
  strokeSinglePaw(ctx, size * 0.82);
  ctx.restore();
}

/**
 * Fondo vivo de toda la app, dibujado en un único canvas:
 *
 * - **Auroras doradas** que derivan libremente por toda la pantalla. Cada
 *   una lleva su propia velocidad y un término de "wobble" senoidal, así
 *   que sus trayectorias nunca se sincronizan ni repiten un bucle visible
 *   (a diferencia de una animación CSS, que siempre vuelve al mismo lugar).
 * - **Contornos de patitas** que rondan el fondo girando despacio.
 * - **Red de partículas** que reacciona al cursor.
 *
 * Todo en canvas: son ~90 elementos animándose, y como nodos del DOM
 * costarían muchísimo más que un solo bitmap redibujado por frame.
 */
export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  // Al cambiar de tema hay que releer los dorados y repintar.
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Colores tomados del theme activo (el canvas no hereda CSS).
    const styles = getComputedStyle(canvas);
    const gold = styles.getPropertyValue('--tindog-gold').trim() || '#E8C252';
    const goldLight = styles.getPropertyValue('--tindog-gold-light').trim() || '#FFF4C2';
    const goldDeep = styles.getPropertyValue('--tindog-gold-deep').trim() || '#B8860B';

    let width = 0;
    let height = 0;
    let auroras: Drifter[] = [];
    let paws: Paw[] = [];
    let particles: Particle[] = [];
    let frame = 0;
    let running = true;
    let time = 0;
    const pointer = { x: -9999, y: -9999 };

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    /** Velocidad con signo aleatorio, evitando valores casi nulos. */
    const drift = (min: number, max: number) => (Math.random() < 0.5 ? -1 : 1) * rand(min, max);

    const build = () => {
      auroras = Array.from({ length: AURORA_COUNT }, (_, i) => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: drift(0.09, 0.26),
        vy: drift(0.07, 0.2),
        // Con más manchas conviene achicarlas para que el fondo respire.
        radius: Math.max(width, height) * rand(0.24, 0.4),
        hue: (['primary', 'accent', 'light'] as const)[i % 3],
        wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.0016, 0.0042),
      }));

      paws = Array.from({ length: PAW_COUNT }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: drift(0.16, 0.42),
        vy: drift(0.12, 0.34),
        size: rand(26, 52),
        angle: rand(0, Math.PI * 2),
        spin: drift(0.0012, 0.0045),
        alpha: rand(0.16, 0.34),
      }));

      const target = Math.min(Math.round(width * height * PARTICLE_DENSITY), MAX_PARTICLES);
      particles = Array.from({ length: target }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: drift(0.05, 0.22),
        vy: drift(0.05, 0.22),
        r: rand(0.8, 2.4),
        angle: rand(0, Math.PI * 2),
        spin: drift(0.004, 0.016),
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    /** Reaparece por el lado opuesto al salir de pantalla. */
    const wrap = (value: number, limit: number, margin: number) => {
      if (value < -margin) return limit + margin;
      if (value > limit + margin) return -margin;
      return value;
    };

    /**
     * Rebota contra los bordes invirtiendo la velocidad, con una desviación
     * al azar en cada choque para que las trayectorias no se vuelvan un
     * ciclo predecible. Devuelve la nueva velocidad; la posición se corrige
     * dentro del área para que no quede trabada fuera del borde.
     */
    interface Bouncer { x: number; y: number; vx: number; vy: number; }
    const bounce = (b: Bouncer, margin: number) => {
      const jitter = () => (Math.random() - 0.5) * 0.35;
      if (b.x < margin) { b.x = margin; b.vx = Math.abs(b.vx) + jitter(); b.vy += jitter(); }
      else if (b.x > width - margin) { b.x = width - margin; b.vx = -Math.abs(b.vx) + jitter(); b.vy += jitter(); }
      if (b.y < margin) { b.y = margin; b.vy = Math.abs(b.vy) + jitter(); b.vx += jitter(); }
      else if (b.y > height - margin) { b.y = height - margin; b.vy = -Math.abs(b.vy) + jitter(); b.vx += jitter(); }
      // El jitter acumulado puede acelerarlas sin límite o, al revés, dejar
      // una casi inmóvil si los signos se cancelan. Se acota por arriba y
      // por abajo para que todas sigan viajando.
      const speed = Math.hypot(b.vx, b.vy);
      const MAX = 1.5;
      const MIN = 0.08;
      if (speed > MAX) { b.vx = (b.vx / speed) * MAX; b.vy = (b.vy / speed) * MAX; }
      else if (speed < MIN) {
        const a = Math.random() * Math.PI * 2;
        b.vx = Math.cos(a) * MIN; b.vy = Math.sin(a) * MIN;
      }
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
      time += 1;

      // ── Auroras ────────────────────────────────────────────────────────
      for (const a of auroras) {
        if (!reduceMotion) {
          a.wobble += a.wobbleSpeed;
          // El wobble desvía la trayectoria recta, de modo que el recorrido
          // no se repite de forma perceptible.
          a.x += a.vx + Math.cos(a.wobble) * 0.34;
          a.y += a.vy + Math.sin(a.wobble * 0.8) * 0.28;
          a.x = wrap(a.x, width, a.radius);
          a.y = wrap(a.y, height, a.radius);
        }

        const color = a.hue === 'primary' ? gold : a.hue === 'accent' ? goldDeep : goldLight;
        const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.radius);
        gradient.addColorStop(0, `${color}55`);
        gradient.addColorStop(0.55, `${color}1A`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Patitas ────────────────────────────────────────────────────────
      ctx.lineWidth = 1.6;
      for (const p of paws) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.spin;
          bounce(p, p.size);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        // Respiración suave del brillo, desfasada por posición.
        const pulse = reduceMotion ? 0 : Math.sin(time * 0.012 + p.x * 0.01) * 0.06;
        ctx.strokeStyle = gold;
        ctx.globalAlpha = Math.max(0.08, p.alpha + pulse);
        strokePawPair(ctx, p.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // ── Partículas y sus enlaces ───────────────────────────────────────
      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx;
          p.y += p.vy;

          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_RADIUS && dist > 0.001) {
            const push = (1 - dist / CURSOR_RADIUS) * 0.6;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }

          p.angle += p.spin;
          bounce(p, p.r + 2);
        }
      }

      // Los enlaces son O(n²) y con muchas partículas eso pesa. Ordenamos
      // por X y comparamos sólo contra las siguientes LINK_NEIGHBOURS: al
      // estar ordenadas, las candidatas dentro del umbral quedan casi todas
      // contiguas, así que se pierde una fracción mínima de líneas a cambio
      // de recortar el costo por frame.
      particles.sort((a, b) => a.x - b.x);
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        const limit = Math.min(particles.length, i + 1 + LINK_NEIGHBOURS);
        for (let j = i + 1; j < limit; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.strokeStyle = `${gold}${Math.round(0.16 * (1 - d / LINK_DISTANCE) * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Los nodos se dibujan como rombos y no como círculos: en un círculo
      // la rotación sobre el propio eje sería invisible.
      for (const p of particles) {
        const near = Math.hypot(p.x - pointer.x, p.y - pointer.y) < CURSOR_RADIUS;
        ctx.fillStyle = near ? `${goldLight}D9` : `${gold}80`;
        const d = p.r * 1.5;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.moveTo(0, -d);
        ctx.lineTo(d * 0.7, 0);
        ctx.lineTo(0, d);
        ctx.lineTo(-d * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Con reduce-motion basta un cuadro: nada se mueve, así que no
      // gastamos CPU en un bucle inmóvil.
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    resize();
    // Primer cuadro sincrónico: si esperáramos a requestAnimationFrame el
    // fondo quedaría transparente hasta el primer repintado, y en pestañas
    // que arrancan en segundo plano rAF puede no dispararse nunca.
    draw();
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
  }, [reduceMotion, theme]);

  return (
    <Root aria-hidden="true">
      <Canvas ref={canvasRef} />
      <Veil />
    </Root>
  );
}
