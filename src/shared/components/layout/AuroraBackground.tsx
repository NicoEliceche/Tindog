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
  // La silueta sigue a la del ícono `paw-outline` que usa la aplicación
  // nativa, para que el mismo motivo se vea igual en las dos plataformas:
  // almohadilla ancha y baja, y cuatro dedos alargados en arco, los dos
  // centrales más altos que los externos.
  ctx.beginPath();
  ctx.ellipse(0, size * 0.26, size * 0.33, size * 0.27, 0, 0, Math.PI * 2);
  ctx.stroke();

  // [x, y, radio, inclinación]
  const toes: Array<[number, number, number, number]> = [
    [-size * 0.38, -size * 0.1, size * 0.15, -0.35],
    [-size * 0.15, -size * 0.33, size * 0.155, -0.12],
    [size * 0.15, -size * 0.33, size * 0.155, 0.12],
    [size * 0.38, -size * 0.1, size * 0.15, 0.35],
  ];
  for (const [tx, ty, tr, tilt] of toes) {
    ctx.beginPath();
    ctx.ellipse(tx, ty, tr * 0.78, tr * 1.15, tilt, 0, Math.PI * 2);
    ctx.stroke();
  }
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
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  /**
   * `prefers-reduced-motion` pide movimiento contenido, no una pantalla
   * muerta: la preferencia existe para evitar el mareo del movimiento
   * amplio y brusco, no para prohibir toda animación. Antes se congelaba el
   * fondo por completo y quien tuviera la preferencia activada veía una
   * imagen fija. Ahora se mueve a un quinto de velocidad, sin pulsos ni
   * reacción al cursor.
   */
  const speedScale = reduceMotion ? 0.2 : 1;
  // Al cambiar de tema hay que releer los dorados y repintar.
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
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
    // Referencia de tiempo del cuadro anterior. El avance se calcula contra
    // el tiempo transcurrido y no por cuadro, asi la velocidad es la misma a
    // 60Hz que a 120Hz y no depende de cuanto tarde el navegador.
    let lastTime = 0;
    /** Cuadros por segundo de referencia: a 60Hz el paso es exactamente 1. */
    const BASE_FPS = 60;
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
        // El par ocupaba mas ancho que una huella sola: al pasar a una
        // sola se agranda para conservar el mismo peso visual.
        size: rand(34, 66),
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
      // Se mide el contenedor y no window.innerHeight: en el telefono, cuando
      // la barra del navegador se retrae, el contenedor -fijo con inset 0-
      // crece y innerHeight no, y quedaba una franja sin pintar abajo que se
      // veia a traves de la barra inferior, que es traslucida.
      const bounds = root.getBoundingClientRect();
      width = Math.round(bounds.width) || window.innerWidth;
      height = Math.round(bounds.height) || window.innerHeight;
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
      if (!running) return;
      // Cancelar antes de volver a pedir: sin esto, cada ida y vuelta a la
      // pestana dejaba un bucle mas corriendo sobre las mismas particulas y
      // el fondo se aceleraba sin parar.
      cancelAnimationFrame(frame);
      // El reloj arranca de nuevo para que el tiempo detenido no cuente como
      // un salto gigante en el primer cuadro.
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    };

    function draw(now = performance.now()) {
      if (!running || !ctx) return;

      // Paso normalizado: 1 a 60Hz, 0.5 a 120Hz. Se acota a 2 para que una
      // pausa larga -pestana en segundo plano, hilo bloqueado- no dispare
      // las particulas de golpe al volver.
      const elapsed = lastTime ? now - lastTime : 1000 / BASE_FPS;
      lastTime = now;
      const step = Math.min((elapsed * BASE_FPS) / 1000, 2);
      // Todo lo que se mueve multiplica por esto, asi que aplicar el paso
      // aca alcanza para que ningun desplazamiento dependa del cuadro.
      const advance = speedScale * step;

      ctx.clearRect(0, 0, width, height);
      time += step;

      // ── Auroras ────────────────────────────────────────────────────────
      for (const a of auroras) {
        a.wobble += a.wobbleSpeed * advance;
        // El wobble desvía la trayectoria recta, de modo que el recorrido
        // no se repite de forma perceptible.
        a.x += (a.vx + Math.cos(a.wobble) * 0.34) * advance;
        a.y += (a.vy + Math.sin(a.wobble * 0.8) * 0.28) * advance;
        a.x = wrap(a.x, width, a.radius);
        a.y = wrap(a.y, height, a.radius);

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
        p.x += p.vx * advance;
        p.y += p.vy * advance;
        p.angle += p.spin * advance;
        bounce(p, p.size);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        // Respiración suave del brillo, desfasada por posición.
        const pulse = reduceMotion ? 0 : Math.sin(time * 0.012 + p.x * 0.01) * 0.06;
        ctx.strokeStyle = gold;
        ctx.globalAlpha = Math.max(0.08, p.alpha + pulse);
        strokeSinglePaw(ctx, p.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // ── Partículas y sus enlaces ───────────────────────────────────────
      for (const p of particles) {
        p.x += p.vx * advance;
        p.y += p.vy * advance;

        // El empuje del cursor es un movimiento reactivo y brusco: se
        // omite bajo movimiento reducido.
        if (!reduceMotion) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_RADIUS && dist > 0.001) {
            const push = (1 - dist / CURSOR_RADIUS) * 0.6;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }
        }

        p.angle += p.spin * advance;
        bounce(p, p.r + 2);
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

      frame = requestAnimationFrame(draw);
    }

    resize();
    // Primer cuadro sincrónico: si esperáramos a requestAnimationFrame el
    // fondo quedaría transparente hasta el primer repintado, y en pestañas
    // que arrancan en segundo plano rAF puede no dispararse nunca.
    draw();
    window.addEventListener('resize', resize);
    // La barra del navegador al retraerse cambia el alto del contenedor sin
    // disparar resize de window: se observa el elemento.
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduceMotion, theme]);

  return (
    <Root ref={rootRef} aria-hidden="true">
      <Canvas ref={canvasRef} />
      <Veil />
    </Root>
  );
}
