import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Calm 主题色系（Linear / Vercel 风格）
        calm: {
          bg:      '#0A0A0B',
          surface: '#111113',
          border:  '#1F1F23',
          text:    '#FFFFFF',
          muted:   '#888890',
          accent:  '#5B5BD6',
        },
        // Warm Glass 主题色系（delight.ai 风格）
        glass: {
          text:   '#1A1A2E',
          muted:  '#666680',
          accent: '#7C6AC7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
