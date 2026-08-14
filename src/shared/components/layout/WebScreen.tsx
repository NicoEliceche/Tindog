import styled from 'styled-components';

export const WebScreen = styled.section`
  width: 100%; min-height: 100dvh; padding: 24px 16px 88px; position: relative;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { padding: 94px 28px 30px; }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) { padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.layout.contentGutter}; }
`;
export const WebContent = styled.div`
  width: min(100%, 760px); margin: 0 auto; display: flex; flex-direction: column; gap: 16px;
`;
export const WebContentWide = styled.div`
  width: 100%; max-width: ${({ theme }) => theme.layout.shellMaxWidth}; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;
`;
export const WebHeading = styled.h1`
  color: ${({ theme }) => theme.color.text}; font-size: clamp(1.8rem, 5vw, 2.35rem); font-weight: 900; line-height: 1.1;
`;
export const WebSubtitle = styled.p`
  color: ${({ theme }) => theme.color.textSecondary}; font-size: .92rem; line-height: 1.5;
`;
export const WebCard = styled.div`
  border-radius: 24px; padding: 16px; background: ${({ theme }) => theme.color.surface}; border: 1px solid ${({ theme }) => theme.color.border};
`;
export const GoldButton = styled.button`
  min-height: 48px; padding: 0 20px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  color: ${({ theme }) => theme.color.textInverse}; background: ${({ theme }) => theme.color.primary}; font-weight: 900;
  &:disabled { opacity: .45; cursor: not-allowed; }
`;
export const OutlineButton = styled.button`
  min-height: 44px; padding: 0 16px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  color: ${({ theme }) => theme.color.primary}; border: 1px solid ${({ theme }) => theme.color.borderFocus}; font-weight: 900;
`;
