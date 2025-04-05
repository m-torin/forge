// @ts-ignore - postcss-load-config doesn't have type definitions
import type { Config } from "postcss-load-config";

const config: Config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
