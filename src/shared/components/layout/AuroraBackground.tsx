// src/shared/components/layout/AuroraBackground.tsx
'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import styled, { useTheme } from 'styled-components';
import { getPawPath } from './pawGlyph';

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
  /* En claro los dibujos usan un dorado mas oscuro: el de acentos sobre el
     marfil del fondo da 2.3 de contraste y practicamente no se ve. Medido:
     con estos tonos sube a 5.1 y 6.4. */
  --tindog-gold: ${({ theme }) => theme.color.canvasInk};
  --tindog-gold-light: ${({ theme }) => theme.color.canvasInkLight};
  --tindog-gold-deep: ${({ theme }) => theme.color.canvasInkDeep};
`;

// Velo que baja el contraste del fondo para que el contenido siga legible.
/**
 * Velo que baja el contraste del fondo para que el contenido se lea.
 *
 * En claro va mucho mas suave: con las mismas opacidades que en oscuro
 * tapaba los dibujos con hasta un 85% de marfil y desaparecian, que era
 * justo lo que se veia mal. El texto igual se apoya en las tarjetas, que
 * tienen su propio fondo.
 */
const Veil = styled.div<{ $light: boolean }>`
  position: absolute;
  inset: 0;
  background: ${({ theme, $light }) => ($light
    ? `linear-gradient(
        to bottom,
        ${theme.color.background}40 0%,
        ${theme.color.background}1A 40%,
        ${theme.color.background}59 100%
      )`
    : `linear-gradient(
        to bottom,
        ${theme.color.background}B3 0%,
        ${theme.color.background}66 40%,
        ${theme.color.background}D9 100%
      )`)};
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

/**
 * Cuantos elementos lleva el fondo.
 *
 * El fondo se pinta entero en cada cuadro y era el trabajo mas pesado de la
 * pagina. Las cantidades bajaron a la mitad: el motivo se sigue leyendo -las
 * huellas, la red de puntos, el halo dorado- pero mas espaciado, y el costo
 * de pintado cae en la misma proporcion.
 */
const AURORA_COUNT = 3;

const PAW_COUNT = 10;
const PARTICLE_DENSITY = 0.000105;
const MAX_PARTICLES = 120;
const LINK_DISTANCE = 118;
/**
 * Vecinas a comparar por partícula al trazar enlaces (ver nota en draw).
 * Con la densidad de arriba, la simulación da 20 como la mayor distancia de
 * índice que llega a producir un enlace real; 22 deja margen y no pierde
 * ninguna línea. Bajó junto con la densidad: mantenerlo en 36 habría seguido
 * comparando contra vecinas que ya nunca alcanzan.
 */
const LINK_NEIGHBOURS = 22;
const CURSOR_RADIUS = 180;

/**
 * Dibuja un par de huellas, como el paso de un perro. Replica la
 * disposicion de la aplicacion nativa: una adelantada respecto de la otra y
 * ambas inclinadas hacia afuera unos diez grados.
 */
function strokePawPair(ctx: CanvasRenderingContext2D, size: number) {
  const path = getPawPath();
  const print = size * 0.62;

  // El trazado viene en una caja de 1x1, asi que escalar por `print` lo lleva
  // al tamano pedido. El grosor se compensa con la misma escala para que la
  // linea no engorde junto con la huella.
  const stroke = (dx: number, dy: number, rotation: number) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(rotation);
    ctx.scale(print, print);
    ctx.lineWidth = 1.6 / print;
    ctx.stroke(path);
    ctx.restore();
  };

  stroke(-size * 0.36, size * 0.21, -0.175);
  stroke(size * 0.36, -size * 0.21, 0.175);
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

  /**
   * Modo claro, deducido del brillo del fondo del tema: el theme de la web
   * no trae una bandera propia.
   */
  const isLightTheme = useMemo(() => {
    const bg = theme.color.background;
    const rgb = bg.startsWith('#')
      ? [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16))
      : (bg.match(/\d+/g) ?? ['0', '0', '0']).map(Number);
    return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 140;
  }, [theme.color.background]);

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

    /**
     * Las lineas que unen los puntos son finas y muy tenues: sobre el fondo
     * oscuro se leen, pero sobre el claro desaparecen. En claro van mas
     * gruesas y con mas cuerpo.
     */
    const isLight = isLightTheme;

    /**
     * Tope de cuadros por segundo.
     *
     * El fondo es decorativo y a 30 se ve igual de fluido, pero libera la
     * mitad del tiempo de pintado para lo que importa: en la medicion, el
     * lienzo se llevaba diez segundos de hilo principal y era lo que hundia
     * la puntuacion de rendimiento en telefono.
     */
    const FRAME_BUDGET_MS = 1000 / 30;
    let lastPaint = 0;

    const linkWidth = isLight ? 2 : 1;
    const linkAlpha = isLight ? 0.34 : 0.16;

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
        vx: drift(0.18, 0.52),
        vy: drift(0.14, 0.4),
        // Con más manchas conviene achicarlas para que el fondo respire.
        radius: Math.max(width, height) * rand(0.24, 0.4),
        hue: (['primary', 'accent', 'light'] as const)[i % 3],
        wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.0016, 0.0042),
      }));

      paws = Array.from({ length: PAW_COUNT }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: drift(0.64, 1.68),
        vy: drift(0.48, 1.36),
        // El triple en escritorio y el doble en el telefono. La huella es
        // sutil de fondo y a este tamano se lee como motivo de marca; el
        // corte va en el mismo ancho que usa el resto de la aplicacion
        // para pasar a escritorio.
        size: rand(30, 58) * (width >= 1024 ? 3 : 2),
        angle: rand(0, Math.PI * 2),
        spin: drift(0.0048, 0.018),
        alpha: rand(0.16, 0.34),
      }));

      const target = Math.min(Math.round(width * height * PARTICLE_DENSITY), MAX_PARTICLES);
      particles = Array.from({ length: target }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        vx: drift(0.2, 0.88),
        vy: drift(0.2, 0.88),
        // Al doble: a este tamano la red de puntos se lee como motivo y no
        // como ruido de fondo.
        r: rand(1.6, 4.8),
        angle: rand(0, Math.PI * 2),
        spin: drift(0.016, 0.064),
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
      // El tope acompana a las velocidades iniciales: si se queda corto, los
      // rebotes van frenando las particulas hasta el ritmo anterior.
      const MAX = 6;
      const MIN = 0.32;
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

    /**
     * Sello de una aurora, pintado una sola vez.
     *
     * El degradado depende del radio y del color, no de la posicion, asi que
     * alcanza con pintarlo una vez y despues copiarlo en cada cuadro.
     */
    const stamps = new Map<string, HTMLCanvasElement>();

    function stampFor(a: Drifter): HTMLCanvasElement | null {
      const color = a.hue === 'primary' ? gold : a.hue === 'accent' ? goldDeep : goldLight;
      const key = `${color}-${Math.round(a.radius)}`;
      const cached = stamps.get(key);
      if (cached) return cached;

      const size = Math.max(2, Math.ceil(a.radius * 2));
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const octx = off.getContext('2d');
      if (!octx) return null;

      const gradient = octx.createRadialGradient(a.radius, a.radius, 0, a.radius, a.radius, a.radius);
      gradient.addColorStop(0, `${color}55`);
      gradient.addColorStop(0.55, `${color}1A`);
      gradient.addColorStop(1, `${color}00`);
      octx.fillStyle = gradient;
      octx.beginPath();
      octx.arc(a.radius, a.radius, a.radius, 0, Math.PI * 2);
      octx.fill();

      stamps.set(key, off);
      return off;
    }

    function draw(now = performance.now()) {
      if (!running || !ctx) return;

      // Se salta el cuadro si todavia no paso el presupuesto, pero se sigue
      // pidiendo el siguiente: asi el ritmo lo marca el reloj y no el
      // refresco de la pantalla.
      if (now - lastPaint < FRAME_BUDGET_MS) {
        frame = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;

      // Paso normalizado: 1 a 60Hz, 0.5 a 120Hz. Se acota a 2 para que una
      // pausa larga -pestana en segundo plano, hilo bloqueado- no dispare
      // las particulas de golpe al volver.
      const elapsed = lastTime ? now - lastTime : 1000 / BASE_FPS;
      lastTime = now;
      // El tope es 4 y no 2: con el limite de 30 cuadros el paso normal ya
      // vale 2, y cualquier demora extra quedaba recortada, frenando el
      // fondo en vez de compensar.
      const step = Math.min((elapsed * BASE_FPS) / 1000, 4);
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

        // Se copia el sello ya pintado en vez de rehacer el degradado.
        // Recrearlo por cuadro obligaba a calcular cinco degradados
        // radiales de pantalla completa sesenta veces por segundo, y era
        // de lejos lo mas caro del fondo.
        const stamp = stampFor(a);
        if (stamp) ctx.drawImage(stamp, a.x - a.radius, a.y - a.radius);
      }

      // ── Patitas ────────────────────────────────────────────────────────
      // El grosor lo fija cada huella, que trabaja en su propia escala.
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
        strokePawPair(ctx, p.size);
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
      ctx.lineWidth = linkWidth;
      for (let i = 0; i < particles.length; i += 1) {
        const limit = Math.min(particles.length, i + 1 + LINK_NEIGHBOURS);
        for (let j = i + 1; j < limit; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DISTANCE) {
            ctx.strokeStyle = `${gold}${Math.round(linkAlpha * (1 - d / LINK_DISTANCE) * 255).toString(16).padStart(2, '0')}`;
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
  }, [isLightTheme, reduceMotion, theme]);

  return (
    <Root ref={rootRef} aria-hidden="true">
      <Canvas ref={canvasRef} />
      <Veil $light={isLightTheme} />
    </Root>
  );
}
