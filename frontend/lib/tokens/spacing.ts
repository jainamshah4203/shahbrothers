/**
 * Spacing — 4px base unit on an 8px mathematical grid.
 */

export const spacingTokens = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  64: '256px',
} as const;

/** Semantic layout spacing for sections & gutters */
export const semanticSpacing = {
  gutter: spacingTokens[4],
  gutterLg: spacingTokens[6],
  stack: spacingTokens[8],
  sectionY: spacingTokens[16],
  sectionYMd: spacingTokens[24],
  sectionYLg: spacingTokens[32],
  pageX: spacingTokens[4],
  pageXMd: spacingTokens[6],
  pageXLg: spacingTokens[8],
} as const;

export type SpacingToken = keyof typeof spacingTokens;
