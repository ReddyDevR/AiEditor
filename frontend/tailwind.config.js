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
        studio: {
          bg: '#090b10',
          sidebar: '#0d1017',
          card: '#131823',
          border: '#1f2636',
          hover: '#252d40',
          accent: '#e11d48',
          accentHover: '#f43f5e',
          claude: '#d97706',
          claudeBg: '#1c150c',
          claudeBorder: '#452b0f'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Telugu', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        telugu: ['Noto Sans Telugu', 'sans-serif']
      }
    },
  },
  plugins: [],
}
