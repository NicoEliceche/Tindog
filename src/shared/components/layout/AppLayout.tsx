// src/shared/components/layout/AppLayout.tsx
'use client';

import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from '@core/theme/theme';
import { GlobalStyles } from './GlobalStyles';
import { BottomNavigation } from './BottomNavigation';
import { FloatingPawsBackground } from './FloatingPawsBackground';

const ViewportContainer = styled.div`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: transparent; /* Transparente para ver las patitas del body */
  color: ${({ theme }) => theme.color.text};
  position: relative;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 10;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 1200px;
    padding-bottom: 2rem;
    /* Eliminado el fondo blanco y la sombra para que sea "transparente" como en mobile */
    background: transparent;
    box-shadow: none;
  }
`;

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <FloatingPawsBackground />
      <ViewportContainer>
        <MainContent>
          {children}
        </MainContent>
        <BottomNavigation />
      </ViewportContainer>
    </ThemeProvider>
  );
}
