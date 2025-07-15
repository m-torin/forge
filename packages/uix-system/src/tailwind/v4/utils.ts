/**
 * Tailwind CSS v4 design system utilities
 */

import {
  TAILWIND_V4_BORDER_RADIUS,
  TAILWIND_V4_BREAKPOINTS,
  TAILWIND_V4_COLORS,
  TAILWIND_V4_SPACING,
} from './constants';
import type {
  TailwindV4Breakpoint,
  TailwindV4ColorName,
  TailwindV4ColorShade,
  TailwindV4Radius,
  TailwindV4Spacing,
} from './types';

export function getTailwindV4Spacing(key: TailwindV4Spacing): string {
  return TAILWIND_V4_SPACING[key];
}

export function getTailwindV4Color(
  color: TailwindV4ColorName,
  shade: TailwindV4ColorShade,
): string {
  return TAILWIND_V4_COLORS[color][shade];
}

export function getTailwindV4Radius(key: TailwindV4Radius): string {
  return TAILWIND_V4_BORDER_RADIUS[key];
}

export function getTailwindV4Breakpoint(key: TailwindV4Breakpoint): string {
  return TAILWIND_V4_BREAKPOINTS[key];
}

export function createTailwindV4MediaQuery(breakpoint: TailwindV4Breakpoint): string {
  return `@media (min-width: ${getTailwindV4Breakpoint(breakpoint)})`;
}

export function validateTailwindV4Spacing(value: unknown): value is TailwindV4Spacing {
  return typeof value === 'string' && value in TAILWIND_V4_SPACING;
}

export function validateTailwindV4Color(color: unknown, shade: unknown): boolean {
  return (
    typeof color === 'string' &&
    typeof shade === 'string' &&
    color in TAILWIND_V4_COLORS &&
    shade in TAILWIND_V4_COLORS[color as TailwindV4ColorName]
  );
}

export function createTailwindV4Classes(options: {
  spacing?: TailwindV4Spacing;
  textColor?: { color: TailwindV4ColorName; shade: TailwindV4ColorShade };
  bgColor?: { color: TailwindV4ColorName; shade: TailwindV4ColorShade };
  radius?: TailwindV4Radius;
}): string {
  const classes: string[] = [];

  if (options.spacing) {
    classes.push(`p-${options.spacing}`);
  }

  if (options.textColor) {
    classes.push(`text-${options.textColor.color}-${options.textColor.shade}`);
  }

  if (options.bgColor) {
    classes.push(`bg-${options.bgColor.color}-${options.bgColor.shade}`);
  }

  if (options.radius) {
    const radiusClass = options.radius === 'DEFAULT' ? 'rounded' : `rounded-${options.radius}`;
    classes.push(radiusClass);
  }

  return classes.join(' ');
}

export function createV4CustomProperty(name: string, value: string, fallback?: string): string {
  if (fallback) {
    return `var(--${name}, ${fallback})`;
  }
  return `var(--${name})`;
}
