import { createTheme, MantineThemeOverride, MantineTheme } from '@mantine/core';

// Use MantineThemeOverride for the configuration object
const themeOverride: MantineThemeOverride = {
  // Set primary color to use the brand colors
  primaryColor: 'brand',

  // Define custom breakpoints
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },

  // Define custom color palette
  colors: {
    brand: [
      '#e6f7ff',
      '#bae7ff',
      '#91d5ff',
      '#69c0ff',
      '#40a9ff',
      '#1890ff',
      '#096dd9',
      '#0050b3',
      '#003a8c',
      '#002766',
    ],
  },

  // Add default radius for better consistency
  defaultRadius: 'md',

  // Ensure contrast for better accessibility
  autoContrast: true,

  // Add other commonly used theme settings
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',

  // Use the recommended focus ring setting
  focusRing: 'auto',
};

export const theme = createTheme(themeOverride) as MantineTheme;
