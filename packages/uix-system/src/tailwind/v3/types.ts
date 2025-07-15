/**
 * Tailwind CSS v3 design system types
 */

import { z } from 'zod/v4';

export const TailwindV3SpacingSchema = z.enum([
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
export type TailwindV3Spacing = z.infer<typeof TailwindV3SpacingSchema>;

export const TailwindV3ColorShadeSchema = z.enum(['50', '100', '500', '900']);
export type TailwindV3ColorShade = z.infer<typeof TailwindV3ColorShadeSchema>;

export const TailwindV3ColorNameSchema = z.enum(['slate', 'gray', 'blue', 'red']);
export type TailwindV3ColorName = z.infer<typeof TailwindV3ColorNameSchema>;

export const TailwindV3RadiusSchema = z.enum([
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
export type TailwindV3Radius = z.infer<typeof TailwindV3RadiusSchema>;

export interface TailwindV3ThemeConfig {
  spacing: Record<TailwindV3Spacing, string>;
  colors: Record<TailwindV3ColorName, Record<TailwindV3ColorShade, string>>;
  borderRadius: Record<TailwindV3Radius, string>;
}

export interface TailwindV3DesignToken {
  value: string;
  description?: string;
  deprecated?: boolean;
}
