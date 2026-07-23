/**
 * Shah Brothers design tokens — single source of truth for
 * color, type, space, elevation, glass, radius, and animation values.
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';
export * from './radius';
export * from './glass';
export * from './animation';

import { colorTokens, brandColors } from './colors';
import { typographyTokens, fontFamilyTokens, fontSizeScale } from './typography';
import { spacingTokens, semanticSpacing } from './spacing';
import { shadowTokens } from './shadows';
import { radiusTokens } from './radius';
import { glassTokens } from './glass';
import { animationTokens, easingTokens, durationTokens, durationSeconds } from './animation';

export const tokens = {
  brand: brandColors,
  color: colorTokens,
  typography: typographyTokens,
  fontFamily: fontFamilyTokens,
  fontSize: fontSizeScale,
  spacing: spacingTokens,
  semanticSpacing,
  shadow: shadowTokens,
  radius: radiusTokens,
  glass: glassTokens,
  animation: animationTokens,
  easing: easingTokens,
  duration: durationTokens,
  durationSeconds,
} as const;

export type DesignTokens = typeof tokens;
