// src/features/pets/screens/PetFormScreenStyled.ts
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const FormWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[8]};
  max-width: 500px;
  margin: 0 auto;
  color: ${({ theme }) => theme.color.text};
  padding-bottom: 40px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: ${({ theme }) => theme.layout.shellMaxWidth};
    padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.layout.contentGutter};
    padding-bottom: 60px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text};
`;

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[8]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.layout.sidebarWidth} 1fr;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[10]};
  }
`;

export const SectionNav = styled.nav`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: sticky;
    top: ${({ theme }) => theme.spacing[8]};
  }
`;

export const SectionNavLink = styled.a<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.textSecondary)};
  background: ${({ theme, $active }) => ($active ? theme.color.primaryFaded : 'transparent')};
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;

export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

export const PhotoUpload = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radius['2xl']};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 2px dashed ${({ theme }) => theme.color.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.primary};
  margin: 0 auto;
  cursor: pointer;
  gap: 4px;
  font-size: 12px;
  font-weight: bold;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: 0;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  scroll-margin-top: ${({ theme }) => theme.spacing[8]};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.textSecondary};
  text-transform: uppercase;
  margin-left: 4px;
`;

export const InlineLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;

  ${Label} {
    margin: 0;
  }
`;

export const HelperText = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.color.textTertiary};
  margin-top: 4px;
`;

export const Input = styled.input`
  height: 56px;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  border: 2px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.base};
  transition: all 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.color.primaryFaded};
  }
`;

export const TextArea = styled(Input).attrs({ as: 'textarea' })`
  height: 100px;
  padding-top: 12px;
  resize: vertical;
`;

export const SmallInput = styled(Input)`
  height: 40px;
  flex: 1;
`;

export const DateSmallInput = styled(SmallInput)`
  width: 130px;
  flex: none;
`;

export const YearInput = styled(SmallInput)`
  width: 80px;
  flex: none;
`;

export const CoiInput = styled(SmallInput)`
  width: 80px;
  flex: none;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const LineageGrid = styled(FieldGrid)`
  margin-top: 0.5rem;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RevealGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.color.border};
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
`;

export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const CheckboxRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const CheckboxItem = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 2px solid ${({ $active, theme }) => ($active ? theme.color.primary : theme.color.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.color.primaryFaded : theme.color.surface)};
  transition: all 0.2s;
`;

export const CompetitionCard = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.color.surface};
`;

export const HealthCard = styled(CompetitionCard)`
  border-left: 4px solid #4CAF50;
`;

export const CardTopInput = styled(SmallInput)`
  margin-bottom: 8px;
  width: 100%;
`;

export const AddButton = styled.button`
  color: ${({ theme }) => theme.color.primary};
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

export const SectionBody = styled.div`
  margin-top: 0.5rem;
`;

export const SubmitButton = styled(motion.button)`
  background: ${({ theme }) => theme.color.primary};
  color: ${({ theme }) => theme.color.textInverse};
  min-height: 56px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  font-size: ${({ theme }) => theme.typography.size.lg};
  box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;
