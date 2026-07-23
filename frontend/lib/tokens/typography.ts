/**
 * Typography — Cormorant Garamond (display/serif) + Plus Jakarta Sans (UI/body).
 * Fonts are loaded in `app/layout.tsx` as `--font-cormorant` / `--font-plus-jakarta`.
 */

export const fontFamilyTokens = {
  sans: 'var(--font-plus-jakarta), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  serif: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
  /** Alias — handwritten / editorial italic accents use Cormorant */
  handwritten: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
} as const;

/** Modular type scale (rem) for product UI */
export const fontSizeScale = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
} as const;

export const typographyTokens = {
  fontFamily: fontFamilyTokens,
  fontSize: fontSizeScale,

  hero: {
    fontFamily: fontFamilyTokens.serif,
    fontSize: 'clamp(3rem, 5vw + 1rem, 5.5rem)',
    lineHeight: '1.05',
    fontWeight: '500',
    letterSpacing: '-0.02em',
  },
  sectionTitle: {
    fontFamily: fontFamilyTokens.serif,
    fontSize: 'clamp(2rem, 3vw + 1rem, 3.5rem)',
    lineHeight: '1.15',
    fontWeight: '500',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontFamily: fontFamilyTokens.serif,
    fontSize: '1.5rem',
    lineHeight: '1.4',
    fontWeight: '500',
  },
  body: {
    fontFamily: fontFamilyTokens.sans,
    fontSize: '1rem',
    lineHeight: '1.65',
    fontWeight: '400',
    letterSpacing: '-0.011em',
  },
  product: {
    fontFamily: fontFamilyTokens.sans,
    fontSize: '1.125rem',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  price: {
    fontFamily: fontFamilyTokens.sans,
    fontSize: '1.25rem',
    lineHeight: '1.4',
    fontWeight: '600',
    fontVariantNumeric: 'tabular-nums',
  },
  caption: {
    fontFamily: fontFamilyTokens.sans,
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: '400',
    letterSpacing: '-0.011em',
    color: 'var(--color-muted-sepia)',
  },
  overline: {
    fontFamily: fontFamilyTokens.sans,
    fontSize: '0.75rem',
    lineHeight: '1.4',
    fontWeight: '600',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyRole = keyof Omit<typeof typographyTokens, 'fontFamily' | 'fontSize'>;
