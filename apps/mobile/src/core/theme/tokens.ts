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

// Modo oscuro: gris cálido (no negro puro) para que el dorado lea como
// metal y la app no se sienta un vacío negro. Espeja la paleta web.
const darkColors = {
  primary: '#E8C252',
  primaryDark: '#B8860B',
  primaryFaded: 'rgba(232, 194, 82, 0.14)',
  primaryBorder: 'rgba(232, 194, 82, 0.26)',
  primaryBorderStrong: 'rgba(232, 194, 82, 0.45)',
  accent: '#FFD97A',
  accentDark: '#C9A227',
  info: '#8BB8FF',
  infoFaded: 'rgba(77, 150, 255, 0.16)',
  success: '#78D69A',
  successFaded: 'rgba(64, 169, 100, 0.16)',
  warning: '#F2C45A',
  warningFaded: 'rgba(242, 196, 90, 0.16)',
  danger: '#FF9278',
  /** Fondo de los avisos, igual que en la web: 6.8:1 y 7.2:1 con el texto. */
  dangerSolid: 'rgba(138, 61, 40, 0.85)',
  successSolid: 'rgba(31, 91, 56, 0.85)',
  dangerFaded: 'rgba(168, 76, 48, 0.2)',
  dangerBorder: 'rgba(255, 146, 120, 0.38)',
  background: '#262624',
  backgroundAlt: '#2E2E2B',
  surface: '#30302E',
  surfaceAlt: '#3A3A37',
  surfaceOverlay: 'rgba(38, 38, 36, 0.85)',
  surfaceSubtle: 'rgba(255, 255, 255, 0.04)',
  border: 'rgba(232, 194, 82, 0.18)',
  borderStrong: 'rgba(232, 194, 82, 0.4)',
  borderSubtle: '#3F3F3C',
  text: '#F5F2EA',
  textStrong: '#FFF4C2',
  textSecondary: '#C6C0B2',
  textMuted: '#918C81',
  textInverse: '#FFFFFF',
  onPrimary: '#221F18',
  overlay: 'rgba(20, 20, 19, 0.76)',
  shadow: '#000000',
  /** Tinta de los dibujos del fondo: en oscuro, el dorado de siempre. */
  /** Relleno de los cuadros punteados de accion. */
  actionFill: 'rgba(232, 194, 82, 0.14)',
  canvasInk: '#E8C252',
  glow: 'rgba(232, 194, 82, 0.16)',
  glowSoft: 'rgba(232, 194, 82, 0.09)',
  /** Dorado de los titulos de pantalla. Sobre el fondo oscuro da 8.9:1. */
  heading: '#E8C252',
} as const;

// Modo claro: marfil cálido + dorado luminoso. El blanco puro apaga los
// dorados (los vuelve mostaza); el marfil los hace leer como metal noble.
const lightColors: Record<keyof typeof darkColors, string> = {
  primary: '#C9A227',
  primaryDark: '#9A7B14',
  primaryFaded: 'rgba(201, 162, 39, 0.14)',
  primaryBorder: 'rgba(154, 123, 20, 0.24)',
  primaryBorderStrong: 'rgba(154, 123, 20, 0.42)',
  accent: '#D4AF37',
  accentDark: '#9A7B14',
  info: '#2A5FA0',
  infoFaded: 'rgba(42, 95, 160, 0.12)',
  success: '#1F7A42',
  successFaded: 'rgba(31, 122, 66, 0.12)',
  warning: '#8A5A00',
  warningFaded: 'rgba(138, 90, 0, 0.12)',
  danger: '#B23B27',
  dangerSolid: 'rgba(138, 61, 40, 0.85)',
  successSolid: 'rgba(31, 91, 56, 0.85)',
  dangerFaded: 'rgba(178, 59, 39, 0.1)',
  dangerBorder: 'rgba(178, 59, 39, 0.32)',
  background: '#FDFBF7',
  backgroundAlt: '#F7F0DF',
  surface: '#FFFFFF',
  surfaceAlt: '#F2EEE3',
  surfaceOverlay: 'rgba(253, 251, 247, 0.94)',
  surfaceSubtle: 'rgba(5, 5, 5, 0.03)',
  border: 'rgba(154, 123, 20, 0.2)',
  borderStrong: 'rgba(154, 123, 20, 0.34)',
  borderSubtle: '#EDE7D8',
  text: '#221B0A',
  textStrong: '#1A1508',
  textSecondary: '#544829',
  textMuted: '#7C7157',
  textInverse: '#FFFFFF',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(38, 30, 12, 0.5)',
  shadow: '#4A3A10',
  // Sobre el marfil el dorado de acentos da 2.1 de contraste y no se ve;
  // este tono sube a 5.1.
  // Un poco mas firme que en oscuro: al 14% sobre marfil el cuadro casi no
  // se distinguia del fondo de la pagina.
  actionFill: 'rgba(201, 162, 39, 0.18)',
  canvasInk: '#7D6212',
  glow: 'rgba(201, 162, 39, 0.18)',
  glowSoft: 'rgba(201, 162, 39, 0.1)',
  // El dorado normal sobre marfil da 2.34:1, por debajo del minimo; el tono
  // oscuro sigue leyendose dorado y llega a 3.89:1.
  heading: '#9A7B14',
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
    /** Dorado metálico para botones y acentos: da highlights, no color plano. */
    metalGold: readonly [string, string, string, string];
    /** Variante suave para superficies grandes. */
    metalGoldSoft: readonly [string, string, string];
    /** Dorado de los titulos de pantalla. */
    metalGoldHeading: readonly [string, string, string, string];
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
      ? {
          app: ['#262624', '#2E2E2B', '#332F26', '#262624'],
          home: ['#262624', '#2E2E2B', '#332F26'],
          metalGold: ['#B8860B', '#E8C252', '#FFF4C2', '#C9A227'],
          metalGoldSoft: ['#C9A227', '#E8C252', '#FFE9A0'],
          // Sobre el fondo oscuro el dorado de acentos ya es legible: la
          // parada mas floja da 4.66:1.
          metalGoldHeading: ['#B8860B', '#E8C252', '#FFF4C2', '#C9A227'],
        }
      : {
          app: ['#FDFBF7', '#FFFFFF', '#F7F0DF', '#FDFBF7'],
          home: ['#FDFBF7', '#FFFFFF', '#F7F0DF'],
          metalGold: ['#9A7B14', '#C9A227', '#F0D98A', '#A8850F'],
          metalGoldSoft: ['#A8850F', '#C9A227', '#E8C252'],
          // El dorado de acentos sobre marfil baja hasta 1.35:1 en su parada
          // mas clara: el brillo del metal se volvia ilegible. Estas cuatro
          // conservan el rango metalico (3.4x entre extremos) y ninguna baja
          // del minimo de 3:1 para texto grande.
          metalGoldHeading: ['#5E4A0E', '#8A6E12', '#A8850F', '#6B5410'],
        },
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
