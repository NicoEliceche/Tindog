// src/features/discovery/components/SwipeCardStyled.ts
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

const shineSweep = keyframes`
  0%   { transform: translateX(-120%) skewX(-18deg); }
  55%  { transform: translateX(220%)  skewX(-18deg); }
  100% { transform: translateX(220%)  skewX(-18deg); }
`;

export const Card = styled(motion.article)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow:
    ${({ theme }) => theme.elevation.lg},
    ${({ theme }) => theme.glow.soft},
    ${({ theme }) => theme.glow.inset};
  cursor: grab;
  touch-action: pan-y;
  will-change: transform;
  transform-style: preserve-3d;
  perspective: 1000px;

  &:active { cursor: grabbing; }
`;

/** Barrido de luz continuo sobre la superficie: la hace ver "pulida". */
export const CardShine = styled.div`
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -20%;
    left: 0;
    width: 42%;
    height: 140%;
    background: ${({ theme }) => theme.color.metalSheen};
    animation: ${shineSweep} 6s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after { animation: none; opacity: 0; }
  }
`;

/** Glare que se desplaza con el arrastre, como reflejo sobre metal. */
export const CardGlare = styled(motion.div)`
  position: absolute;
  top: -30%;
  left: 0;
  width: 55%;
  height: 160%;
  z-index: 5;
  pointer-events: none;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(255, 244, 194, 0.35) 45%,
    rgba(255, 255, 255, 0.55) 50%,
    rgba(255, 244, 194, 0.35) 55%,
    transparent 100%
  );
  filter: blur(6px);
`;

const Label = styled(motion.div)`
  position: absolute;
  top: 26px;
  z-index: 20;
  padding: 9px 20px;
  border-radius: 14px;
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  backdrop-filter: blur(6px);
  pointer-events: none;
`;

export const LabelConnect = styled(Label)`
  left: 22px;
  transform: rotate(-14deg);
  color: ${({ theme }) => theme.color.success};
  border: 3px solid ${({ theme }) => theme.color.success};
  background: ${({ theme }) => theme.color.successLight};
  box-shadow: 0 0 22px ${({ theme }) => theme.color.success}66;
`;

export const LabelPass = styled(Label)`
  right: 22px;
  transform: rotate(14deg);
  color: ${({ theme }) => theme.color.error};
  border: 3px solid ${({ theme }) => theme.color.error};
  background: ${({ theme }) => theme.color.errorLight};
  box-shadow: 0 0 22px ${({ theme }) => theme.color.error}66;
`;

export const PetImage = styled.img`
  width: 100%;
  height: 67%;
  object-fit: cover;
  background: ${({ theme }) => theme.color.neutral[800]};
  user-select: none;
  -webkit-user-drag: none;
`;

export const PetBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: 14px 18px;
  position: relative;
  z-index: 4;

  .title-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  h2 {
    background: ${({ theme }) => theme.color.metalGold};
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: 1.85rem;
    font-weight: 900;
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: 1.2rem;
  }

  .meta {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  p {
    margin-top: 7px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.88rem;
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    p { -webkit-line-clamp: 4; }
  }
`;

export const SparkBurst = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 30;
  pointer-events: none;
`;

export const Spark = styled(motion.span)`
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.primaryLight};
  box-shadow: 0 0 14px ${({ theme }) => theme.color.primary};
`;
