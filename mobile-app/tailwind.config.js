/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Catppuccin Mocha theme
        base: {
          DEFAULT: '#1e1e2e',
          mantle: '#181825',
          crust: '#11111b',
        },
        text: {
          DEFAULT: '#cdd6f4',
          muted: '#a6adc8',
          subtle: '#6c7086',
        },
        surface: {
          DEFAULT: '#313244',
          hover: '#45475a',
        },
        accent: {
          blue: '#89b4fa',
          green: '#a6e3a1',
          yellow: '#f9e2af',
          red: '#f38ba8',
          purple: '#cba6f7',
          teal: '#94e2d5',
        },
      },
    },
  },
  plugins: [],
};