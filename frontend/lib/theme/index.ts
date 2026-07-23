/**
 * Theme helpers — data-only CSS variable maps for next-themes / runtime injection.
 * No React UI. Apply via `document.documentElement.style` or a `<style>` tag.
 */

import { brandColors, colorTokens } from '../tokens/colors';
import { shadowTokens } from '../tokens/shadows';
import { glassTokens } from '../tokens/glass';
import { radiusTokens } from '../tokens/radius';
import { easingTokens, durationTokens } from '../tokens/animation';
import { fontFamilyTokens } from '../tokens/typography';

export type ThemeMode = 'light' | 'dark';

/** Brand hex CSS custom properties (shared across modes) */
export const brandCssVars: Record<string, string> = {
  '--color-warm-off-white': brandColors.warmOffWhite,
  '--color-cream': brandColors.cream,
  '--color-linen': brandColors.linen,
  '--color-charcoal-ink': brandColors.charcoalInk,
  '--color-muted-sepia': brandColors.mutedSepia,
  '--color-warm-sepia': brandColors.mutedSepia,
  '--color-brass': brandColors.brass,
  '--color-gold-foil': brandColors.brass,
  '--color-terracotta': brandColors.terracotta,
  '--color-fountain-navy': brandColors.fountainNavy,
  '--color-silver-foil': colorTokens['silver-foil'],
  '--paper-shadow': shadowTokens.paper,
  '--shadow-premium': shadowTokens.premium,
  '--paper-grain-opacity': '0.045',
  '--radius': radiusTokens.lg,
  '--font-family-sans': fontFamilyTokens.sans,
  '--font-family-serif': fontFamilyTokens.serif,
  '--ease-out': easingTokens.out,
  '--ease-out-strong': easingTokens.outStrong,
  '--ease-luxury': easingTokens.luxury,
  '--ease-spring': easingTokens.spring,
  '--duration-fast': durationTokens.fast,
  '--duration-medium': durationTokens.medium,
  '--duration-slow': durationTokens.slow,
  '--duration-luxury': durationTokens.luxury,
  '--glass-nav-bg': glassTokens.nav.background,
  '--glass-nav-blur': glassTokens.nav.blur,
  '--glass-panel-bg': glassTokens.panel.background,
  '--glass-panel-blur': glassTokens.panel.blur,
};

/** shadcn HSL channel values (without hsl()) for light mode */
export const lightThemeCssVars: Record<string, string> = {
  '--background': '48 33% 97%',
  '--foreground': '0 0% 10%',
  '--card': '42 31% 94%',
  '--card-foreground': '0 0% 10%',
  '--popover': '48 33% 97%',
  '--popover-foreground': '0 0% 10%',
  '--primary': '0 0% 10%',
  '--primary-foreground': '48 33% 97%',
  '--secondary': '42 31% 94%',
  '--secondary-foreground': '0 0% 10%',
  '--muted': '39 22% 92%',
  '--muted-foreground': '28 8% 27%',
  '--accent': '39 22% 92%',
  '--accent-foreground': '0 0% 10%',
  '--destructive': '9 52% 50%',
  '--destructive-foreground': '48 33% 97%',
  '--border': '39 18% 88%',
  '--input': '39 18% 88%',
  '--ring': '0 0% 10%',
  '--hero-gradient': 'linear-gradient(135deg, hsl(42 31% 94%), hsl(48 33% 97%))',
  '--product-hover': '39 22% 90%',
  '--sidebar-background': '48 33% 97%',
  '--sidebar-foreground': '0 0% 10%',
  '--sidebar-primary': '0 0% 10%',
  '--sidebar-primary-foreground': '48 33% 97%',
  '--sidebar-accent': '42 31% 94%',
  '--sidebar-accent-foreground': '0 0% 10%',
  '--sidebar-border': '39 18% 88%',
  '--sidebar-ring': '0 0% 10%',
};

/** Dark mode HSL channels — fountain-navy leaning, warm paper ink inverted */
export const darkThemeCssVars: Record<string, string> = {
  '--background': '210 40% 10%',
  '--foreground': '48 20% 95%',
  '--card': '210 35% 12%',
  '--card-foreground': '48 20% 95%',
  '--popover': '210 35% 12%',
  '--popover-foreground': '48 20% 95%',
  '--primary': '48 20% 95%',
  '--primary-foreground': '0 0% 10%',
  '--secondary': '210 25% 16%',
  '--secondary-foreground': '48 20% 95%',
  '--muted': '210 25% 16%',
  '--muted-foreground': '30 10% 65%',
  '--accent': '210 25% 18%',
  '--accent-foreground': '48 20% 95%',
  '--destructive': '9 52% 40%',
  '--destructive-foreground': '48 20% 95%',
  '--border': '210 20% 20%',
  '--input': '210 20% 20%',
  '--ring': '48 20% 95%',
  '--hero-gradient': 'linear-gradient(135deg, hsl(210 35% 14%), hsl(210 40% 10%))',
  '--product-hover': '210 25% 16%',
  '--sidebar-background': '210 40% 10%',
  '--sidebar-foreground': '48 20% 95%',
  '--sidebar-primary': '48 20% 95%',
  '--sidebar-primary-foreground': '0 0% 10%',
  '--sidebar-accent': '210 25% 16%',
  '--sidebar-accent-foreground': '48 20% 95%',
  '--sidebar-border': '210 20% 20%',
  '--sidebar-ring': '48 20% 95%',
};

export function getThemeCssVars(mode: ThemeMode = 'light'): Record<string, string> {
  const modeVars = mode === 'dark' ? darkThemeCssVars : lightThemeCssVars;
  return { ...brandCssVars, ...modeVars };
}

/**
 * Serialize CSS vars into a declaration block string for injection.
 * @example
 * const css = `:root { ${serializeCssVars(getThemeCssVars('light'))} }`
 */
export function serializeCssVars(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
}

/** Apply vars to an element (typically `document.documentElement`). */
export function applyCssVars(
  target: { style: { setProperty(name: string, value: string): void } },
  vars: Record<string, string>,
): void {
  for (const [name, value] of Object.entries(vars)) {
    target.style.setProperty(name, value);
  }
}
