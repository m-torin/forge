/**
 * Tailwind CSS v4 design system types
 */

import { z } from 'zod/v4';

export const TailwindV4SpacingSchema = z.enum([
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  '16',
  '20',
  '24',
  '32',
]);
export type TailwindV4Spacing = z.infer<typeof TailwindV4SpacingSchema>;

export const TailwindV4ColorShadeSchema = z.enum(['50', '100', '500', '900']);
export type TailwindV4ColorShade = z.infer<typeof TailwindV4ColorShadeSchema>;

export const TailwindV4ColorNameSchema = z.enum(['slate', 'gray', 'blue', 'red']);
export type TailwindV4ColorName = z.infer<typeof TailwindV4ColorNameSchema>;

export const TailwindV4RadiusSchema = z.enum([
  'none',
  'sm',
  'DEFAULT',
  'md',
  'lg',
  'xl',
  '2xl',
  '3xl',
  'full',
]);
export type TailwindV4Radius = z.infer<typeof TailwindV4RadiusSchema>;

export const TailwindV4BreakpointSchema = z.enum(['sm', 'md', 'lg', 'xl', '2xl']);
export type TailwindV4Breakpoint = z.infer<typeof TailwindV4BreakpointSchema>;

export interface TailwindV4ThemeConfig {
  spacing: Record<TailwindV4Spacing, string>;
  colors: Record<TailwindV4ColorName, Record<TailwindV4ColorShade, string>>;
  borderRadius: Record<TailwindV4Radius, string>;
  breakpoints: Record<TailwindV4Breakpoint, string>;
}

export interface TailwindV4DesignToken {
  value: string;
  cssVar: string;
  fallback: string;
  description?: string;
  deprecated?: boolean;
}
