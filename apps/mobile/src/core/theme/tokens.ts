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

// Modo claro: "blanco y dorado oscuro" — el dorado se oscurece y satura
// (no el #D4AF37 claro del modo oscuro) para tener contraste real sobre
// blanco, en vez de leer como un amarillo pálido y lavado.
const lightColors: Record<keyof typeof darkColors, string> = {
  primary: '#8A6512',
  primaryDark: '#5E4308',
  primaryFaded: 'rgba(138, 101, 18, 0.12)',
  primaryBorder: 'rgba(94, 67, 8, 0.22)',
  primaryBorderStrong: 'rgba(94, 67, 8, 0.4)',
  accent: '#8A6512',
  accentDark: '#5E4308',
  info: '#2A5FA0',
  infoFaded: 'rgba(42, 95, 160, 0.12)',
  success: '#1F7A42',
  successFaded: 'rgba(31, 122, 66, 0.12)',
  warning: '#8A5A00',
  warningFaded: 'rgba(138, 90, 0, 0.12)',
  danger: '#B23B27',
  dangerFaded: 'rgba(178, 59, 39, 0.1)',
  dangerBorder: 'rgba(178, 59, 39, 0.32)',
  background: '#FFFFFF',
  backgroundAlt: '#F3EDDD',
  surface: '#FBF9F4',
  surfaceAlt: '#F0E9D6',
  surfaceOverlay: 'rgba(255, 255, 255, 0.92)',
  surfaceSubtle: 'rgba(5, 5, 5, 0.03)',
  border: 'rgba(94, 67, 8, 0.18)',
  borderStrong: 'rgba(94, 67, 8, 0.32)',
  borderSubtle: 'rgba(17, 17, 17, 0.08)',
  text: '#181205',
  textStrong: '#120E04',
  textSecondary: '#4A3E1F',
  textMuted: '#71633B',
  textInverse: '#FFFFFF',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(20, 15, 4, 0.55)',
  shadow: '#281E06',
  glow: 'rgba(138, 101, 18, 0.1)',
  glowSoft: 'rgba(138, 101, 18, 0.06)',
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
      : { app: ['#FFFFFF', '#FBF9F4', '#F3EDDD', '#FFFFFF'], home: ['#FFFFFF', '#FBF9F4', '#F3EDDD'] },
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
