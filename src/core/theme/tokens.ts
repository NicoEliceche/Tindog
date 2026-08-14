// src/core/theme/tokens.ts
export const tokens = {
  color: {
    // ── Brand Tindog Premium ──────────────────────────────────────────────────
    primary:       '#D4AF37',
    primaryLight:  '#F4D978',
    primaryDark:   '#A9851F',
    primaryFaded:  'rgba(212, 175, 55, 0.14)',
    accent:        '#F4D978',
    accentLight:   '#FFE9A0',
    accentDark:    '#C5A63A',

    // ── Glassmorphism & Modern ────────────────────────────────────────────────
    glass:         'rgba(18, 18, 20, 0.82)',
    glassBorder:   'rgba(212, 175, 55, 0.2)',
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

    // ── Neutros ────────────────────────────────────────────────────────────
    neutral: {
      0:   '#FFFFFF',
      50:  '#F8F4E7',
      100: '#EAE1C7',
      200: '#D0C3A2',
      300: '#B2A583',
      400: '#8F856E',
      500: '#706854',
      600: '#565043',
      700: '#38352F',
      800: '#1F1F20',
      900: '#0A0A0C',
    },

    // ── Superficie y fondo ────────────────────────────────────────────────────
    background:    '#050505',
    surface:       '#121214',
    overlay:       'rgba(0, 0, 0, 0.74)',
    border:        'rgba(212, 175, 55, 0.2)',
    borderFocus:   '#D4AF37',

    // ── Gradientes ────────────────────────────────────────────────────────────
    gradientStart: '#050505',
    gradientMid:   '#0C0C0E',
    gradientEnd:   '#15130D',

    // ── Texto ─────────────────────────────────────────────────────────────────
    text:          '#FFF8E7',
    textSecondary: '#D2C39F',
    textTertiary:  '#978B70',
    textDisabled:  '#655E4D',
    textInverse:   '#050505',
    textLink:      '#D4AF37',
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
    sm:   '0 2px 8px rgba(0, 0, 0, 0.24)',
    md:   '0 8px 24px rgba(0, 0, 0, 0.32)',
    lg:   '0 20px 48px rgba(0, 0, 0, 0.4)',
    glow: '0 0 0 1px rgba(212, 175, 55, 0.16), 0 12px 32px rgba(212, 175, 55, 0.12)',
  },
} as const;

export type Tokens = typeof tokens;
