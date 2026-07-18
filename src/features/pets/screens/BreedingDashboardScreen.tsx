'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Info, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FamilyTree } from '../components/FamilyTree';
import { CompatibilityFinder } from '../components/CompatibilityFinder';
import { BreederBadge } from '../components/BreederBadge';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 100px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PetHero = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
`;

const Avatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 1.5rem;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.color.primaryFaded};
`;

const PetInfo = styled.div`
  flex: 1;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const StatCard = styled.div<{ variant?: 'primary' | 'secondary' }>`
  background: ${({ variant, theme }) => variant === 'primary' ? theme.color.primaryFaded : 'white'};
  padding: 1.2rem;
  border-radius: 1.5rem;
  border: 1px solid ${({ variant, theme }) => variant === 'primary' ? theme.color.primary : '#eee'};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 900;
  color: ${({ theme }) => theme.color.textPrimary};
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.textSecondary};
  text-transform: uppercase;
  margin-top: 4px;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  height: 56px;
  background: ${({ theme }) => theme.color.primary};
  color: white;
  border-radius: 1.5rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.2);
`;

export function BreedingDashboardScreen({ petId }: { petId: string }) {
  const router = useRouter();

  // Mock data for the dashboard
  const pet = {
    name: 'Firulais',
    breed: 'Golden Retriever',
    gender: 'Macho',
    coi: 4.2,
    isVerified: true,
    lastHeat: '2024-05-15',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=500',
    lineage: {
      father: { name: 'Maximus', gender: 'Macho' as const },
      mother: { name: 'Goldie', gender: 'Hembra' as const },
      p_grandpa: { name: 'Thor', gender: 'Macho' as const },
      p_grandma: { name: 'Luna', gender: 'Hembra' as const },
      m_grandpa: { name: 'Rex', gender: 'Macho' as const },
      m_grandma: { name: 'Daisy', gender: 'Hembra' as const },
    }
  };

  return (
    <Container>
      <Header>
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dashboard de Cría</h1>
        <button>
          <Share2 size={24} />
        </button>
      </Header>

      <PetHero>
        <Avatar src={pet.image} alt={pet.name} />
        <PetInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{pet.name}</h2>
            {pet.isVerified && <BreederBadge />}
          </div>
          <p style={{ color: '#666', margin: '4px 0' }}>{pet.breed} • {pet.gender}</p>
        </PetInfo>
      </PetHero>

      <StatGrid>
        <StatCard variant="primary">
          <StatValue>{pet.coi}%</StatValue>
          <StatLabel>Consanguinidad (COI)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>EXCELENTE</StatValue>
          <StatLabel>Estado Genético</StatLabel>
        </StatCard>
      </StatGrid>

      {pet.gender === 'Hembra' && (
        <StatCard style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#FFF3E0', padding: '12px', borderRadius: '12px' }}>
            <Calendar color="#FF9800" size={24} />
          </div>
          <div>
            <StatLabel>Último Celo Registrado</StatLabel>
            <StatValue style={{ fontSize: '1.1rem' }}>15 de Mayo, 2024</StatValue>
          </div>
        </StatCard>
      )}

      <SectionTitle>
        <Info size={20} color="#FF6B6B" /> Linaje Verificado
      </SectionTitle>
      
      <FamilyTree 
        father={pet.lineage.father}
        mother={pet.lineage.mother}
        paternalGrandfather={pet.lineage.p_grandpa}
        paternalGrandmother={pet.lineage.p_grandma}
        maternalGrandfather={pet.lineage.m_grandpa}
        maternalGrandmother={pet.lineage.m_grandma}
      />

      <SectionTitle>
        <Heart size={20} color="#FF6B6B" /> Recomendaciones Tindog
      </SectionTitle>
      
      <CompatibilityFinder />

      <div style={{ marginTop: '1rem' }}>
        <ActionButton whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <ShieldCheck size={20} /> Generar Reporte de Cría PDF
        </ActionButton>
        <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', marginTop: '12px' }}>
          Tindog recomienda siempre realizar pruebas de salud presenciales antes de cualquier cruza.
        </p>
      </div>
    </Container>
  );
}
