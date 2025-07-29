/**
 * Tailwind CSS v3 design system utilities
 */

import { TAILWIND_V3_BORDER_RADIUS, TAILWIND_V3_COLORS, TAILWIND_V3_SPACING } from './constants';
import type {
  TailwindV3ColorName,
  TailwindV3ColorShade,
  TailwindV3Radius,
  TailwindV3Spacing,
} from './types';

export function getTailwindV3Spacing(key: TailwindV3Spacing): string {
  return TAILWIND_V3_SPACING[key];
}

export function getTailwindV3Color(
  color: TailwindV3ColorName,
  shade: TailwindV3ColorShade,
): string {
  return TAILWIND_V3_COLORS[color][shade];
}

export function getTailwindV3Radius(key: TailwindV3Radius): string {
  return TAILWIND_V3_BORDER_RADIUS[key];
}

export function validateTailwindV3Spacing(value: unknown): value is TailwindV3Spacing {
  return typeof value === 'string' && value in TAILWIND_V3_SPACING;
}

export function validateTailwindV3Color(color: unknown, shade: unknown): boolean {
  return (
    typeof color === 'string' &&
    typeof shade === 'string' &&
    color in TAILWIND_V3_COLORS &&
    shade in TAILWIND_V3_COLORS[color as TailwindV3ColorName]
  );
}

export function createTailwindV3Classes(options: {
  spacing?: TailwindV3Spacing;
  textColor?: { color: TailwindV3ColorName; shade: TailwindV3ColorShade };
  bgColor?: { color: TailwindV3ColorName; shade: TailwindV3ColorShade };
  radius?: TailwindV3Radius;
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
