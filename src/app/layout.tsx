// src/app/layout.tsx
import { AppLayout } from '@/shared/components/layout/AppLayout';
import { StyledComponentsRegistry } from '@core/theme/StyledComponentsRegistry';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Tindog - Pet Dating',
  description: 'Encuentra la cita perfecta para tu mascota',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <StyledComponentsRegistry>
          <AppLayout>{children}</AppLayout>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
