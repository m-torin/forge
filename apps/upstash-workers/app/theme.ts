import { createTheme } from '@mantine/core'

export default createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 8 },
  colors: {
    blue: [
      '#e7f5ff',
      '#d0ebff',
      '#a5d8ff',
      '#74c0fc',
      '#339af0',
      '#228be6',
      '#1c7ed6',
      '#1971c2',
      '#1864ab',
      '#145591',
    ],
  },
  fontFamily: 'var(--font-inter), system-ui, sans-serif',
  headings: { fontFamily: 'var(--font-inter), system-ui, sans-serif' },
})
