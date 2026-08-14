// src/core/theme/motion.ts
// Timings y easings compartidos para animaciones framer-motion.
// No se inyecta en el ThemeProvider de styled-components (no es CSS-interpolable
// como string): se importa directo donde se anima con framer-motion.
export const motion = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.45,
    page: 0.6,
  },
  easing: {
    standard:    [0.4, 0, 0.2, 1],
    decelerate:  [0, 0, 0.2, 1],
    accelerate:  [0.4, 0, 1, 1],
  },
  spring: {
    type: 'spring',
    stiffness: 260,
    damping: 24,
  },
} as const;
