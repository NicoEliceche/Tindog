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

export const lightTheme = {
  ...theme,
  color: {
    ...theme.color,
    primary: '#B08A1E', primaryLight: '#D4AF37', primaryDark: '#7D6114',
    primaryFaded: 'rgba(176, 138, 30, 0.12)',
    glass: 'rgba(255, 252, 244, 0.86)', glassBorder: 'rgba(125, 97, 20, 0.2)', glassShadow: 'rgba(58, 46, 18, 0.12)',
    success: '#27834B', successLight: 'rgba(39, 131, 75, 0.12)', error: '#B9432E', errorLight: 'rgba(185, 67, 46, 0.1)',
    warning: '#9A6A05', warningLight: 'rgba(154, 106, 5, 0.12)', info: '#356FB6', infoLight: 'rgba(53, 111, 182, 0.12)',
    background: '#F7F3E8', surface: '#FFFCF4', overlay: 'rgba(17, 14, 8, 0.62)', border: 'rgba(125, 97, 20, 0.2)', borderFocus: '#B08A1E',
    gradientStart: '#F7F3E8', gradientMid: '#FFFCF4', gradientEnd: '#EFE8D7',
    text: '#17140E', textSecondary: '#5D523A', textTertiary: '#81765F', textDisabled: '#B9AF97', textInverse: '#050505', textLink: '#7D6114',
  },
  elevation: {
    sm:   '0 2px 8px rgba(58, 46, 18, 0.1)',
    md:   '0 8px 24px rgba(58, 46, 18, 0.14)',
    lg:   '0 20px 48px rgba(58, 46, 18, 0.18)',
    glow: '0 0 0 1px rgba(176, 138, 30, 0.18), 0 12px 32px rgba(176, 138, 30, 0.14)',
  },
} as unknown as Theme;
