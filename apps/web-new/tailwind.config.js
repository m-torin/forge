/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content detection is now handled by @source directives in CSS
  // But keeping this for backward compatibility with tools that might need it
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require("tailwind-preset-mantine")],
  corePlugins: {
    preflight: false, // Important: Let Mantine handle preflight styles
  },
};
