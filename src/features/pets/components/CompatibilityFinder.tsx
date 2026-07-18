'use client';

import React from 'react';
import styled from 'styled-components';
import { MapPin, Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Card = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 1.2rem;
  border: 1px solid #eee;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
`;

const PetImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 1rem;
  object-fit: cover;
`;

const Info = styled.div`
  flex: 1;
`;

const Name = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Distance = styled.span`
  font-size: 0.8rem;
  color: #888;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CompatibilityScore = styled.div<{ score: number }>`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ score }) => score > 80 ? '#4CAF50' : '#FF9800'};
  background: ${({ score }) => score > 80 ? '#E8F5E9' : '#FFF3E0'};
  padding: 4px 8px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 4px;
`;

interface CompatiblePet {
  id: string;
  name: string;
  breed: string;
  distance: string;
  score: number;
  image: string;
}

const MOCK_COMPATIBLE: CompatiblePet[] = [
  { id: '1', name: 'Luna', breed: 'Golden Retriever', distance: '1.2 km', score: 95, image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200' },
  { id: '2', name: 'Bella', breed: 'Golden Retriever', distance: '3.5 km', score: 82, image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=200' },
];

export const CompatibilityFinder: React.FC = () => {
  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Parejas Compatibles Cerca</h3>
        <Distance>
          <MapPin size={14} /> 5 km a la redonda
        </Distance>
      </div>

      {MOCK_COMPATIBLE.map((pet) => (
        <Card 
          key={pet.id}
          whileHover={{ x: 5 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PetImage src={pet.image} alt={pet.name} />
          <Info>
            <Name>
              {pet.name} <Heart size={14} fill="#FF6B6B" color="#FF6B6B" />
            </Name>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{pet.breed}</div>
            <CompatibilityScore score={pet.score}>
              <Activity size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              {pet.score}% Compatibilidad Genética
            </CompatibilityScore>
          </Info>
          <div style={{ textAlign: 'right' }}>
            <Distance>{pet.distance}</Distance>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              style={{ background: '#FF6B6B', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '10px', marginTop: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}
            >
              Contactar
            </motion.button>
          </div>
        </Card>
      ))}
    </Container>
  );
};
