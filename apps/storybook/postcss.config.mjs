/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-xl': '88em',
        'mantine-breakpoint-xs': '36em',
      },
    },
  },
};

export default config;
