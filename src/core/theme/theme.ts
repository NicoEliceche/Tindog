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
  glow:        tokens.glow,
} as const;

export type Theme = typeof theme;

// Modo claro: marfil cálido + dorado metálico de alta gama.
// El blanco puro "apaga" los dorados (los hace leer como mostaza); un marfil
// cálido de fondo hace que el mismo dorado se perciba mucho más rico, como
// en catálogos de joyería. El primary conserva luminosidad (#C9A227) y el
// contraste sobre texto se resuelve con los gradientes metálicos.
export const lightTheme = {
  ...theme,
  color: {
    ...theme.color,
    primary: '#C9A227', primaryLight: '#E8C252', primaryDark: '#9A7B14',
    primaryFaded: 'rgba(201, 162, 39, 0.14)',
    accent: '#D4AF37', accentLight: '#F0D98A', accentDark: '#9A7B14',
    glass: 'rgba(253, 251, 247, 0.82)', glassBorder: 'rgba(154, 123, 20, 0.2)', glassShadow: 'rgba(74, 58, 16, 0.1)',
    success: '#1F7A42', successLight: 'rgba(31, 122, 66, 0.12)', error: '#B23B27', errorLight: 'rgba(178, 59, 39, 0.1)',
    warning: '#8A5A00', warningLight: 'rgba(138, 90, 0, 0.12)', info: '#2A5FA0', infoLight: 'rgba(42, 95, 160, 0.12)',
    // `surface` se mantiene blanco (tarjetas sobre el marfil del fondo).
    // `surfaceRaised` baja hasta un arena cálido: su contraste contra el
    // fondo (1.32) iguala el que ya funciona bien en modo oscuro entre
    // surfaceAlt y background, para que las burbujas de chat se lean como
    // burbujas y no como texto suelto.
    background: '#FDFBF7', surface: '#FFFFFF', surfaceRaised: '#E7DCBF', surfaceGlass: 'rgba(255, 255, 255, 0.86)',
    overlay: 'rgba(38, 30, 12, 0.5)', border: 'rgba(154, 123, 20, 0.2)', borderSubtle: '#EDE7D8', borderFocus: '#C9A227',
    gradientStart: '#FDFBF7', gradientMid: '#FFFFFF', gradientEnd: '#F7F0DF',
    metalGold:     'linear-gradient(135deg, #9A7B14 0%, #C9A227 30%, #F0D98A 50%, #C9A227 70%, #A8850F 100%)',
    metalGoldSoft: 'linear-gradient(135deg, #A8850F 0%, #C9A227 50%, #E8C252 100%)',
    metalSheen:    'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.65) 50%, transparent 70%)',
    text: '#221B0A', textSecondary: '#544829', textTertiary: '#7C7157', textDisabled: '#B3A981', textInverse: '#FFFFFF', textLink: '#9A7B14',
    neutral: {
      0: '#FFFFFF', 50: '#FDFBF7', 100: '#F2EEE3', 200: '#E0D9C6', 300: '#C2B79B',
      400: '#9A9078', 500: '#7C7157', 600: '#544829', 700: '#3B3218', 800: '#2A230F', 900: '#1A1508',
    },
  },
  elevation: {
    sm:   '0 2px 8px rgba(74, 58, 16, 0.08)',
    md:   '0 8px 24px rgba(74, 58, 16, 0.12)',
    lg:   '0 20px 48px rgba(74, 58, 16, 0.16)',
    glow: '0 0 0 1px rgba(201, 162, 39, 0.24), 0 12px 32px rgba(201, 162, 39, 0.18)',
  },
  glow: {
    subtle: '0 0 12px rgba(201, 162, 39, 0.22)',
    soft:   '0 0 20px rgba(201, 162, 39, 0.3), 0 0 40px rgba(201, 162, 39, 0.14)',
    strong: '0 0 24px rgba(201, 162, 39, 0.45), 0 0 56px rgba(201, 162, 39, 0.22)',
    inset:  'inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    text:   '0 0 18px rgba(201, 162, 39, 0.4)',
  },
} as unknown as Theme;
