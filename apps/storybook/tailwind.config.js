/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../../packages/design-system/ciseco/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: false,
  },
  plugins: [],
  presets: [require('tailwind-preset-mantine')],
  theme: {
    extend: {},
  },
};
