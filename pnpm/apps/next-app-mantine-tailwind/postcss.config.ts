// postcss.config.ts
// Define the Config type locally since it's not exported from postcss
type Config = {
  plugins: Record<string, Record<string, any>>;
};

const config: Config = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
  },
};

export default config;
