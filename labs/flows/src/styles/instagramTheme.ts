import {
  ActionIconProps,
  ButtonProps,
  CardProps,
  CheckboxProps,
  MantineColorShade,
  MantineGradient,
  MantineTheme,
  MantineThemeOverride,
  ModalProps,
  RadioProps,
  SelectProps,
  TextInputProps,
  TextareaProps,
  TooltipProps,
 rem } from '@mantine/core';

interface StylesOptions {
  colorScheme: 'light' | 'dark';
}

const instagramTheme: MantineThemeOverride = {
  // Breakpoints
  breakpoints: {
    lg: rem(992),
    md: rem(768),
    sm: rem(576),
    xl: rem(1200),
    xs: rem(360),
  },

  // Colors
  colors: {
    darkBackground: [
      '#1A1A1A',
      '#1D1D1D',
      '#202020',
      '#232323',
      '#262626',
      '#2A2A2A',
      '#2D2D2D',
      '#303030',
      '#333333',
      '#363636',
    ],
    gray: [
      '#f8f9fa',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
      '#121416',
    ],
    primary: [
      '#F58529',
      '#FEDA77',
      '#DD2A7B',
      '#8134AF',
      '#515BD4',
      '#3B5998',
      '#223A5E',
      '#1D2A53',
      '#1A1A1A',
      '#000000',
    ],
  },

  components: {
    ActionIcon: {
      styles: (
        theme: MantineTheme,
        params: ActionIconProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        root: {
          transition: 'background-color 0.2s, transform 0.2s',
          '&:hover': {
            backgroundColor:
              options.colorScheme === 'dark'
                ? theme.colors.darkBackground[6]
                : theme.colors.gray[0],
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(1)',
          },
        },
      }),
    },

    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: (
        theme: MantineTheme,
        params: ButtonProps,
        _options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        root: {
          borderRadius: theme.radius.md,
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          fontWeight: 600,
          textTransform: 'none',
          transition: 'background-color 0.3s, box-shadow 0.3s, transform 0.2s',
          '&:hover': {
            backgroundColor: theme.colors.primary[5],
            boxShadow: theme.shadows.sm,
            transform: 'translateY(-2px)',
          },
          '&:active': {
            backgroundColor: theme.colors.primary[6],
            transform: 'translateY(0)',
            boxShadow: theme.shadows.sm,
          },
          '&:disabled': {
            backgroundColor: theme.colors.gray[2],
            color: theme.colors.gray[5],
            cursor: 'not-allowed',
          },
        },
      }),
    },

    Card: {
      styles: (
        theme: MantineTheme,
        params: CardProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        root: {
          borderRadius: theme.radius.md,
          boxShadow: theme.shadows.md,
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[5]
              : theme.white,
          padding: theme.spacing.md,
        },
      }),
    },

    Checkbox: {
      styles: (
        theme: MantineTheme,
        params: CheckboxProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        input: {
          borderColor: theme.colors.gray[4],
          '&:checked': {
            backgroundColor: theme.colors.primary[5],
            borderColor: theme.colors.primary[5],
          },
          '&:hover': {
            borderColor: theme.colors.primary[5],
          },
        },
        label: {
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[1]
              : theme.colors.gray[8],
        },
      }),
    },

    Modal: {
      styles: (
        theme: MantineTheme,
        params: ModalProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        header: {
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[6]
              : theme.white,
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
        },
        body: {
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[6]
              : theme.white,
        },
        close: {
          color: theme.colors.gray[5],
          '&:hover': {
            color: theme.colors.gray[7],
          },
        },
      }),
    },

    Radio: {
      styles: (
        theme: MantineTheme,
        params: RadioProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        radio: {
          borderColor: theme.colors.gray[4],
          '&:checked': {
            backgroundColor: theme.colors.primary[5],
            borderColor: theme.colors.primary[5],
          },
          '&:hover': {
            borderColor: theme.colors.primary[5],
          },
        },
        label: {
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[1]
              : theme.colors.gray[8],
        },
      }),
    },

    Select: {
      styles: (
        theme: MantineTheme,
        params: SelectProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        input: {
          borderRadius: theme.radius.md,
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
          border: `1px solid ${theme.colors.gray[3]}`,
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[4]
              : theme.white,
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[0]
              : theme.colors.gray[7],
          '&:focus': {
            borderColor: theme.colors.primary[6],
            boxShadow: `0 0 0 2px ${theme.colors.primary[2]}`,
          },
        },
        label: {
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[1]
              : theme.colors.gray[8],
        },
      }),
    },

    TextInput: {
      styles: (
        theme: MantineTheme,
        params: TextInputProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        input: {
          borderRadius: theme.radius.md,
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
          border: `1px solid ${theme.colors.gray[3]}`,
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[4]
              : theme.white,
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[0]
              : theme.colors.gray[7],
          '&:focus': {
            borderColor: theme.colors.primary[6],
            boxShadow: `0 0 0 2px ${theme.colors.primary[2]}`,
          },
        },
        label: {
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[1]
              : theme.colors.gray[8],
        },
      }),
    },

    Textarea: {
      styles: (
        theme: MantineTheme,
        params: TextareaProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        input: {
          borderRadius: theme.radius.md,
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
          border: `1px solid ${theme.colors.gray[3]}`,
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[4]
              : theme.white,
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[0]
              : theme.colors.gray[7],
          '&:focus': {
            borderColor: theme.colors.primary[6],
            boxShadow: `0 0 0 2px ${theme.colors.primary[2]}`,
          },
        },
        label: {
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[1]
              : theme.colors.gray[8],
        },
      }),
    },

    Tooltip: {
      styles: (
        theme: MantineTheme,
        params: TooltipProps,
        options: StylesOptions = { colorScheme: 'light' },
      ) => ({
        tooltip: {
          backgroundColor:
            options.colorScheme === 'dark'
              ? theme.colors.darkBackground[7]
              : theme.colors.gray[0],
          color:
            options.colorScheme === 'dark'
              ? theme.colors.gray[0]
              : theme.colors.gray[9],
          borderRadius: theme.radius.sm,
          boxShadow: theme.shadows.sm,
        },
      }),
    },
  },

  cursorType: 'pointer',

  defaultGradient: {
    deg: 45,
    from: '#F58529',
    to: '#DD2A7B',
  } as MantineGradient,

  defaultRadius: 'md',

  fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,

  fontFamilyMonospace: `'Courier New', Courier, monospace`,

  fontSizes: {
    '2xl': rem(24),
    '3xl': rem(30),
    lg: rem(18),
    md: rem(16),
    sm: rem(14),
    xl: rem(20),
    xs: rem(12),
  },

  focusRing: 'auto',

  headings: {
    fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(32), fontWeight: '700', lineHeight: '1.2' },
      h2: { fontSize: rem(28), fontWeight: '700', lineHeight: '1.3' },
      h3: { fontSize: rem(24), fontWeight: '600', lineHeight: '1.4' },
      h4: { fontSize: rem(20), fontWeight: '600', lineHeight: '1.5' },
      h5: { fontSize: rem(18), fontWeight: '500', lineHeight: '1.6' },
      h6: { fontSize: rem(16), fontWeight: '500', lineHeight: '1.7' },
    },
    textWrap: 'wrap',
  },

  lineHeights: {
    lg: '1.8',
    md: '1.6',
    sm: '1.4',
    xl: '2',
    xs: '1.2',
  },

  luminanceThreshold: 0.3,

  other: {
    primaryGradient: 'linear-gradient(45deg, #F58529, #DD2A7B)',
  },

  primaryColor: 'primary',

  primaryShade: { light: 4, dark: 5 } as unknown as MantineColorShade,

  shadows: {
    lg: '0 4px 8px rgba(0, 0, 0, 0.2)',
    md: '0 2px 4px rgba(0, 0, 0, 0.15)',
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    xl: '0 8px 16px rgba(0, 0, 0, 0.25)',
    xs: '0 1px 1px rgba(0, 0, 0, 0.05)',
  },

  spacing: {
    lg: rem(24),
    md: rem(16),
    sm: rem(8),
    xl: rem(32),
    xs: rem(4),
  },
};

export default instagramTheme;
