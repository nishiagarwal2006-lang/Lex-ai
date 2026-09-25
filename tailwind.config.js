/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#08080c',
        'neon-magenta': '#ff2dce',
        'neon-cyan': '#00f5ff',
        'neon-violet': '#8b5cf6',
        'neon-indigo': '#6366f1',
        'risk-high': '#ff2d55',
        'risk-medium': '#ff9f0a',
        'risk-low': '#30d158',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-muted': '#475569',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
