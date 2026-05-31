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

const Paw = styled(motion.div)`
  position: absolute;
  opacity: 0.08;
  font-size: 2rem;
  user-select: none;
  color: ${({ theme }) => theme.color.primary};
`;

export function FloatingPawsBackground() {
  const paws = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      size: 1.5 + Math.random() * 2,
      duration: 20 + Math.random() * 30,
    }));
  }, []);

  return (
    <Container>
      {paws.map((paw) => (
        <Paw
          key={paw.id}
          initial={{ 
            left: `${paw.startX}%`, 
            top: `${paw.startY}%`,
            opacity: 0 
          }}
          animate={{
            x: [0, 100, -100, 50, 0],
            y: [0, -100, 100, -50, 0],
            rotate: [0, 180, 360],
            opacity: [0.03, 0.1, 0.03],
          }}
          transition={{
            duration: paw.duration,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ fontSize: `${paw.size}rem` }}
        >
          🐾
        </Paw>
      ))}
    </Container>
  );
}
