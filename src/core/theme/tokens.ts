// src/core/theme/tokens.ts
export const tokens = {
  color: {
    // ── Brand Tindog Premium ──────────────────────────────────────────────────
    // Dorado luminoso: más saturado y claro que el dorado plano anterior, para
    // que lea como metal precioso y no como mostaza.
    primary:       '#E8C252',
    primaryLight:  '#FFF4C2',
    primaryDark:   '#B8860B',
    primaryFaded:  'rgba(232, 194, 82, 0.14)',
    accent:        '#FFD97A',
    accentLight:   '#FFF4C2',
    accentDark:    '#C9A227',

    // ── Glassmorphism & Modern ────────────────────────────────────────────────
    glass:         'rgba(48, 48, 46, 0.78)',
    glassBorder:   'rgba(232, 194, 82, 0.22)',
    glassShadow:   'rgba(0, 0, 0, 0.3)',

    // ── Semánticos ──────────────────────────────────────────────────────────
    success:       '#78D69A',
    successLight:  'rgba(64, 169, 100, 0.16)',
    error:         '#FF9278',
    errorLight:    'rgba(168, 76, 48, 0.2)',
    warning:       '#F2C45A',
    warningLight:  'rgba(242, 196, 90, 0.16)',
    info:          '#8BB8FF',
    infoLight:     'rgba(77, 150, 255, 0.16)',

    // ── Neutros (grises cálidos) ──────────────────────────────────────────────
    neutral: {
      0:   '#FFFFFF',
      50:  '#F5F4F1',
      100: '#E6E4DF',
      200: '#C9C6BE',
      300: '#A5A199',
      400: '#807C74',
      500: '#5F5C55',
      600: '#4A4844',
      700: '#3F3F3C',
      800: '#30302E',
      900: '#262624',
    },

    // ── Superficie y fondo ────────────────────────────────────────────────────
    // Gris cálido oscuro (estilo Claude) en vez de negro puro: el dorado
    // brilla mucho más sobre este fondo y la app se siente menos plana.
    background:    '#262624',
    surface:       '#30302E',
    surfaceRaised: '#3A3A37',
    /**
     * Panel que deja ver el fondo animado por detras, con desenfoque.
     * A 0.86 el texto secundario queda en 4.8:1 aun con una parada dorada
     * clara detras; mas transparente bajaba de 4.5 y dejaba de leerse.
     */
    surfaceGlass:  'rgba(48, 48, 46, 0.86)',
    overlay:       'rgba(20, 20, 19, 0.76)',
    border:        'rgba(232, 194, 82, 0.18)',
    borderSubtle:  '#3F3F3C',
    borderFocus:   '#E8C252',

    // ── Gradientes ────────────────────────────────────────────────────────────
    gradientStart: '#262624',
    gradientMid:   '#2E2E2B',
    gradientEnd:   '#332F26',

    // ── Dorado metálico (para texto/bordes/botones con brillo real) ───────────
    metalGold:      'linear-gradient(135deg, #B8860B 0%, #E8C252 35%, #FFF4C2 50%, #E8C252 65%, #C9A227 100%)',
    metalGoldSoft:  'linear-gradient(135deg, #C9A227 0%, #E8C252 50%, #FFE9A0 100%)',
    metalSheen:     'linear-gradient(115deg, transparent 30%, rgba(255,244,194,0.5) 50%, transparent 70%)',

    // ── Texto ─────────────────────────────────────────────────────────────────
    text:          '#F5F2EA',
    textSecondary: '#C6C0B2',
    textTertiary:  '#918C81',
    textDisabled:  '#615D56',
    textInverse:   '#221F18',
    textLink:      '#E8C252',
  },

  typography: {
    size: {
      xs:    '0.6875rem',  // 11px
      sm:    '0.8125rem',  // 13px
      base:  '1rem',       // 16px
      lg:    '1.125rem',   // 18px
      xl:    '1.25rem',    // 20px
      '2xl': '1.5rem',     // 24px
      '3xl': '1.875rem',   // 30px
      '4xl': '2.25rem',    // 36px
    },
    weight: {
      regular:   '400',
      medium:    '500',
      semibold:  '600',
      bold:      '700',
      extrabold: '800',
    },
    lineHeight: {
      tight:  1.2,
      snug:   1.375,
      normal: 1.5,
    },
  },

  radius: {
    sm:    '8px',
    md:    '12px',
    lg:    '16px',
    xl:    '24px',
    '2xl': '32px',
    full:  '9999px',
  },

  spacing: {
    1:  '0.25rem',   // 4px
    2:  '0.5rem',    // 8px
    3:  '0.75rem',   // 12px
    4:  '1rem',      // 16px
    5:  '1.25rem',   // 20px
    6:  '1.5rem',    // 24px
    8:  '2rem',      // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
  },

  layout: {
    screenPaddingH:  '1.5rem',
    cardRadius:      '2rem',
    inputHeight:     '3.5rem',
    buttonHeight:    '3.5rem',
    maxContentWidth: '40rem',  // Ancho de contenido de lectura (forms, chat bubbles)
    shellMaxWidth:   '90rem',  // Ancho máximo del app-shell logueado en desktop
    landingMaxWidth: '75rem',  // Ancho de secciones de la landing pública
    sidebarWidth:          '17.5rem',
    sidebarWidthCollapsed: '5rem',
    contentGutter:   '2.5rem', // Padding horizontal en desktop
  },

  breakpoints: {
    sm:  '480px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
    xxl: '1536px',
  },

  elevation: {
    sm:   '0 2px 8px rgba(0, 0, 0, 0.28)',
    md:   '0 8px 24px rgba(0, 0, 0, 0.36)',
    lg:   '0 20px 48px rgba(0, 0, 0, 0.45)',
    glow: '0 0 0 1px rgba(232, 194, 82, 0.18), 0 12px 32px rgba(232, 194, 82, 0.14)',
  },

  // ── Glow dorado: halos reactivos para botones, cards y focus ───────────────
  glow: {
    subtle: '0 0 12px rgba(232, 194, 82, 0.18)',
    soft:   '0 0 20px rgba(232, 194, 82, 0.28), 0 0 40px rgba(232, 194, 82, 0.12)',
    strong: '0 0 24px rgba(232, 194, 82, 0.45), 0 0 56px rgba(232, 194, 82, 0.22)',
    inset:  'inset 0 1px 0 rgba(255, 244, 194, 0.22)',
    text:   '0 0 18px rgba(232, 194, 82, 0.5)',
  },
} as const;

export type Tokens = typeof tokens;
