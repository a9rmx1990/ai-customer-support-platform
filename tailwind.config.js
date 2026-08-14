/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7a96fb',
          500: '#4f69f6',
          600: '#3847ed',
          700: '#2b34da',
          800: '#272cb1',
          900: '#242a8c',
          950: '#151754',
        },
      },
    },
  },
  plugins: [],
}
