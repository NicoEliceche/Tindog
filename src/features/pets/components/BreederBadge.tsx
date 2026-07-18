'use client';

import React from 'react';
import styled from 'styled-components';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const BadgeContainer = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #E8F5E9;
  border: 1px solid #4CAF50;
  border-radius: 20px;
  color: #2E7D32;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: help;
`;

export const BreederBadge: React.FC = () => {
  return (
    <BadgeContainer
      whileHover={{ scale: 1.05 }}
      title="Este criador ha sido verificado por Tindog tras validar sus licencias y estándares de salud."
    >
      <ShieldCheck size={16} />
      CRIADOR VERIFICADO
    </BadgeContainer>
  );
};
