import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Background colors (pure black theme for OLED)
        'bg-primary': '#000000',
        'bg-secondary': '#0a0a0a',
        'bg-elevated': '#141414',

        // UI accent colors
        'ui-red': '#ff4444',
        'ui-green': '#00ff88',
        'ui-yellow': '#ffcc00',
        'ui-blue': '#00aaff',

        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#888888',
        'text-disabled': '#444444',

        // UI element states
        'hover-overlay': 'rgba(255, 255, 255, 0.05)',
        'active-overlay': 'rgba(255, 255, 255, 0.1)',
        'border-color': '#222222',

        // Audio visualization
        'waveform': '#00ff88',
        'spectrum': '#00aaff',
        'peak-warning': '#ffcc00',
        'peak-danger': '#ff4444',

        // Semantic colors (mapped to design system)
        border: '#222222',
        input: '#141414',
        ring: '#00aaff',
        background: '#000000',
        foreground: '#ffffff',
        primary: {
          DEFAULT: '#00aaff',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#141414',
          foreground: '#888888',
        },
        destructive: {
          DEFAULT: '#ff4444',
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#00ff88',
          foreground: '#000000',
        },
        warning: {
          DEFAULT: '#ffcc00',
          foreground: '#000000',
        },
        muted: {
          DEFAULT: '#141414',
          foreground: '#888888',
        },
        accent: {
          DEFAULT: '#00ff88',
          foreground: '#000000',
        },
        popover: {
          DEFAULT: '#141414',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#141414',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        // 8px grid system
        '0.5': '4px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '10': '80px',
        '12': '96px',
        '16': '128px',
      },
      boxShadow: {
        'card': '0px 4px 12px rgba(0, 0, 0, 0.3)',
        'elevated': '0px 8px 24px rgba(0, 0, 0, 0.4)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 170, 255, 0.3)',
        'glow-red': '0 0 20px rgba(255, 68, 68, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
