import { MantineTheme, MantineThemeOverride } from '@mantine/core';

const polarisTheme: MantineThemeOverride = {
  colors: {
    primary: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#2196F3',
      '#1E88E5',
      '#1976D2',
      '#1565C0',
      '#0D47A1',
    ],
    secondary: [
      '#F1F8E9',
      '#DCEDC8',
      '#C5E1A5',
      '#AED581',
      '#9CCC65',
      '#8BC34A',
      '#7CB342',
      '#689F38',
      '#558B2F',
      '#33691E',
    ],
    danger: [
      '#FFEBEE',
      '#FFCDD2',
      '#EF9A9A',
      '#E57373',
      '#EF5350',
      '#F44336',
      '#E53935',
      '#D32F2F',
      '#C62828',
      '#B71C1C',
    ],
    success: [
      '#E8F5E9',
      '#C8E6C9',
      '#A5D6A7',
      '#81C784',
      '#66BB6A',
      '#4CAF50',
      '#43A047',
      '#388E3C',
      '#2E7D32',
      '#1B5E20',
    ],
    warning: [
      '#FFF3E0',
      '#FFE0B2',
      '#FFCC80',
      '#FFB74D',
      '#FFA726',
      '#FF9800',
      '#FB8C00',
      '#F57C00',
      '#EF6C00',
      '#E65100',
    ],
  },
  primaryColor: 'primary',
  fontFamily: 'ShopifySans, sans-serif',
  headings: {
    fontFamily: 'ShopifySans, sans-serif',
    fontWeight: '600',
  },
  components: {
    Accordion: {
      styles: (theme: MantineTheme) => ({
        control: {
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.gray[0],
          borderRadius: theme.radius.md,
          '&[data-active]': {
            backgroundColor: theme.colors.primary[0],
          },
        },
        label: {
          fontWeight: 500,
        },
        icon: {
          color: theme.colors.primary[7],
        },
      }),
    },
    Alert: {
      styles: (theme: MantineTheme) => ({
        root: {
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.primary[0],
          border: `1px solid ${theme.colors.primary[2]}`,
        },
        title: {
          fontWeight: 600,
          color: theme.colors.primary[7],
        },
        message: {
          color: theme.colors.primary[6],
        },
      }),
    },
    Avatar: {
      styles: (theme: MantineTheme) => ({
        root: {
          borderRadius: '50%',
          backgroundColor: theme.colors.gray[2],
        },
      }),
    },
    Badge: {
      styles: (theme: MantineTheme) => ({
        root: {
          borderRadius: theme.radius.sm,
          textTransform: 'uppercase',
          fontWeight: 500,
          backgroundColor: theme.colors.primary[0],
          color: theme.colors.primary[7],
        },
      }),
    },
    Breadcrumbs: {
      styles: (theme: MantineTheme) => ({
        root: {
          color: theme.colors.primary[7],
        },
        separator: {
          margin: `0 ${theme.spacing.xs}px`,
        },
      }),
    },
    Button: {
      styles: (theme: MantineTheme) => ({
        root: {
          borderRadius: theme.radius.md,
          padding: '0 20px',
          fontWeight: 500,
        },
      }),
    },
    Card: {
      styles: (theme: MantineTheme) => ({
        root: {
          boxShadow:
            '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          backgroundColor: theme.white,
          border: `1px solid ${theme.colors.gray[2]}`,
          transition: 'box-shadow 150ms ease, transform 150ms ease',
          '&:hover': {
            boxShadow:
              '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
          '&:focus-within': {
            boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)',
          },
        },
        header: {
          marginBottom: theme.spacing.md,
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          paddingBottom: theme.spacing.sm,
          fontWeight: 600,
          fontSize: theme.fontSizes.md,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        body: {
          padding: theme.spacing.sm,
          lineHeight: 1.5,
          color: theme.colors.gray[7],
        },
        footer: {
          marginTop: theme.spacing.md,
          borderTop: `1px solid ${theme.colors.gray[2]}`,
          paddingTop: theme.spacing.sm,
          textAlign: 'right',
        },
      }),
    },
    Checkbox: {
      styles: (theme: MantineTheme) => ({
        input: {
          borderColor: theme.colors.gray[4],
          '&:checked': {
            backgroundColor: theme.colors.primary[5],
          },
        },
      }),
    },
    Drawer: {
      styles: (theme: MantineTheme) => ({
        header: {
          borderBottom: `1px solid ${theme.colors.gray[3]}`,
          paddingBottom: theme.spacing.sm,
        },
        body: {
          padding: theme.spacing.md,
        },
      }),
    },
    Loader: {
      styles: (theme: MantineTheme) => ({
        root: {
          color: theme.colors.primary[7],
        },
      }),
    },
    Menu: {
      styles: (theme: MantineTheme) => ({
        item: {
          padding: theme.spacing.sm,
          '&[data-hovered]': {
            backgroundColor: theme.colors.gray[1],
          },
          '&[data-active]': {
            backgroundColor: theme.colors.primary[1],
            color: theme.colors.primary[7],
          },
        },
        dropdown: {
          borderRadius: theme.radius.md,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    Modal: {
      styles: (theme: MantineTheme) => ({
        header: {
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
          paddingBottom: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        },
      }),
    },
    Notification: {
      styles: (theme: MantineTheme) => ({
        root: {
          backgroundColor: theme.colors.gray[0],
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.gray[3]}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
        title: {
          color: theme.colors.gray[9],
          fontWeight: 600,
        },
        description: {
          color: theme.colors.gray[7],
        },
      }),
    },
    Pagination: {
      styles: (theme: MantineTheme) => ({
        item: {
          '&[data-active]': {
            backgroundColor: theme.colors.primary[5],
            color: theme.colors.gray[0],
          },
          '&:hover': {
            backgroundColor: theme.colors.primary[4],
          },
        },
      }),
    },
    Popover: {
      styles: (theme: MantineTheme) => ({
        body: {
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          backgroundColor: theme.colors.gray[0],
        },
      }),
    },
    Select: {
      styles: (theme: MantineTheme) => ({
        item: {
          padding: theme.spacing.sm,
          '&[data-selected]': {
            backgroundColor: theme.colors.primary[1],
            color: theme.colors.primary[7],
          },
          '&[data-hovered]': {
            backgroundColor: theme.colors.gray[1],
          },
        },
        dropdown: {
          borderRadius: theme.radius.md,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      }),
    },
    Slider: {
      styles: (theme: MantineTheme) => ({
        track: {
          backgroundColor: theme.colors.gray[3],
        },
        thumb: {
          borderColor: theme.colors.primary[5],
          backgroundColor: theme.colors.primary[5],
        },
      }),
    },
    Stepper: {
      styles: (theme: MantineTheme) => ({
        step: {
          '&[data-completed]': {
            backgroundColor: theme.colors.primary[5],
            color: theme.colors.gray[0],
          },
          '&[data-active]': {
            backgroundColor: theme.colors.primary[3],
            color: theme.colors.primary[9],
          },
        },
        stepIcon: {
          color: theme.colors.primary[7],
        },
      }),
    },
    Switch: {
      styles: (theme: MantineTheme) => ({
        input: {
          '&:checked': {
            backgroundColor: theme.colors.primary[5],
          },
          '&:checked + .mantine-Switch-thumb': {
            backgroundColor: theme.colors.gray[0],
          },
        },
      }),
    },
    TextInput: {
      styles: (theme: MantineTheme) => ({
        input: {
          borderColor: theme.colors.gray[4],
          '&:focus': {
            borderColor: theme.colors.primary[5],
          },
        },
      }),
    },
    Tooltip: {
      styles: (theme: MantineTheme) => ({
        tooltip: {
          backgroundColor: theme.colors.gray[9],
          color: theme.colors.gray[0],
          borderRadius: theme.radius.sm,
          padding: theme.spacing.xs,
        },
      }),
    },
  },
};

export default polarisTheme;
