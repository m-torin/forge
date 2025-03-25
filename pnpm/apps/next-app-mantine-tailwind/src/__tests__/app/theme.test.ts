import { describe, it, expect } from 'vitest';
import { theme } from '@/app/theme';

describe.skip('Mantine Theme', () => {
  it('has the correct primary color', () => {
    expect(theme.primaryColor).toBe('brand');
  });

  it('has the custom brand color palette with 10 shades', () => {
    expect(theme.colors.brand).toBeDefined();
    expect(theme.colors.brand.length).toBe(10);
    expect(theme.colors.brand[0]).toBe('#e6f7ff'); // Lightest shade
    expect(theme.colors.brand[9]).toBe('#002766'); // Darkest shade
  });

  it('has custom breakpoints', () => {
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
    // Check that the theme has all the required properties
    const requiredProperties = [
      'primaryColor',
      'colors',
      'breakpoints',
      'defaultRadius',
      'autoContrast',
      'fontFamily',
      'focusRing',
    ];

    requiredProperties.forEach((prop) => {
      expect(theme).toHaveProperty(prop);
    });
  });

  it('has a valid brand color at index 5 for primary usage', () => {
    // Index 5 is typically used as the "primary" shade in Mantine
    const primaryShade = theme.colors.brand[5];
    expect(primaryShade).toBe('#1890ff');
  });
});
