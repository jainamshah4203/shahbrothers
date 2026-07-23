import type { Config } from "tailwindcss";
import {
	colorTokens,
	shadowTokens,
	spacingTokens,
	radiusTokens,
	easingTokens,
	durationTokens,
} from "./lib/tokens";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: [
					'var(--font-plus-jakarta)',
					'Plus Jakarta Sans',
					'ui-sans-serif',
					'system-ui',
					'sans-serif',
				],
				serif: [
					'var(--font-cormorant)',
					'Cormorant Garamond',
					'Georgia',
					'Times New Roman',
					'serif',
				],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Luxury stationery palette — ban slate/zinc defaults in UI
				'warm-off-white': colorTokens['warm-off-white'],
				cream: {
					DEFAULT: colorTokens.cream,
					50: colorTokens['warm-off-white'],
					100: colorTokens.cream,
					200: colorTokens.linen,
				},
				linen: colorTokens.linen,
				'charcoal-ink': colorTokens['charcoal-ink'],
				'warm-sepia': colorTokens['warm-sepia'],
				'muted-sepia': colorTokens['muted-sepia'],
				brass: colorTokens.brass,
				'gold-foil': colorTokens['gold-foil'],
				terracotta: colorTokens.terracotta,
				'fountain-navy': colorTokens['fountain-navy'],
				'silver-foil': colorTokens['silver-foil'],
				'warm-white': {
					50: colorTokens['warm-white-50'],
					100: colorTokens['warm-white-100'],
					200: colorTokens['warm-white-200'],
				},
				'soft-black': {
					900: colorTokens['soft-black-900'],
					800: colorTokens['soft-black-800'],
					700: colorTokens['soft-black-700'],
				},
				wood: {
					100: colorTokens['wood-100'],
					300: colorTokens['wood-300'],
					500: colorTokens['wood-500'],
					700: colorTokens['wood-700'],
					900: colorTokens['wood-900'],
				},
				aluminum: {
					100: colorTokens['aluminum-100'],
					300: colorTokens['aluminum-300'],
					500: colorTokens['aluminum-500'],
					700: colorTokens['aluminum-700'],
					900: colorTokens['aluminum-900'],
				},
				leather: {
					100: colorTokens['leather-100'],
					300: colorTokens['leather-300'],
					500: colorTokens['leather-500'],
					700: colorTokens['leather-700'],
					900: colorTokens['leather-900'],
				},
				'warm-gray': {
					100: colorTokens['warm-gray-100'],
					300: colorTokens['warm-gray-300'],
					500: colorTokens['warm-gray-500'],
					700: colorTokens['warm-gray-700'],
					900: colorTokens['warm-gray-900'],
				},
			},
			spacing: { ...spacingTokens },
			boxShadow: {
				'elevation-1': shadowTokens['elevation-1'],
				'elevation-2': shadowTokens['elevation-2'],
				'elevation-3': shadowTokens['elevation-3'],
				floating: shadowTokens.floating,
				glass: shadowTokens.glass,
				premium: shadowTokens.premium,
				inset: shadowTokens.inset,
				editorial: shadowTokens.editorial,
				paper: shadowTokens.paper,
				deboss: shadowTokens.deboss,
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'token-sm': radiusTokens.sm,
				'token-md': radiusTokens.md,
				'token-lg': radiusTokens.lg,
				'token-xl': radiusTokens.xl,
				'token-2xl': radiusTokens['2xl'],
				'token-3xl': radiusTokens['3xl'],
			},
			fontSize: {
				'ds-hero': ['clamp(3rem, 5vw + 1rem, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '500' }],
				'ds-section': ['clamp(2rem, 3vw + 1rem, 3.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '500' }],
				'ds-subtitle': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
				'ds-body': ['1rem', { lineHeight: '1.65', letterSpacing: '-0.011em', fontWeight: '400' }],
				'ds-product': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
				'ds-price': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
				'ds-caption': ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.011em', fontWeight: '400' }],
				'ds-overline': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.12em', fontWeight: '600' }],
			},
			letterSpacing: {
				tightest: '-0.02em',
				tighter: '-0.015em',
				tight: '-0.011em',
			},
			lineHeight: {
				body: '1.65',
				relaxed: '1.7',
			},
			transitionTimingFunction: {
				'out': easingTokens.out,
				'out-strong': easingTokens.outStrong,
				'out-soft': easingTokens.outSoft,
				'in': easingTokens.in,
				'in-out': easingTokens.inOut,
				'in-out-strong': easingTokens.inOutStrong,
				luxury: easingTokens.luxury,
				spring: easingTokens.spring,
			},
			transitionDuration: {
				click: durationTokens.click,
				fast: durationTokens.fast,
				exit: durationTokens.exit,
				hover: durationTokens.hover,
				medium: durationTokens.medium,
				slow: durationTokens.slow,
				luxury: durationTokens.luxury,
				hero: durationTokens.hero,
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};
export default config;
