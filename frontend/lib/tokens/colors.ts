/**
 * Shah Brothers brand colors.
 * Surfaces: Warm Off-White / Cream / Linen.
 * Ink: Charcoal / Muted Sepia.
 * Accents: Brass / Terracotta / Fountain Navy.
 * Do NOT introduce Tailwind slate / zinc / gray in new utilities.
 */

export const brandColors = {
  warmOffWhite: '#FAF9F5',
  cream: '#F4F1EA',
  linen: '#EFECE6',
  charcoalInk: '#1A1A1A',
  mutedSepia: '#4A443F',
  brass: '#D4AF37',
  terracotta: '#C2593F',
  fountainNavy: '#1C2D42',
} as const;

export const colorTokens = {
  // Surfaces — paper canvas
  'warm-off-white': brandColors.warmOffWhite,
  cream: brandColors.cream,
  linen: brandColors.linen,

  // Legacy warm-white aliases
  'warm-white-50': brandColors.warmOffWhite,
  'warm-white-100': brandColors.cream,
  'warm-white-200': brandColors.linen,

  // Ink & sepia
  'charcoal-ink': brandColors.charcoalInk,
  'muted-sepia': brandColors.mutedSepia,
  'warm-sepia': brandColors.mutedSepia,

  // Accents — foil & instrument
  brass: brandColors.brass,
  'gold-foil': brandColors.brass,
  terracotta: brandColors.terracotta,
  'fountain-navy': brandColors.fountainNavy,

  // Soft Blacks
  'soft-black-900': brandColors.charcoalInk,
  'soft-black-800': '#2A2A2A',
  'soft-black-700': '#3A3A3A',

  // Wood
  'wood-100': '#E6D3C1',
  'wood-300': '#C29B75',
  'wood-500': '#94663F',
  'wood-700': '#694121',
  'wood-900': '#3D220E',

  // Brushed Aluminum (silver foil)
  'aluminum-100': '#F2F2F2',
  'aluminum-300': '#D9D9D9',
  'aluminum-500': '#B3B3B3',
  'aluminum-700': '#808080',
  'aluminum-900': '#4D4D4D',
  'silver-foil': '#C0C0C0',

  // Leather Brown
  'leather-100': '#F2DFD3',
  'leather-300': '#D9A582',
  'leather-500': '#B36430',
  'leather-700': '#7F4016',
  'leather-900': '#4A2309',

  // Warm Gray (stationery neutrals — never use Tailwind slate/zinc)
  'warm-gray-100': brandColors.cream,
  'warm-gray-300': '#D6D3D1',
  'warm-gray-500': '#A8A29E',
  'warm-gray-700': brandColors.mutedSepia,
  'warm-gray-900': brandColors.charcoalInk,
} as const;

export type ColorToken = keyof typeof colorTokens;
export type BrandColor = keyof typeof brandColors;
