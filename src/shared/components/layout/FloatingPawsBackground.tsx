// src/shared/components/layout/FloatingPawsBackground.tsx
'use client';

import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1; /* Por encima del background del body */
  overflow: hidden;
`;

const Paw = styled(motion.img)`
  position: absolute;
  opacity: 0.15;
  user-select: none;
  filter: saturate(0.5) contrast(0.8);
`;

export function FloatingPawsBackground() {
  const paws = useMemo(() => {
    // Aumentamos a 45 patitas (el triple de 15)
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      // Tamaño 100% más grande (de 1.5-3.5rem pasamos a 3-7rem aprox)
      size: 60 + Math.random() * 80, 
      duration: 30 + Math.random() * 60,
    }));
  }, []);

  return (
    <Container>
      {paws.map((paw) => (
        <Paw
          key={paw.id}
          src="/assets/patitas.png"
          initial={{ 
            left: `${paw.startX}%`, 
            top: `${paw.startY}%`,
            opacity: 0 
          }}
          animate={{
            x: [0, 150, -150, 70, 0],
            y: [0, -150, 150, -70, 0],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.05, 0.18, 0.05],
          }}
          transition={{
            duration: paw.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ width: `${paw.size}px`, height: 'auto' }}
        />
      ))}
    </Container>
  );
}
