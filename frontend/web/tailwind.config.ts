import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce-slow 1.2s linear infinite',
      },
      keyframes: {
        bounce: {
          '0%, 100%': {
            transform: 'translateY(-50%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },

        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(-10%)',
            'animation-timing-function': 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
      },
    },
  },
  daisyui: {
    themes: [
      {
        // https://github.com/Serendipity-Theme/daisy-ui
        fastotate: {
          primary: '#EE8679',
          secondary: '#F8D2C9',
          accent: '#5BA2D0',
          neutral: '#DEE0EF',
          'base-100': '#151726',
          info: '#94B8FF',
          success: '#33ddbe',
          warning: '#f6c33f',
          error: '#F87272',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
};
export default config;
