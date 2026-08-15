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
    // `initial={false}`: framer-motion no escribe estilos de entrada durante
    // el SSR ni en el primer render del cliente, así el HTML servido y el
    // árbol hidratado coinciden exactamente.
    //
    // Sin `exit`: el layout ya no usa AnimatePresence, porque su `mode="wait"`
    // podía dejar la pantalla vacía si la animación de salida nunca avisaba
    // que había terminado. Un `exit` sin nadie que lo orqueste no se ejecuta
    // y sólo confundiría a quien lea esto.
    //
    // El contenido se monta con opacidad plena y la clave por ruta fuerza el
    // remonte: nada puede dejarlo invisible.
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: motionTokens.easing.decelerate }}
      style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
    >
      {children}
    </motion.div>
  );
}
