// src/shared/components/ui/PageTransition.tsx
'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { motion as motionTokens } from '@core/theme/motion';

export interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : motionTokens.duration.page;

  return (
    // `initial={false}` hace que framer-motion no escriba estilos de entrada
    // durante el SSR ni en el primer render del cliente: así el HTML servido
    // y el árbol hidratado coinciden exactamente. Las transiciones entre
    // rutas (que ocurren después de hidratar) siguen animando vía `exit`
    // y el remonte con nueva `key`.
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ duration, ease: motionTokens.easing.decelerate }}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      {children}
    </motion.div>
  );
}
