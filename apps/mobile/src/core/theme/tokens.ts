const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

const typography = {
  size: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, hero: 34 },
  lineHeight: { tight: 1.18, normal: 1.45, relaxed: 1.62 },
} as const;

const layout = {
  maxPhoneWidth: 520,
  tabHeight: 72,
  touchTarget: 48,
} as const;

const darkColors = {
  primary: '#D4AF37',
  primaryDark: '#A9851F',
  primaryFaded: 'rgba(212, 175, 55, 0.14)',
  primaryBorder: 'rgba(212, 175, 55, 0.24)',
  primaryBorderStrong: 'rgba(212, 175, 55, 0.42)',
  accent: '#F4D978',
  accentDark: '#C5A63A',
  info: '#8BB8FF',
  infoFaded: 'rgba(77, 150, 255, 0.16)',
  success: '#78D69A',
  successFaded: 'rgba(64, 169, 100, 0.16)',
  warning: '#F2C45A',
  warningFaded: 'rgba(242, 196, 90, 0.16)',
  danger: '#FF9278',
  dangerFaded: 'rgba(168, 76, 48, 0.2)',
  dangerBorder: 'rgba(255, 146, 120, 0.38)',
  background: '#050505',
  backgroundAlt: '#0A0A0C',
  surface: '#121214',
  surfaceAlt: '#1A1A1E',
  surfaceOverlay: 'rgba(5, 5, 5, 0.82)',
  surfaceSubtle: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(212, 175, 55, 0.2)',
  borderStrong: 'rgba(212, 175, 55, 0.38)',
  borderSubtle: 'rgba(255, 255, 255, 0.07)',
  text: '#FFF8E7',
  textStrong: '#FFF3C4',
  textSecondary: '#D2C39F',
  textMuted: '#978B70',
  textInverse: '#FFFFFF',
  onPrimary: '#050505',
  overlay: 'rgba(0, 0, 0, 0.74)',
  shadow: '#000000',
  glow: 'rgba(212, 175, 55, 0.1)',
  glowSoft: 'rgba(212, 175, 55, 0.07)',
} as const;

const lightColors: Record<keyof typeof darkColors, string> = {
  primary: '#B08A1E',
  primaryDark: '#7D6114',
  primaryFaded: 'rgba(176, 138, 30, 0.12)',
  primaryBorder: 'rgba(125, 97, 20, 0.22)',
  primaryBorderStrong: 'rgba(125, 97, 20, 0.38)',
  accent: '#8C6C16',
  accentDark: '#654C0E',
  info: '#356FB6',
  infoFaded: 'rgba(53, 111, 182, 0.12)',
  success: '#27834B',
  successFaded: 'rgba(39, 131, 75, 0.12)',
  warning: '#9A6A05',
  warningFaded: 'rgba(154, 106, 5, 0.12)',
  danger: '#B9432E',
  dangerFaded: 'rgba(185, 67, 46, 0.1)',
  dangerBorder: 'rgba(185, 67, 46, 0.32)',
  background: '#F7F3E8',
  backgroundAlt: '#EFE8D7',
  surface: '#FFFCF4',
  surfaceAlt: '#F0E9D8',
  surfaceOverlay: 'rgba(255, 252, 244, 0.9)',
  surfaceSubtle: 'rgba(5, 5, 5, 0.03)',
  border: 'rgba(125, 97, 20, 0.2)',
  borderStrong: 'rgba(125, 97, 20, 0.34)',
  borderSubtle: 'rgba(17, 17, 17, 0.08)',
  text: '#17140E',
  textStrong: '#241C0B',
  textSecondary: '#5D523A',
  textMuted: '#81765F',
  textInverse: '#FFFFFF',
  onPrimary: '#080704',
  overlay: 'rgba(17, 14, 8, 0.62)',
  shadow: '#3A2E12',
  glow: 'rgba(176, 138, 30, 0.08)',
  glowSoft: 'rgba(176, 138, 30, 0.05)',
};

export type ResolvedThemeMode = 'dark' | 'light';
export type ThemeMode = ResolvedThemeMode | 'system';

export interface AppTheme {
  mode: ResolvedThemeMode;
  dark: boolean;
  colors: Record<keyof typeof darkColors, string>;
  gradients: {
    app: readonly [string, string, string, string];
    home: readonly [string, string, string];
  };
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  layout: typeof layout;
}

function createTheme(mode: ResolvedThemeMode): AppTheme {
  const dark = mode === 'dark';
  return {
    mode,
    dark,
    colors: dark ? darkColors : lightColors,
    gradients: dark
      ? { app: ['#050505', '#0A0A0C', '#141414', '#050505'], home: ['#050505', '#0C0C0E', '#15130D'] }
      : { app: ['#F7F3E8', '#FFFCF4', '#EFE8D7', '#F7F3E8'], home: ['#F7F3E8', '#FFFCF4', '#EFE8D7'] },
    spacing,
    radius,
    typography,
    layout,
  };
}

export const darkTheme = createTheme('dark');
export const lightTheme = createTheme('light');

// Alias retained for branded pre-auth screens and legacy components.
export const theme = darkTheme;
export const tokens = theme;
export type Theme = AppTheme;
