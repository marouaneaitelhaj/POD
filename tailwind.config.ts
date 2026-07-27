import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#121417',
          raised: '#1a1d21',
          elevated: '#212429',
          border: '#2b2f36',
        },
        accent: {
          DEFAULT: '#22d3ee',
          hover: '#67e8f9',
          muted: '#0e7490',
        },
        risk: {
          low: '#34d399',
          medium: '#fbbf24',
          high: '#f87171',
          unknown: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        elevated: '0 4px 24px -4px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;
