/**
 * Mantine v8 design system types
 */

import { z } from 'zod/v4';

export const MantineSpacingSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);
export type MantineSpacing = z.infer<typeof MantineSpacingSchema>;

export const MantineBreakpointSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);
export type MantineBreakpoint = z.infer<typeof MantineBreakpointSchema>;

export const MantineColorSchema = z.enum(['primary', 'error', 'success', 'warning', 'info']);
export type MantineColor = z.infer<typeof MantineColorSchema>;

export const MantineRadiusSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);
export type MantineRadius = z.infer<typeof MantineRadiusSchema>;

export const MantineShadowSchema = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);
export type MantineShadow = z.infer<typeof MantineShadowSchema>;

export interface MantineThemeConfig {
  spacing: Record<MantineSpacing, string>;
  breakpoints: Record<MantineBreakpoint, string>;
  colors: Record<MantineColor, string>;
  radius: Record<MantineRadius, string>;
  shadows: Record<MantineShadow, string>;
}

export interface MantineDesignToken {
  value: string;
  cssVar: string;
  description?: string;
  deprecated?: boolean;
}
