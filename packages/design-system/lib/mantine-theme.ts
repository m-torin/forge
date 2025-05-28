import {
  createTheme,
  DEFAULT_THEME,
  type MantineColorsTuple,
  mergeMantineTheme,
  rem,
} from '@mantine/core';

import { geistMono, geistSans } from './fonts';

// Convert OKLCH to HEX for Mantine
// This is a simplified converter - for production, use a proper library
function _oklchToHex(oklch: string): string {
  // For now, we'll define some key color mappings
  // In production, use a proper OKLCH to HEX converter
  const colorMap: Record<string, string> = {
    'oklch(0.6 0.118 184.704)': '#5ac8fa',
    'oklch(0.398 0.07 227.392)': '#007aff',
    'oklch(0.577 0.245 27.325)': '#ff453a', // destructive
    // Chart colors
    'oklch(0.646 0.222 41.116)': '#ff9500',
    'oklch(0.769 0.188 70.08)': '#ff9f0a',
    'oklch(0.828 0.189 84.429)': '#ffcc00',
    'oklch(0.97 0 0)': '#f7f7f7',
    'oklch(0.145 0 0)': '#252525',
    'oklch(0.205 0 0)': '#343434',
    'oklch(0.269 0 0)': '#434343',
    'oklch(0.439 0 0)': '#707070',
    'oklch(0.556 0 0)': '#8e8e8e',
    'oklch(0.708 0 0)': '#b4b4b4',
    'oklch(0.922 0 0)': '#ebebeb',
    'oklch(0.985 0 0)': '#fafafa',
    'oklch(50.8% 0.118 165.612)': '#32d74b', // success
    // Light mode colors
    'oklch(1 0 0)': '#ffffff',
  };

  return colorMap[oklch] || '#000000';
}

// Define custom colors that match our design system
const customColors = {
  // Main brand colors
  dark: [
    '#fafafa', // 0 - lightest
    '#f5f5f5', // 1
    '#ebebeb', // 2
    '#d6d6d6', // 3
    '#b4b4b4', // 4
    '#8e8e8e', // 5
    '#707070', // 6
    '#434343', // 7
    '#343434', // 8
    '#252525', // 9 - darkest
  ] as const,
  // Destructive/Error color
  destructive: [
    '#fee', // 0
    '#fdd', // 1
    '#fcb', // 2
    '#fa9', // 3
    '#f87', // 4
    '#ff453a', // 5 - main
    '#e53e3e', // 6
    '#c53030', // 7
    '#9b2c2c', // 8
    '#742a2a', // 9
  ] as const,
  // Success color
  success: [
    '#e8fbed', // 0
    '#c6f6d5', // 1
    '#9ae6b4', // 2
    '#68d391', // 3
    '#48bb78', // 4
    '#32d74b', // 5 - main
    '#2f855a', // 6
    '#276749', // 7
    '#22543d', // 8
    '#1a3e2e', // 9
  ] as const,
} satisfies Record<string, MantineColorsTuple>;

export const mantineTheme = createTheme({
  // Typography
  fontFamily: geistSans.style.fontFamily,
  fontFamilyMonospace: geistMono.style.fontFamily,
  headings: { fontFamily: geistSans.style.fontFamily },

  // Colors
  colors: customColors,
  primaryColor: 'dark',
  primaryShade: { dark: 0, light: 8 },

  // Spacing and sizing
  spacing: {
    lg: rem(20),
    md: rem(16),
    sm: rem(12),
    xl: rem(24),
    xs: rem(8),
  },

  // Border radius to match our design system
  radius: {
    lg: rem(10),
    md: rem(8),
    sm: rem(6),
    xl: rem(14),
    xs: rem(4),
  },

  // Default radius matches our --radius variable (0.625rem = 10px)
  defaultRadius: 'lg',

  // Component defaults
  components: {
    Alert: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Avatar: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
    },
    Checkbox: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Drawer: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Input: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        input: {
          '&:focus': {
            borderColor: 'var(--mantine-color-dark-4)',
          },
          borderColor: 'var(--mantine-color-dark-2)',
        },
      },
    },
    Menu: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        radius: 'lg',
      },
    },
    Popover: {
      defaultProps: {
        radius: 'md',
      },
    },
    Progress: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Select: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Skeleton: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Switch: {
      defaultProps: {
        radius: 'xl',
      },
    },
    Table: {
      styles: {
        th: {
          fontWeight: 600,
        },
      },
    },
    Tabs: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },

  // Other theme overrides
  cursorType: 'pointer',
  focusRing: 'auto',
  respectReducedMotion: true,

  other: {
    // Custom theme variables that components can use
    borderColor: 'var(--mantine-color-dark-2)',
    borderColorHover: 'var(--mantine-color-dark-3)',
    cardBackground: 'var(--mantine-color-white)',
    cardBackgroundHover: 'var(--mantine-color-gray-0)',
  },
});

// Merge with default theme to ensure all properties are included
export const theme = mergeMantineTheme(DEFAULT_THEME, mantineTheme);
