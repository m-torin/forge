import { describe, it, expect } from 'vitest';
import { theme } from '@/app/theme';
import { MantineTheme } from '@mantine/core';

describe.skip('Mantine Theme Configuration', () => {
  it('has the correct primary color set to brand', () => {
    expect(theme.primaryColor).toBe('brand');
  });

  it('has the correct brand color palette with 10 shades', () => {
    expect(theme.colors.brand).toBeDefined();
    expect(theme.colors.brand.length).toBe(10);

    // Check specific brand colors
    expect(theme.colors.brand[0]).toBe('#e6f7ff'); // Lightest shade
    expect(theme.colors.brand[5]).toBe('#1890ff'); // Middle shade
    expect(theme.colors.brand[9]).toBe('#002766'); // Darkest shade
  });

  it('has the correct breakpoints defined', () => {
    expect(theme.breakpoints).toBeDefined();
    expect(theme.breakpoints.xs).toBe('36em');
    expect(theme.breakpoints.sm).toBe('48em');
    expect(theme.breakpoints.md).toBe('62em');
    expect(theme.breakpoints.lg).toBe('75em');
    expect(theme.breakpoints.xl).toBe('88em');
  });

  it('has the correct default radius', () => {
    expect(theme.defaultRadius).toBe('md');
  });

  it('has auto contrast enabled', () => {
    expect(theme.autoContrast).toBe(true);
  });

  it('has the correct font family', () => {
    expect(theme.fontFamily).toBe(
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    );
  });

  it('has the correct focus ring setting', () => {
    expect(theme.focusRing).toBe('auto');
  });

  it('has all required theme properties', () => {
    // Check that the theme has all the required properties of a MantineTheme
    const requiredProperties: (keyof MantineTheme)[] = [
      'colors',
      'primaryColor',
      'breakpoints',
      'fontFamily',
      'defaultRadius',
      'focusRing',
    ];

    requiredProperties.forEach((prop) => {
      expect(theme).toHaveProperty(prop);
    });
  });

  it('has valid color values in the brand palette', () => {
    // Check that all brand colors are valid hex colors
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    theme.colors.brand.forEach((color) => {
      expect(color).toMatch(hexColorRegex);
    });
  });

  it('has a properly structured color palette', () => {
    // Check that the brand color palette follows the expected pattern
    // (from lightest to darkest)
    const brandColors = theme.colors.brand;

    // Simple check to ensure colors generally get darker
    // by comparing the perceived brightness of first, middle, and last colors
    const getBrightness = (hexColor: string) => {
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);
      return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const firstBrightness = getBrightness(brandColors[0]);
    const middleBrightness = getBrightness(brandColors[5]);
    const lastBrightness = getBrightness(brandColors[9]);

    expect(firstBrightness).toBeGreaterThan(middleBrightness);
    expect(middleBrightness).toBeGreaterThan(lastBrightness);
  });
});
