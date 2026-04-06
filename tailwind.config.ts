import type {Config} from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors matched from globalshowproducts.com
        brand: {
          red: '#e74c4c',
          'red-dark': '#d43f3f',
          gray: '#32373c',
          'gray-light': '#636d7c',
          pink: '#ff6b81',
        },
        // Accent pops (from their product pages / brand logos)
        pop: {
          green: '#82c80b',
          cyan: '#01acd3',
          orange: '#f5a623',
          purple: '#9b59b6',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
