import { createTheme, MantineColorsTuple } from '@mantine/core';

// Unified color palette that works with both Mantine and Tailwind
const colors = {
  // Primary brand colors - modern blue palette
  primary: [
    '#f0f9ff', // 50
    '#e0f2fe', // 100
    '#bae6fd', // 200
    '#7dd3fc', // 300
    '#38bdf8', // 400
    '#0ea5e9', // 500 - main
    '#0284c7', // 600
    '#0369a1', // 700
    '#075985', // 800
    '#0c4a6e', // 900
  ] as MantineColorsTuple,

  // Secondary colors - warm accent
  secondary: [
    '#fef3c7', // 50
    '#fed7aa', // 100
    '#fdba74', // 200
    '#fb923c', // 300
    '#f97316', // 400
    '#ea580c', // 500 - main
    '#dc2626', // 600
    '#b91c1c', // 700
    '#991b1b', // 800
    '#7f1d1d', // 900
  ] as MantineColorsTuple,

  // Success colors - modern green
  success: [
    '#f0fdf4', // 50
    '#dcfce7', // 100
    '#bbf7d0', // 200
    '#86efac', // 300
    '#4ade80', // 400
    '#22c55e', // 500 - main
    '#16a34a', // 600
    '#15803d', // 700
    '#166534', // 800
    '#14532d', // 900
  ] as MantineColorsTuple,

  // Warning colors - amber palette
  warning: [
    '#fffbeb', // 50
    '#fef3c7', // 100
    '#fde68a', // 200
    '#fcd34d', // 300
    '#fbbf24', // 400
    '#f59e0b', // 500 - main
    '#d97706', // 600
    '#b45309', // 700
    '#92400e', // 800
    '#78350f', // 900
  ] as MantineColorsTuple,

  // Error colors - modern red
  error: [
    '#fef2f2', // 50
    '#fee2e2', // 100
    '#fecaca', // 200
    '#fca5a5', // 300
    '#f87171', // 400
    '#ef4444', // 500 - main
    '#dc2626', // 600
    '#b91c1c', // 700
    '#991b1b', // 800
    '#7f1d1d', // 900
  ] as MantineColorsTuple,

  // Neutral grays - modern warm grays
  gray: [
    '#fafaf9', // 50
    '#f5f5f4', // 100
    '#e7e5e4', // 200
    '#d6d3d1', // 300
    '#a8a29e', // 400
    '#78716c', // 500
    '#57534e', // 600
    '#44403c', // 700
    '#292524', // 800
    '#1c1917', // 900
  ] as MantineColorsTuple,
};

const theme = createTheme({
  // Unified breakpoints that match Tailwind defaults
  breakpoints: {
    xs: '30em', // 480px - mobile landscape
    sm: '48em', // 768px - tablet
    md: '64em', // 1024px - laptop
    lg: '80em', // 1280px - desktop
    xl: '96em', // 1536px - large desktop
  },

  // Color system
  colors: {
    // Map to semantic names
    brand: colors.primary,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    gray: colors.gray,
  },

  // Set primary color
  primaryColor: 'primary',

  // Typography scale
  fontSizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    md: '1rem', // 16px - base
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
  },

  // Spacing scale that matches Tailwind
  spacing: {
    xs: '0.5rem', // 8px
    sm: '0.75rem', // 12px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },

  // Shadow system
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Border radius scale
  radius: {
    xs: '0.25rem', // 4px
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
  },

  // Component default styles
  components: {
    Button: {
      styles: {
        root: {
          fontWeight: 500,
          transition: 'all 150ms ease',
        },
      },
    },
    Card: {
      styles: {
        root: {
          transition: 'all 150ms ease',
        },
      },
    },
    Modal: {
      styles: {
        content: {
          borderRadius: 'var(--mantine-radius-lg)',
        },
      },
    },
  },

  // Dark color scheme overrides
  other: {
    // Custom properties for Tailwind integration
    cssVariables: {
      light: {
        '--color-primary-50': colors.primary[0],
        '--color-primary-100': colors.primary[1],
        '--color-primary-500': colors.primary[5],
        '--color-primary-600': colors.primary[6],
        '--color-primary-900': colors.primary[9],
        '--color-gray-50': colors.gray[0],
        '--color-gray-100': colors.gray[1],
        '--color-gray-200': colors.gray[2],
        '--color-gray-500': colors.gray[5],
        '--color-gray-900': colors.gray[9],
      },
      dark: {
        '--color-primary-50': colors.primary[9],
        '--color-primary-100': colors.primary[8],
        '--color-primary-500': colors.primary[4],
        '--color-primary-600': colors.primary[3],
        '--color-primary-900': colors.primary[0],
        '--color-gray-50': colors.gray[9],
        '--color-gray-100': colors.gray[8],
        '--color-gray-200': colors.gray[7],
        '--color-gray-500': colors.gray[4],
        '--color-gray-900': colors.gray[0],
      },
    },
  },
});

export default theme;
