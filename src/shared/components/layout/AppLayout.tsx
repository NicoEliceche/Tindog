'use client';

import { usePathname } from 'next/navigation';
import { WebAppProvider, useWebApp } from '@core/providers/WebAppProvider';
import { lightTheme, theme as darkTheme } from '@core/theme/theme';
import { PageTransition, ToastProvider } from '@shared/components/ui';
import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { AuroraBackground } from './AuroraBackground';
import { BottomNavigation } from './BottomNavigation';
import { GlobalStyles } from './GlobalStyles';
import { SidebarNavigation } from './SidebarNavigation';
import { isBottomNavHidden, isSidebarHidden } from './navigation.config';

const Viewport = styled.div<{ $showChrome: boolean }>`
  width: 100%; min-height: 100dvh; display: flex; flex-direction: column;
  background: transparent; color: ${({ theme }) => theme.color.text}; position: relative;
  /* Nada de overflow-x aquí: un overflow en un eje convierte al elemento en
     contenedor de scroll y eso anula el position:sticky de la barra lateral,
     que entonces sube con la página. El desborde horizontal se contiene en
     el body, que es el que scrollea de verdad. */

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    ${({ $showChrome, theme }) => $showChrome && `
      display: grid;
      grid-template-columns: ${theme.layout.sidebarWidth} 1fr;
      align-items: start;
    `}
  }
`;
/**
 * `$fluid` libera el techo de ancho para las pantallas que son superficies
 * de trabajo —el chat de dos paneles y las grillas de tarjetas—, donde más
 * monitor significa más contenido útil. El resto lo conserva: en formularios
 * y textos largos, una línea de 1900px se vuelve incómoda de leer.
 */
const Main = styled.main<{ $fluid: boolean }>`
  flex: 1; width: 100%; min-width: 0; margin: 0 auto; position: relative; display: flex; flex-direction: column; z-index: 10;
  ${({ $fluid, theme }) => !$fluid && `max-width: ${theme.layout.shellMaxWidth};`}
`;

/** Rutas que aprovechan todo el ancho disponible. */
const FLUID_ROUTES = ['/chat', '/requests', '/saved', '/safety'];
const SkipLink = styled.a`
  position: fixed; left: 12px; top: 10px; z-index: 5000; padding: 10px 14px; border-radius: 12px; transform: translateY(-160%);
  color: ${({ theme }) => theme.color.textInverse}; background: ${({ theme }) => theme.color.primary}; font-weight: 900;
  &:focus { transform: translateY(0); }
`;

function ThemedShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useWebApp();
  const pathname = usePathname();
  // El grid de dos columnas depende de la barra lateral; la barra inferior
  // se decide aparte porque no coinciden (ajustes conserva ambas, la
  // conversación abierta conserva sólo la lateral).
  const showSidebar = !isSidebarHidden(pathname);
  const showBottomNav = !isBottomNavHidden(pathname);

  return <ThemeProvider theme={resolvedTheme === 'light' ? lightTheme : darkTheme}>
    <ToastProvider>
    <GlobalStyles /><AuroraBackground />
    <Viewport $showChrome={showSidebar}>
      <SkipLink href="#tindog-main">Saltar al contenido</SkipLink>
      {showSidebar && <SidebarNavigation />}
      <Main id="tindog-main" tabIndex={-1} $fluid={FLUID_ROUTES.some((route) => pathname.startsWith(route))}>
        {/* Sin AnimatePresence: con `mode="wait"` el montaje de la pantalla
            nueva quedaba condicionado a que la animación de salida de la
            anterior avisara que terminó. Cuando ese aviso no llegaba —con
            `duration: 0` por movimiento reducido, o con la pestaña en
            segundo plano, donde requestAnimationFrame no dispara— la salida
            nunca completaba y el contenido no se montaba: pantalla vacía
            hasta recargar a mano. La entrada de página no justifica que se
            pueda perder la UI entera, así que el contenido se monta directo
            y `PageTransition` sólo anima su propia aparición. */}
        <PageTransition key={pathname}>{children}</PageTransition>
      </Main>
      {showBottomNav && <BottomNavigation />}
    </Viewport>
    </ToastProvider>
  </ThemeProvider>;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return <WebAppProvider><ThemedShell>{children}</ThemedShell></WebAppProvider>;
}
