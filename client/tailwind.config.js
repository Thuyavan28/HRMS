/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#080B0F',
          900: '#0D1117', // Main background
          850: '#121720',
          800: '#161D27', // Card surface
          750: '#1C2533',
          700: '#212B3B', // Border / elevated surface
          600: '#2A374A', // Secondary border / hover
          500: '#3D4D65',
          400: '#64748B',
          300: '#94A3B8',
          200: '#CBD5E1',
          100: '#F1F5F9'
        },
        teal: {
          400: '#14F1B7',
          500: '#00C896', // Dayflow brand accent
          600: '#00B386',
          700: '#008E6A',
          800: '#006B50',
          900: '#004735',
          glow: 'rgba(0, 200, 150, 0.18)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(0, 200, 150, 0.35)',
        'glow-teal-sm': '0 0 10px -2px rgba(0, 200, 150, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'dropdown-dark': '0 10px 30px -5px rgba(0, 0, 0, 0.7)'
      }
    },
  },
  plugins: [],
}
