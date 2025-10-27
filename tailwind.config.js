/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spooky: {
          bg: '#0a0a0a',
          card: '#1a1a1a',
          accent: '#2a1810',
          orange: '#ff6b35',
          purple: '#6b46c1',
          green: '#10b981',
          red: '#ef4444',
          gray: '#374151'
        }
      },
      fontFamily: {
        spooky: ['Creepster', 'cursive'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'spooky': '0 4px 20px rgba(255, 107, 53, 0.3)',
        'spooky-lg': '0 10px 40px rgba(255, 107, 53, 0.4)'
      }
    },
  },
  plugins: [],
}