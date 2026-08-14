// src/core/theme/theme.ts
import { tokens } from './tokens';

export const theme = {
  color:       tokens.color,
  radius:      tokens.radius,
  typography:  tokens.typography,
  spacing:     tokens.spacing,
  layout:      tokens.layout,
  breakpoints: tokens.breakpoints,
  elevation:   tokens.elevation,
} as const;

export type Theme = typeof theme;

// Modo claro: "blanco y dorado oscuro" — el dorado se oscurece y satura
// (no el #D4AF37 claro del modo oscuro) para tener contraste real sobre
// blanco, en vez de leer como un amarillo pálido y lavado.
export const lightTheme = {
  ...theme,
  color: {
    ...theme.color,
    primary: '#8A6512', primaryLight: '#B08A1E', primaryDark: '#5E4308',
    primaryFaded: 'rgba(138, 101, 18, 0.12)',
    accent: '#8A6512', accentLight: '#B08A1E', accentDark: '#5E4308',
    glass: 'rgba(255, 255, 255, 0.82)', glassBorder: 'rgba(94, 67, 8, 0.16)', glassShadow: 'rgba(40, 30, 6, 0.1)',
    success: '#1F7A42', successLight: 'rgba(31, 122, 66, 0.12)', error: '#B23B27', errorLight: 'rgba(178, 59, 39, 0.1)',
    warning: '#8A5A00', warningLight: 'rgba(138, 90, 0, 0.12)', info: '#2A5FA0', infoLight: 'rgba(42, 95, 160, 0.12)',
    background: '#FFFFFF', surface: '#FBF9F4', overlay: 'rgba(20, 15, 4, 0.55)', border: 'rgba(94, 67, 8, 0.18)', borderFocus: '#8A6512',
    gradientStart: '#FFFFFF', gradientMid: '#FBF9F4', gradientEnd: '#F3EDDD',
    text: '#181205', textSecondary: '#4A3E1F', textTertiary: '#71633B', textDisabled: '#B3A981', textInverse: '#FFFFFF', textLink: '#5E4308',
    neutral: {
      0: '#FFFFFF', 50: '#FBF9F4', 100: '#F0E9D6', 200: '#DFD3AE', 300: '#C4B583',
      400: '#9C8C5C', 500: '#71633B', 600: '#4A3E1F', 700: '#332A12', 800: '#221B0A', 900: '#120E04',
    },
  },
  elevation: {
    sm:   '0 2px 8px rgba(40, 30, 6, 0.08)',
    md:   '0 8px 24px rgba(40, 30, 6, 0.12)',
    lg:   '0 20px 48px rgba(40, 30, 6, 0.16)',
    glow: '0 0 0 1px rgba(138, 101, 18, 0.22), 0 12px 32px rgba(138, 101, 18, 0.16)',
  },
} as unknown as Theme;
