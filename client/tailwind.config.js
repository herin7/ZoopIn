/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD400',
          black: '#000000',
          blue: '#3264FF',
          'blue-hover': '#2D5AE5',
        },
        surface: {
          light: '#FFD400',
          dark: '#000000',
          card: '#FFFFFF',
          muted: '#F9FAFB',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0,0,0,0.1)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.15)',
        'soft': '0 2px 6px rgba(0,0,0,0.05)',
      },
      animation: {
        'float-emoji': 'float-emoji 2s ease-out forwards',
        'pulse-live': 'pulse-live 1.2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'snap-in': 'snap-in 0.35s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        'float-emoji': {
          '0%': { opacity: '0', transform: 'translate3d(0,0,0) scale(0.9)' },
          '10%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translate3d(0,-200px,0) scale(1.25)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'snap-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
