/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0A0A0F',
        surface: '#131318',
        surfaceSoft: '#181824',
        surfaceStrong: '#1f1c2f',
        violet: {
          950: '#120f1f',
          900: '#1f173c',
          700: '#7c3aed',
          600: '#8b5cf6',
          500: '#a855f7',
        },
        accent: '#A855F7',
        glow: '#d8b4fe',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 30px 80px rgba(139, 92, 246, 0.18)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
