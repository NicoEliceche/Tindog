// src/features/discovery/screens/DiscoveryScreenStyled.ts
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 80px);
  padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.layout.screenPaddingH};
  overflow-x: hidden;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-top: 100px;
    max-width: 1300px;
    margin: 0 auto;
    gap: 2rem;
  }
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[2]} 0;
  margin-bottom: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

export const SideInfo = styled.div<{ $align?: 'left' | 'right' }>`
  display: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 1.5rem;
    text-align: ${({ $align }) => $align || 'left'};
    align-items: ${({ $align }) => $align === 'right' ? 'flex-end' : 'flex-start'};
    max-width: 380px;
  }
`;

export const BigTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1.1;
  color: ${({ theme }) => theme.color.text};
  span { color: ${({ theme }) => theme.color.primary}; }
`;

export const CardContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
  min-height: 500px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 450px;
  }
`;

export const SwipeCard = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  max-width: 420px;
  height: 580px;
  background-color: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius['2xl']};
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  cursor: grab;
  border: 1px solid rgba(255, 255, 255, 0.8);
`;

export const CardImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

export const CardInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[6]};
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
  color: white;
  pointer-events: none;
`;

export const PetName = styled.h2`
  font-size: ${({ theme }) => theme.typography.size['3xl']};
  font-weight: 800;
`;

export const PetBreed = styled.p`
  font-size: ${({ theme }) => theme.typography.size.base};
  opacity: 0.9;
`;

export const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]};
  padding: ${({ theme }) => theme.spacing[6]} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    position: absolute;
    bottom: -100px;
    width: 100%;
  }
`;

export const CircleButton = styled(motion.button)<{ $type: 'like' | 'nope' | 'super' }>`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border: 1px solid ${({ theme }) => theme.color.border};
  color: ${({ theme, $type }) => 
    $type === 'like' ? theme.color.success : 
    $type === 'nope' ? theme.color.error : 
    theme.color.info};
`;
