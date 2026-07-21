export const typographyTokens = {
  fontFamily: {
    sans: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
    serif: 'var(--font-playfair), "Playfair Display", Georgia, serif',
  },
  hero: {
    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
    fontSize: 'clamp(3rem, 5vw + 1rem, 5rem)',
    lineHeight: '1.1',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  sectionTitle: {
    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
    fontSize: 'clamp(2rem, 3vw + 1rem, 3.5rem)',
    lineHeight: '1.2',
    fontWeight: '600',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
    fontSize: '1.5rem',
    lineHeight: '1.4',
    fontWeight: '500',
  },
  body: {
    fontFamily: 'var(--font-inter), Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: '1rem',
    lineHeight: '1.65',
    fontWeight: '400',
    letterSpacing: '-0.011em',
  },
  product: {
    fontSize: '1.125rem',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  price: {
    fontSize: '1.25rem',
    lineHeight: '1.4',
    fontWeight: '600',
    fontVariantNumeric: 'tabular-nums',
  },
  caption: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontWeight: '400',
    letterSpacing: '-0.011em',
    color: 'var(--color-warm-sepia)',
  }
} as const;
