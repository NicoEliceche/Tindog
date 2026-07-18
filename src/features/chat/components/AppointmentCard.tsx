'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Card = styled(motion.div)`
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.color.primary};
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.1);
  margin: 1rem 0;
  max-width: 85%;
  align-self: center;
`;

const Title = styled.h4`
  color: ${({ theme }) => theme.color.primary};
  font-weight: 900;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 8px;
`;

interface AppointmentCardProps {
  date: string;
  time: string;
  locationName: string;
  address: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ date, time, locationName, address }) => {
  return (
    <Card
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Title>
        <Calendar size={18} />
        CITA DE ENCUENTRO AGENDADA
      </Title>
      
      <InfoRow>
        <Calendar size={16} color="#888" />
        <span>{date}</span>
      </InfoRow>
      
      <InfoRow>
        <Clock size={16} color="#888" />
        <span>{time} hs</span>
      </InfoRow>
      
      <InfoRow>
        <MapPin size={16} color="#FF6B6B" />
        <div>
          <strong>{locationName}</strong>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>{address}</div>
        </div>
      </InfoRow>
      
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <button style={{ background: '#E8F5E9', color: '#2E7D32', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          Ver en Mapa
        </button>
      </div>
    </Card>
  );
};
