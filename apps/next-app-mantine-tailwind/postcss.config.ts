// Define the Config type locally since it's not exported from postcss
interface Config {
  plugins: Record<string, Record<string, unknown>>;
}

const config: Config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "postcss-preset-mantine": {},
    "postcss-simple-vars": {
      variables: {
        "mantine-breakpoint-lg": "75em",
        "mantine-breakpoint-md": "62em",
        "mantine-breakpoint-sm": "48em",
        "mantine-breakpoint-xl": "88em",
        "mantine-breakpoint-xs": "36em",
      },
    },
  },
};

export default config;
