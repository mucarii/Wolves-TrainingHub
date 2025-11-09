/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        wolves: {
          navy: '#0F172A',
          navySoft: '#111827',
          slate: '#1E293B',
          card: '#111827',
          border: '#1F2937',
          text: '#E2E8F0',
          muted: '#94A3B8',
          accent: '#1D4ED8',
          accentSoft: '#3B82F6',
          accentContrast: '#E0F2FE',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      boxShadow: {
        card: '0 15px 50px rgba(8, 15, 40, 0.4)',
      },
      backgroundImage: {
        'wolves-gradient':
          'linear-gradient(135deg, #0F62FE 0%, #2563EB 45%, #1E1B4B 100%)',
      },
    },
  },
  plugins: [],
}
