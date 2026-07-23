/**
 * Glass / frosted-surface tokens — Warm Off-White canvas, never cool slate.
 */

export const glassTokens = {
  DEFAULT: {
    background: 'rgba(250, 249, 245, 0.72)',
    blur: '16px',
    saturate: '1.2',
    border: '1px solid rgba(26, 26, 26, 0.06)',
    shadow: '0 8px 32px 0 rgba(26, 26, 26, 0.06)',
  },
  nav: {
    background: 'rgba(250, 249, 245, 0.78)',
    blur: '20px',
    saturate: '1.15',
    border: '1px solid rgba(26, 26, 26, 0.05)',
    shadow: '0 10px 30px -5px rgba(26, 26, 26, 0.04)',
  },
  panel: {
    background: 'rgba(250, 249, 245, 0.85)',
    blur: '24px',
    saturate: '1.1',
    border: '1px solid rgba(26, 26, 26, 0.07)',
    shadow: '0 10px 30px -5px rgba(26, 26, 26, 0.06)',
  },
  dark: {
    background: 'rgba(28, 45, 66, 0.12)',
    blur: '12px',
    saturate: '1',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    shadow: '0 8px 32px 0 rgba(26, 26, 26, 0.12)',
  },
} as const;

export type GlassToken = keyof typeof glassTokens;
