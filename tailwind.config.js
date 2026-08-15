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
      fontFamily: {
        display: ['var(--font-jakarta)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        ink: '#07090e',
        'surface-base': '#0c101a',
        'surface-elevated': '#121827',
        'surface-overlay': '#192237',
        'triage-border': 'rgba(255, 255, 255, 0.07)',
        'triage-border-active': 'rgba(0, 214, 150, 0.35)',
        'clinical-mint': '#00d696',
        'clinical-cyan': '#00a8cc',
        'signal-amber': '#e69900',
        'signal-violet': '#7c5cff',
        // Legacy fallbacks mapped cleanly
        obsidian: {
          950: '#07090e',
          900: '#0c101a',
          800: '#121827',
          700: '#192237',
        },
        medical: {
          accent: '#00d696',
          dark: '#006b52',
        },
        shopping: {
          accent: '#e69900',
          dark: '#7a4f00',
        },
        saas: {
          accent: '#7c5cff',
          dark: '#341a99',
        },
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}


