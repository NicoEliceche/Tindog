// src/features/marketing/screens/LandingScreenStyled.ts
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

// ── Loading (sin sesión aún resolviendo) ──────────────────────────────────
export const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  width: 100%;
`;

export const LoadingMessage = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: 600;
`;

// ── Page ───────────────────────────────────────────────────────────────────
export const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

// ── Hero (mobile: centrado / desktop lg+: 2 columnas) ─────────────────────
export const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 80px);
  width: 100%;
  padding: ${({ theme }) => theme.layout.screenPaddingH};
  text-align: center;
  gap: ${({ theme }) => theme.spacing[8]};
  position: relative;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    min-height: 100dvh;
    padding: 0;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    text-align: left;
    gap: ${({ theme }) => theme.spacing[16]};
    max-width: ${({ theme }) => theme.layout.landingMaxWidth};
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.layout.contentGutter};
  }
`;

export const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[8]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    align-items: flex-start;
  }
`;

export const LogoWrapper = styled(motion.div)`
  width: 220px;
  height: 220px;
  z-index: 10;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.full};
  filter: drop-shadow(0 10px 20px rgba(212, 175, 55, 0.18));

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 120px;
    height: 120px;
  }
`;

export const LogoImage = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radius.full};
`;

export const ContentBox = styled(motion.div)`
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const Eyebrow = styled.span`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme }) => theme.color.primary};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.extrabold};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

export const Title = styled.h1`
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: 900;
  color: ${({ theme }) => theme.color.text};
  line-height: 1.1;
  letter-spacing: -1px;

  span {
    color: ${({ theme }) => theme.color.primary};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: clamp(3rem, 4.5vw, 4.5rem);
  }
`;

export const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.size.lg};
  color: ${({ theme }) => theme.color.textSecondary};
  max-width: 380px;
  margin: 0 auto;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: 0;
    max-width: 440px;
  }
`;

export const CtaRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex-direction: row;
    align-items: center;
  }
`;

const buttonPulse = keyframes`
  0%, 100% { box-shadow: 0 15px 30px rgba(212, 175, 55, 0.22), 0 0 0 0 rgba(212, 175, 55, 0.3); }
  50%      { box-shadow: 0 15px 30px rgba(212, 175, 55, 0.22), 0 0 0 8px rgba(212, 175, 55, 0); }
`;

export const Button = styled(motion.button)`
  background: linear-gradient(135deg, ${({ theme }) => theme.color.primary} 0%, ${({ theme }) => theme.color.primaryDark} 100%);
  color: ${({ theme }) => theme.color.textInverse};
  padding: ${({ theme }) => theme.spacing[5]} ${({ theme }) => theme.spacing[16]};
  border-radius: ${({ theme }) => theme.radius.full};
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  z-index: 10;
  white-space: nowrap;
  animation: ${buttonPulse} 2.8s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    box-shadow: 0 15px 30px rgba(212, 175, 55, 0.22);
  }
`;

export const TrustNote = styled.span`
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

// ── Hero mockup (solo lg+) ───────────────────────────────────────────────
export const HeroMockup = styled(motion.div)`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    justify-content: center;
    position: relative;
  }
`;

export const MockupFrame = styled.div`
  width: min(100%, 320px);
  aspect-ratio: 9 / 18;
  border-radius: ${({ theme }) => theme.radius['2xl']};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow: ${({ theme }) => theme.elevation.glow};
  position: relative;
`;

export const MockupImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const MockupGlow = styled.div`
  position: absolute;
  inset: -20%;
  z-index: -1;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, transparent 65%);
  filter: blur(30px);
`;

// ── Secciones desktop-only ("Cómo funciona", propuesta de valor) ─────────
export const Section = styled.section`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: block;
    width: 100%;
    max-width: ${({ theme }) => theme.layout.landingMaxWidth};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing[16]} ${({ theme }) => theme.layout.contentGutter};
  }
`;

export const SectionHeading = styled.h2`
  font-size: ${({ theme }) => theme.typography.size['3xl']};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.text};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

export const SectionSubheading = styled.p`
  font-size: ${({ theme }) => theme.typography.size.lg};
  color: ${({ theme }) => theme.color.textSecondary};
  text-align: center;
  max-width: 40rem;
  margin: 0 auto ${({ theme }) => theme.spacing[12]};
`;

export const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[8]};
`;

export const StepCardIcon = styled.div`
  width: 3.5rem;
  height: 3.5rem;
  border-radius: ${({ theme }) => theme.radius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.color.primaryFaded};
  color: ${({ theme }) => theme.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

export const StepNumber = styled.span`
  display: block;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.size['2xl']};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.border};
  margin-bottom: -${({ theme }) => theme.spacing[2]};
`;

export const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.xl};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const StepDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.size.base};
  color: ${({ theme }) => theme.color.textSecondary};
  line-height: 1.5;
`;

export const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const ValueIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.color.primaryFaded};
  color: ${({ theme }) => theme.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

export const ValueTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.text};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const ValueDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.color.textSecondary};
  line-height: 1.5;
`;

// ── Footer ─────────────────────────────────────────────────────────────────
export const Footer = styled.footer`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: ${({ theme }) => theme.layout.landingMaxWidth};
    margin: 0 auto;
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.contentGutter} ${({ theme }) => theme.spacing[10]};
    border-top: 1px solid ${({ theme }) => theme.color.border};
  }
`;

export const FooterBrand = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.text};

  img {
    width: 1.75rem;
    height: 1.75rem;
  }
`;

export const FooterNote = styled.span`
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;
