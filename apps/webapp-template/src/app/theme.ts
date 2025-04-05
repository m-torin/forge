import { createTheme } from "@mantine/core";

import type { MantineTheme, MantineThemeOverride } from "@mantine/core";

// Use MantineThemeOverride for the configuration object
const themeOverride: MantineThemeOverride = {
  // Set primary color to use the brand colors
  primaryColor: "brand",

  // Define custom breakpoints
  breakpoints: {
    lg: "75em",
    md: "62em",
    sm: "48em",
    xl: "88em",
    xs: "36em",
  },

  // Define custom color palette
  colors: {
    brand: [
      "#e6f7ff",
      "#bae7ff",
      "#91d5ff",
      "#69c0ff",
      "#40a9ff",
      "#1890ff",
      "#096dd9",
      "#0050b3",
      "#003a8c",
      "#002766",
    ],
  },

  // Add default radius for better consistency
  defaultRadius: "md",

  // Ensure contrast for better accessibility
  autoContrast: true,

  // Add other commonly used theme settings
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",

  // Use the recommended focus ring setting
  focusRing: "auto",
};

export const theme = createTheme(themeOverride) as MantineTheme;
