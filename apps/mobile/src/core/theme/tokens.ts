export const tokens = {
  colors: {
    primary: '#FF6B6B',
    primaryDark: '#E25454',
    primaryFaded: '#FFE9E9',
    accent: '#4ECDC4',
    accentDark: '#249E97',
    info: '#4D96FF',
    infoFaded: '#EAF3FF',
    success: '#2F9E44',
    successFaded: '#E7F7EC',
    warning: '#F59F00',
    warningFaded: '#FFF4D6',
    danger: '#D92D20',
    dangerFaded: '#FFE7E4',
    background: '#FFF8F4',
    surface: '#FFFFFF',
    surfaceAlt: '#F7F3EF',
    border: '#E9DFD8',
    borderStrong: '#D8C7BD',
    text: '#202427',
    textSecondary: '#5C646A',
    textMuted: '#8A9298',
    textInverse: '#FFFFFF',
    overlay: 'rgba(32, 36, 39, 0.58)',
    shadow: '#A85B5B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 999,
  },
  typography: {
    size: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      hero: 34,
    },
    lineHeight: {
      tight: 1.18,
      normal: 1.45,
      relaxed: 1.62,
    },
  },
  layout: {
    maxPhoneWidth: 520,
    tabHeight: 72,
    touchTarget: 48,
  },
} as const;

export const theme = tokens;

export type Theme = typeof theme;
