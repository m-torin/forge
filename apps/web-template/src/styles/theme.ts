import { createTheme } from '@mantine/core';

const theme = createTheme({
  breakpoints: {
    lg: '75em',
    md: '62em',
    sm: '48em',
    xl: '88em',
    xs: '36em',
  },
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
});

export default theme;
