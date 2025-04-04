import { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';

// Extend the DefaultMantineColor type to include your custom color
type ExtendedCustomColors = 'brand' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
