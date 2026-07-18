'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1.5rem;
  border: 1px solid #eee;
  overflow-x: auto;
`;

const NodeRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Node = styled(motion.div)<{ gender: 'Macho' | 'Hembra' | 'unknown' }>`
  padding: 0.8rem;
  border-radius: 1rem;
  min-width: 120px;
  text-align: center;
  font-size: 0.9rem;
  background: ${({ gender }) => 
    gender === 'Macho' ? '#E3F2FD' : 
    gender === 'Hembra' ? '#FCE4EC' : '#F5F5F5'};
  border: 2px solid ${({ gender }) => 
    gender === 'Macho' ? '#2196F3' : 
    gender === 'Hembra' ? '#F06292' : '#E0E0E0'};
  color: #333;
  font-weight: 600;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`;

const Label = styled.span`
  display: block;
  font-size: 0.7rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.2rem;
`;

interface FamilyNode {
  name: string;
  gender: 'Macho' | 'Hembra' | 'unknown';
}

interface FamilyTreeProps {
  father?: FamilyNode;
  mother?: FamilyNode;
  paternalGrandfather?: FamilyNode;
  paternalGrandmother?: FamilyNode;
  maternalGrandfather?: FamilyNode;
  maternalGrandmother?: FamilyNode;
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({
  father,
  mother,
  paternalGrandfather,
  paternalGrandmother,
  maternalGrandfather,
  maternalGrandmother
}) => {
  return (
    <TreeContainer>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, textAlign: 'center' }}>Árbol Genealógico</h3>
      
      {/* Abuelos */}
      <NodeRow>
        <Node gender="Macho" whileHover={{ scale: 1.05 }}>
          <Label>Abuelo Pat.</Label>
          {paternalGrandfather?.name || 'Desconocido'}
        </Node>
        <Node gender="Hembra" whileHover={{ scale: 1.05 }}>
          <Label>Abuela Pat.</Label>
          {paternalGrandmother?.name || 'Desconocida'}
        </Node>
        <div style={{ width: '20px' }} />
        <Node gender="Macho" whileHover={{ scale: 1.05 }}>
          <Label>Abuelo Mat.</Label>
          {maternalGrandfather?.name || 'Desconocido'}
        </Node>
        <Node gender="Hembra" whileHover={{ scale: 1.05 }}>
          <Label>Abuela Mat.</Label>
          {maternalGrandmother?.name || 'Desconocida'}
        </Node>
      </NodeRow>

      {/* Padres */}
      <NodeRow>
        <Node gender="Macho" style={{ width: '260px' }} whileHover={{ scale: 1.02 }}>
          <Label>Padre</Label>
          {father?.name || 'Desconocido'}
        </Node>
        <Node gender="Hembra" style={{ width: '260px' }} whileHover={{ scale: 1.02 }}>
          <Label>Madre</Label>
          {mother?.name || 'Desconocida'}
        </Node>
      </NodeRow>

      {/* La Mascota en el medio */}
      <NodeRow>
        <Node gender="unknown" style={{ width: '100%', maxWidth: '300px', background: '#FF6B6B', borderColor: '#FF6B6B', color: 'white' }}>
          <Label style={{ color: 'rgba(255,255,255,0.8)' }}>Mascota Actual</Label>
          Seleccionada
        </Node>
      </NodeRow>
    </TreeContainer>
  );
};
