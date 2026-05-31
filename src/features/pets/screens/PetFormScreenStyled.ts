// src/features/pets/screens/PetFormScreenStyled.ts
import styled from 'styled-components';

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const Input = styled.input`
  height: ${({ theme }) => theme.layout.inputHeight};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
  }
`;

export const TextArea = styled.textarea`
  min-height: 100px;
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.base};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
  }
`;

export const SubmitButton = styled.button`
  background: ${({ theme }) => theme.color.primary};
  color: white;
  height: ${({ theme }) => theme.layout.buttonHeight};
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;
