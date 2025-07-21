import type { Config } from 'tailwindcss';
// import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    screens: {
      sm: '375px',
      md: '744px',
      lg: '1024px',
    },
    extend: {
      // fontFamily: {
      //   sans: ['Pretendard', 'sans-serif'],
      // },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        gray: {
          white: '#ffffff',
          light: '#D9D9D9',
          darker: '#4B5563',
          black: '#1F2937',
        },
        yellow: {
          'normal-01': '#FFDE5B',
        },
      },
    },
  },
  // plugins: [
  //   plugin(({ addUtilities }) => {
  //     addUtilities({
  //       '.hover-dim': {
  //         '@apply transition-all duration-150 hover:brightness-90': {},
  //       },
  //     });
  //   }),
  // ],
};

export default config;
