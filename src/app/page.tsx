// src/app/page.tsx
'use client';

import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 80px); /* Ajuste para evitar scroll por padding */
  width: 100%;
  padding: ${({ theme }) => theme.layout.screenPaddingH};
  text-align: center;
  gap: ${({ theme }) => theme.spacing[8]};
  position: relative;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    min-height: 100dvh;
    padding: 0;
  }
`;

const LogoWrapper = styled(motion.div)`
  width: 220px;
  z-index: 10;
  filter: drop-shadow(0 10px 20px rgba(255, 107, 107, 0.2));
`;

const ContentBox = styled(motion.div)`
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 900;
  color: ${({ theme }) => theme.color.text};
  line-height: 1.1;
  letter-spacing: -1px;

  span {
    color: ${({ theme }) => theme.color.primary};
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.size.lg};
  color: ${({ theme }) => theme.color.textSecondary};
  max-width: 380px;
  margin: 0 auto;
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, ${({ theme }) => theme.color.primary} 0%, ${({ theme }) => theme.color.primaryDark} 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[16]};
  border-radius: ${({ theme }) => theme.radius.full};
  font-size: 1.2rem;
  font-weight: 800;
  box-shadow: 0 15px 30px rgba(255, 107, 107, 0.4);
  cursor: pointer;
  z-index: 10;
`;

export default function LandingPage() {
  const router = useRouter();

  return (
    <HeroSection>
      <LogoWrapper
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img src="/assets/tindog_logo.png" alt="Tindog Logo" style={{ width: '100%' }} />
      </LogoWrapper>

      <ContentBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <Title>Donde las <span>Patas</span> conectan.</Title>
        <Subtitle>La red social más guau para encontrar la cita perfecta de tu mejor amigo.</Subtitle>
      </ContentBox>

      <Button 
        onClick={() => router.push('/login')}
        whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(255, 107, 107, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Empezar Aventura
      </Button>
    </HeroSection>
  );
}
