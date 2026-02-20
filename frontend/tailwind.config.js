/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Syrian Arab Republic Theme
        bg: {
          primary: '#002323',
          secondary: '#012b2b',
          tertiary: '#013333',
          elevated: '#0a3a3a',
        },
        brand: {
          eagle: '#d4b06a',
          eagleDark: '#b9944d',
        },
        text: {
          primary: '#f5f2e9',
          secondary: '#e1dac8',
          muted: '#9b9380',
          accent: '#d4b06a',
        },
        accent: {
          primary: '#d4b06a',
          primaryHover: '#e1c37e',
          secondary: '#7aa2f7',
          success: '#9ece6a',
          warning: '#e0af68',
          error: '#f7768e',
        },
        border: {
          DEFAULT: '#124040',
          muted: '#0c2b2b',
          focus: '#d4b06a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        arabic: ['Cairo', 'Noto Sans Arabic', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 18px 45px rgba(0, 0, 0, 0.65)',
      },
      backgroundImage: {
        'syrian-pattern': "url('/src/assets/branding/syrian_geometric_pattern.svg')",
      },
    },
  },
  plugins: [],
}