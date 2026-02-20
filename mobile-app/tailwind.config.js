/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Syrian Sovereign Emerald Theme
        primary: {
          DEFAULT: '#0F3D2E',
          dark: '#0B2F24',
        },
        secondary: '#1C5C45',
        accent: {
          gold: '#C9A646',
          softGold: '#E5C878',
        },
        background: '#071F18',
        surface: 'rgba(15,61,46,0.90)',
        glass: 'rgba(255,255,255,0.05)',
        border: {
          gold: 'rgba(201,166,70,0.30)',
          soft: 'rgba(201,166,70,0.15)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255,255,255,0.75)',
          muted: 'rgba(255,255,255,0.5)',
        },
        // Legacy support
        base: {
          DEFAULT: '#0F3D2E',
          mantle: '#0B2F24',
          crust: '#071F18',
        },
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(180deg, #0B2F24, #071F18)',
        'gold-gradient': 'linear-gradient(90deg, #C9A646, #E5C878)',
      },
      borderRadius: {
        'card': '22px',
        'button': '14px',
        'input': '14px',
      },
      boxShadow: {
        'gold': '0 4px 14px rgba(201,166,70,0.4)',
        'soft-dark': '0 4px 20px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};