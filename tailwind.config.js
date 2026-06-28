/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-void': '#06070B',
        'bg-panel': '#0E1018',
        'accent-primary': '#3DE7FF',
        'accent-secondary': '#8B5CF6',
        'accent-danger': '#FF4D6D',
        'accent-success': '#39FF8E',
        'text-primary': '#EAF6FF',
        'text-secondary': '#7E8AA3',
      },
      fontFamily: {
        mono: ['SF Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        panel: '20px',
        chip: '12px',
      },
    },
  },
  plugins: [],
};
