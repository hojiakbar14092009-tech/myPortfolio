/** @type {import('tailwindcss').Config} */
// Colors resolve to CSS variables from src/styles/tokens.css so the light/dark toggle is one attribute flip.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        line: 'rgb(var(--fg) / 0.12)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Clash Display"', '"Inter Tight Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Tight Variable"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', '"SFMono-Regular"', 'Consolas', 'monospace'],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      screens: { xs: '400px' },
    },
  },
  plugins: [],
};
