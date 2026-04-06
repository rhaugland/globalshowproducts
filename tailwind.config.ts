import type {Config} from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors from globalshowproducts.com
        navy: '#1a2744',
        orange: '#bb4a28',
        green: '#82c80b',
        cyan: '#01acd3',
        cream: '#fafaf8',
        charcoal: '#2a2a2a',
        sage: '#deeae6',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1a2744 0%, #01acd3 100%)',
        'fun-gradient': 'linear-gradient(135deg, #bb4a28 0%, #82c80b 100%)',
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
