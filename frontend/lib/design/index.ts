/**
 * Design system public API — tokens + 3D material presets.
 *
 * @example
 * import { tokens, materialPresets, brandColors } from '@/lib/design';
 */

export {
  tokens,
  brandColors,
  colorTokens,
  typographyTokens,
  fontFamilyTokens,
  fontSizeScale,
  spacingTokens,
  semanticSpacing,
  shadowTokens,
  radiusTokens,
  glassTokens,
  animationTokens,
  easingTokens,
  durationTokens,
  durationSeconds,
} from '../tokens';

export type {
  ColorToken,
  BrandColor,
  TypographyRole,
  SpacingToken,
  ShadowToken,
  RadiusToken,
  GlassToken,
  EasingToken,
  DurationToken,
  DesignTokens,
} from '../tokens';

export {
  materialPresets,
  materialPresetList,
  notebookLeather,
  brassFoil,
  paper,
  ceramicMug,
  lampMetal,
  woodDesk,
} from '../materials';

export type { MaterialPreset, MaterialPresetKey } from '../materials';
