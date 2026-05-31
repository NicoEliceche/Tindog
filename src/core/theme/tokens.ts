// src/core/theme/tokens.ts
export const tokens = {
  color: {
    // ── Brand Tindog Premium ──────────────────────────────────────────────────
    primary:       '#FF6B6B', // Coral vivo
    primaryLight:  '#FF8E8E',
    primaryDark:   '#E55A5A',
    primaryFaded:  'rgba(255, 107, 107, 0.1)',
    accent:        '#4ECDC4', // Turquesa
    accentLight:   '#71D7D0',
    accentDark:    '#3EBAB1',

    // ── Glassmorphism & Modern ────────────────────────────────────────────────
    glass:         'rgba(255, 255, 255, 0.7)',
    glassBorder:   'rgba(255, 255, 255, 0.4)',
    glassShadow:   'rgba(0, 0, 0, 0.08)',

    // ── Semánticos ──────────────────────────────────────────────────────────
    success:       '#6BCB77',
    successLight:  '#E1F5E5',
    error:         '#FF4D4D',
    errorLight:    '#FFEBEB',
    warning:       '#FFD93D',
    warningLight:  '#FFF9E6',
    info:          '#4D96FF',
    infoLight:     '#EBF3FF',

    // ── Neutros ────────────────────────────────────────────────────────────
    neutral: {
      0:   '#FFFFFF',
      50:  '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // ── Superficie y fondo ────────────────────────────────────────────────────
    background:    '#FDFDFD',
    surface:       '#FFFFFF',
    overlay:       'rgba(0, 0, 0, 0.4)',
    border:        '#E5E7EB',
    borderFocus:   '#FF6B6B',

    // ── Gradientes ────────────────────────────────────────────────────────────
    gradientStart: '#FF6B6B',
    gradientMid:   '#FF8E8E',
    gradientEnd:   '#FFADAD',

    // ── Texto ─────────────────────────────────────────────────────────────────
    text:          '#2D3436',
    textSecondary: '#636E72',
    textTertiary:  '#B2BEC3',
    textDisabled:  '#DFE6E9',
    textInverse:   '#FFFFFF',
    textLink:      '#FF6B6B',
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
    maxContentWidth: '40rem', // Mobile first center
  },

  breakpoints: {
    sm:  '480px',
    md:  '768px',
    lg:  '1024px',
    xl:  '1280px',
  },
} as const;

export type Tokens = typeof tokens;
