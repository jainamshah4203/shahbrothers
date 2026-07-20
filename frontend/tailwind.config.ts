import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
				// Design System Colors
				'warm-white': {
					50: '#FCFCFB',
					100: '#F9F8F6',
					200: '#F3F0EB',
				},
				'soft-black': {
					900: '#1A1A1A',
					800: '#2A2A2A',
					700: '#3A3A3A',
				},
				wood: {
					100: '#E6D3C1',
					300: '#C29B75',
					500: '#94663F',
					700: '#694121',
					900: '#3D220E',
				},
				aluminum: {
					100: '#F2F2F2',
					300: '#D9D9D9',
					500: '#B3B3B3',
					700: '#808080',
					900: '#4D4D4D',
				},
				leather: {
					100: '#F2DFD3',
					300: '#D9A582',
					500: '#B36430',
					700: '#7F4016',
					900: '#4A2309',
				},
				'warm-gray': {
					100: '#F5F5F4',
					300: '#D6D3D1',
					500: '#A8A29E',
					700: '#57534E',
					900: '#292524',
				},
			},
			spacing: {
				'0': '0px',
				'1': '4px',
				'2': '8px',
				'3': '12px',
				'4': '16px',
				'5': '20px',
				'6': '24px',
				'8': '32px',
				'10': '40px',
				'12': '48px',
				'16': '64px',
				'20': '80px',
				'24': '96px',
				'32': '128px',
				'40': '160px',
				'48': '192px',
				'64': '256px',
			},
			boxShadow: {
				'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'elevation-2': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'elevation-3': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				floating: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
				glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
				premium: '0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3)',
				inset: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'token-sm': '0.25rem',
				'token-md': '0.5rem',
				'token-lg': '0.75rem',
				'token-xl': '1rem',
				'token-2xl': '1.5rem',
			},
			fontSize: {
				'ds-hero': ['clamp(3rem, 5vw + 1rem, 5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
				'ds-section': ['clamp(2rem, 3vw + 1rem, 3.5rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
				'ds-subtitle': ['1.5rem', { lineHeight: '1.4', fontWeight: '500' }],
				'ds-body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
				'ds-product': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
				'ds-price': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
				'ds-caption': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],
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
