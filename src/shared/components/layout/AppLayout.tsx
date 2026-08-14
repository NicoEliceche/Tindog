'use client';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { WebAppProvider, useWebApp } from '@core/providers/WebAppProvider';
import { lightTheme, theme as darkTheme } from '@core/theme/theme';
import { PageTransition } from '@shared/components/ui';
import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { BottomNavigation } from './BottomNavigation';
import { FloatingPawsBackground } from './FloatingPawsBackground';
import { GlobalStyles } from './GlobalStyles';
import { SidebarNavigation } from './SidebarNavigation';
import { isNavHidden } from './navigation.config';

const Viewport = styled.div`
  width: 100%; min-height: 100dvh; display: flex; flex-direction: column;
  background: transparent; color: ${({ theme }) => theme.color.text}; position: relative; overflow-x: hidden;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.layout.sidebarWidth} 1fr;
    align-items: start;
  }
`;
const Main = styled.main`
  flex: 1; width: 100%; max-width: ${({ theme }) => theme.layout.shellMaxWidth}; margin: 0 auto; position: relative; display: flex; flex-direction: column; z-index: 10;
`;
const SkipLink = styled.a`
  position: fixed; left: 12px; top: 10px; z-index: 5000; padding: 10px 14px; border-radius: 12px; transform: translateY(-160%);
  color: ${({ theme }) => theme.color.textInverse}; background: ${({ theme }) => theme.color.primary}; font-weight: 900;
  &:focus { transform: translateY(0); }
`;

function ThemedShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useWebApp();
  const pathname = usePathname();
  const showChrome = !isNavHidden(pathname);

  return <ThemeProvider theme={resolvedTheme === 'light' ? lightTheme : darkTheme}>
    <GlobalStyles /><FloatingPawsBackground />
    <Viewport>
      <SkipLink href="#tindog-main">Saltar al contenido</SkipLink>
      {showChrome && <SidebarNavigation />}
      <Main id="tindog-main" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <PageTransition key={pathname}>{children}</PageTransition>
        </AnimatePresence>
      </Main>
      {showChrome && <BottomNavigation />}
    </Viewport>
  </ThemeProvider>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <WebAppProvider><ThemedShell>{children}</ThemedShell></WebAppProvider>;
}
