/**
 * Mantine v8 design system utilities
 */

import { clsx, type ClassValue } from 'clsx';
import {
  MANTINE_BREAKPOINTS,
  MANTINE_COLORS,
  MANTINE_RADIUS,
  MANTINE_SHADOWS,
  MANTINE_SPACING,
} from './constants';
import type {
  MantineBreakpoint,
  MantineColor,
  MantineRadius,
  MantineShadow,
  MantineSpacing,
} from './types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getMantineSpacing(key: MantineSpacing): string {
  return MANTINE_SPACING[key];
}

export function getMantineBreakpoint(key: MantineBreakpoint): string {
  return MANTINE_BREAKPOINTS[key];
}

export function getMantineColor(key: MantineColor): string {
  return MANTINE_COLORS[key];
}

export function getMantineRadius(key: MantineRadius): string {
  return MANTINE_RADIUS[key];
}

export function getMantineShadow(key: MantineShadow): string {
  return MANTINE_SHADOWS[key];
}

export function createMantineMediaQuery(breakpoint: MantineBreakpoint): string {
  return `@media (min-width: ${getMantineBreakpoint(breakpoint)})`;
}

export function validateMantineSpacing(value: unknown): value is MantineSpacing {
  return typeof value === 'string' && value in MANTINE_SPACING;
}

export function validateMantineBreakpoint(value: unknown): value is MantineBreakpoint {
  return typeof value === 'string' && value in MANTINE_BREAKPOINTS;
}

export function validateMantineColor(value: unknown): value is MantineColor {
  return typeof value === 'string' && value in MANTINE_COLORS;
}

export function createMantineStyleObject(spacing?: MantineSpacing, color?: MantineColor) {
  return {
    ...(spacing && { padding: getMantineSpacing(spacing) }),
    ...(color && { color: getMantineColor(color) }),
  };
}
