import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        handwritten: ['Mrs Saint Delafield', 'cursive'],
      },
      colors: {
        cream: '#faf8f5',
        warm: {
          DEFAULT: '#8b7355',
          light: '#a89279',
          dark: '#6b5740',
        },
      },
    },
  },
  plugins: [],
};

export default config;
