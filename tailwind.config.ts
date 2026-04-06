import type {Config} from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1a2744',
        orange: '#bb4a28',
        green: '#82c80b',
        cream: '#fafaf8',
        charcoal: '#2a2a2a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
