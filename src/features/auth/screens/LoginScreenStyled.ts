// src/features/auth/screens/LoginScreenStyled.ts
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  width: 100%; /* Cambiado de 100vw para evitar scroll horizontal */
  padding: ${({ theme }) => theme.layout.screenPaddingH};
  position: relative;
  overflow: hidden;

  background: radial-gradient(circle at top right, rgba(255, 107, 107, 0.15), transparent),
              radial-gradient(circle at bottom left, rgba(78, 205, 196, 0.15), transparent),
              #FDFDFD;
`;

export const LoginCard = styled(motion.div)`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.color.glass};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${({ theme }) => theme.color.glassBorder};
  border-radius: ${({ theme }) => theme.radius['2xl']};
  padding: ${({ theme }) => theme.spacing[10]};
  box-shadow: 0 20px 40px ${({ theme }) => theme.color.glassShadow};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[8]};
  z-index: 10;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.size['3xl']};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.text};
  letter-spacing: -0.5px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.textSecondary};
  text-transform: uppercase;
  margin-left: ${({ theme }) => theme.spacing[2]};
`;

export const Input = styled.input`
  height: 56px;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0 ${({ theme }) => theme.spacing[5]};
  font-size: ${({ theme }) => theme.typography.size.base};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
    background: white;
    box-shadow: 0 0 0 4px ${({ theme }) => theme.color.primaryFaded};
  }
`;

export const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, ${({ theme }) => theme.color.primary} 0%, ${({ theme }) => theme.color.primaryDark} 100%);
  color: white;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  font-size: ${({ theme }) => theme.typography.size.lg};
  margin-top: ${({ theme }) => theme.spacing[4]};
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.3);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const GoogleButtonWrapper = styled.div`
  width: 100%;
  min-height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  text-transform: uppercase;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.color.border};
  }
`;

export const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.color.error};
  background: ${({ theme }) => theme.color.errorLight};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  text-align: center;
`;

export const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const PawIcon = styled.div`
  font-size: 3rem;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 107, 0.3));
  animation: bounce 2s infinite ease-in-out;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;
