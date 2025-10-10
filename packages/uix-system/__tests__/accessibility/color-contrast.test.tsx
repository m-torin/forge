/**
 * Color Contrast Accessibility Tests
 *
 * Tests WCAG 2.1 color contrast requirements across different themes,
 * components, and states using specialized color analysis utilities.
 */

import { MantineProvider, createTheme } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { getAxe } from '../vitest-a11y-setup';

/**
 * Color contrast calculation utilities
 * Based on WCAG 2.1 specifications
 */
export const colorContrastUtils = {
  /**
   * Convert hex color to RGB values
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = colorContrastUtils.hexToRgb(color1);
    const rgb2 = colorContrastUtils.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const lum1 = colorContrastUtils.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = colorContrastUtils.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast ratio meets WCAG standards
   */
  meetsWCAGStandard: (
    ratio: number,
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal',
  ): boolean => {
    const requirements = {
      AA: { normal: 4.5, large: 3.0 },
      AAA: { normal: 7.0, large: 4.5 },
    };

    return ratio >= requirements[level][size];
  },

  /**
   * Get contrast ratio from computed styles
   */
  getContrastFromElement: (element: HTMLElement): { ratio: number; passes: boolean } => {
    const computedStyle = window.getComputedStyle(element);
    const color = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;

    // Extract RGB values from computed colors
    const colorMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const bgColorMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    if (!colorMatch || !bgColorMatch) {
      return { ratio: 1, passes: false };
    }

    const textColor = `#${parseInt(colorMatch[1]).toString(16).padStart(2, '0')}${parseInt(colorMatch[2]).toString(16).padStart(2, '0')}${parseInt(colorMatch[3]).toString(16).padStart(2, '0')}`;
    const bgColor = `#${parseInt(bgColorMatch[1]).toString(16).padStart(2, '0')}${parseInt(bgColorMatch[2]).toString(16).padStart(2, '0')}${parseInt(bgColorMatch[3]).toString(16).padStart(2, '0')}`;

    const ratio = colorContrastUtils.getContrastRatio(textColor, bgColor);
    const passes = colorContrastUtils.meetsWCAGStandard(ratio);

    return { ratio, passes };
  },
};

// Mock components for testing contrast
const MockButton = ({
  variant,
  color,
  children,
}: {
  variant?: string;
  color?: string;
  children: React.ReactNode;
}) => (
  <button
    className={`button ${variant} ${color}`}
    style={{
      color: variant === 'filled' ? 'white' : color || 'inherit',
      backgroundColor: variant === 'filled' ? color || 'blue' : 'transparent',
      border: variant === 'outline' ? `1px solid ${color || 'blue'}` : 'none',
      padding: '8px 16px',
    }}
  >
    {children}
  </button>
);

const MockText = ({
  size,
  weight,
  color,
  children,
}: {
  size?: string;
  weight?: string;
  color?: string;
  children: React.ReactNode;
}) => (
  <p
    style={{
      fontSize: size === 'large' ? '18px' : '14px',
      fontWeight: weight === 'bold' ? 'bold' : 'normal',
      color: color || 'inherit',
    }}
  >
    {children}
  </p>
);

const MockAlert = ({ color, children }: { color: string; children: React.ReactNode }) => {
  const alertStyles = {
    info: { backgroundColor: '#e7f3ff', color: '#0066cc', border: '#0066cc' },
    success: { backgroundColor: '#e8f5e8', color: '#006600', border: '#006600' },
    warning: { backgroundColor: '#fff8e1', color: '#cc6600', border: '#cc6600' },
    error: { backgroundColor: '#ffe8e8', color: '#cc0000', border: '#cc0000' },
  };

  const style = alertStyles[color as keyof typeof alertStyles] || alertStyles.info;

  return (
    <div
      style={{
        padding: '12px',
        borderRadius: '4px',
        border: `1px solid ${style.border}`,
        backgroundColor: style.backgroundColor,
        color: style.color,
      }}
      role="alert"
    >
      {children}
    </div>
  );
};

describe('color Contrast Accessibility Tests', () => {
  describe('wCAG Contrast Utilities', () => {
    test('should calculate correct contrast ratios', () => {
      // Test high contrast (black on white)
      const highContrast = colorContrastUtils.getContrastRatio('#000000', '#ffffff');
      expect(highContrast).toBeCloseTo(21, 0);
      expect(colorContrastUtils.meetsWCAGStandard(highContrast, 'AAA')).toBeTruthy();

      // Test low contrast (light gray on white)
      const lowContrast = colorContrastUtils.getContrastRatio('#cccccc', '#ffffff');
      expect(lowContrast).toBeLessThan(4.5);
      expect(colorContrastUtils.meetsWCAGStandard(lowContrast)).toBeFalsy();

      // Test AA standard threshold
      const aaThreshold = colorContrastUtils.getContrastRatio('#767676', '#ffffff');
      expect(colorContrastUtils.meetsWCAGStandard(aaThreshold)).toBeTruthy();
    });

    test('should handle hex color conversion', () => {
      const white = colorContrastUtils.hexToRgb('#ffffff');
      expect(white).toStrictEqual({ r: 255, g: 255, b: 255 });

      const black = colorContrastUtils.hexToRgb('#000000');
      expect(black).toStrictEqual({ r: 0, g: 0, b: 0 });

      const red = colorContrastUtils.hexToRgb('#ff0000');
      expect(red).toStrictEqual({ r: 255, g: 0, b: 0 });
    });

    test('should calculate luminance correctly', () => {
      // White should have luminance of 1
      const whiteLuminance = colorContrastUtils.getLuminance(255, 255, 255);
      expect(whiteLuminance).toBeCloseTo(1, 2);

      // Black should have luminance of 0
      const blackLuminance = colorContrastUtils.getLuminance(0, 0, 0);
      expect(blackLuminance).toBeCloseTo(0, 2);
    });
  });

  describe('button Color Contrast', () => {
    test('should meet contrast requirements for primary buttons', () => {
      render(
        <MantineProvider>
          <div data-testid="button-container">
            <MockButton variant="filled" color="blue">
              Primary Action
            </MockButton>
          </div>
        </MantineProvider>,
      );

      const button = document.querySelector('button');
      expect(button).toBeInTheDocument();

      // Check contrast programmatically
      const { ratio, passes } = colorContrastUtils.getContrastFromElement(button!);
      expect(passes).toBeTruthy();
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('should meet contrast requirements for secondary buttons', () => {
      render(
        <MantineProvider>
          <div>
            <MockButton variant="outline" color="blue">
              Secondary Action
            </MockButton>
          </div>
        </MantineProvider>,
      );

      const button = document.querySelector('button');
      expect(button).toBeInTheDocument();

      const { passes } = colorContrastUtils.getContrastFromElement(button!);
      expect(passes).toBeTruthy();
    });

    test('should maintain contrast in disabled state', () => {
      render(
        <MantineProvider>
          <div>
            <button
              disabled
              style={{
                color: '#999999',
                backgroundColor: '#f5f5f5',
                padding: '8px 16px',
              }}
            >
              Disabled Button
            </button>
          </div>
        </MantineProvider>,
      );

      const button = document.querySelector('button');
      expect(button).toBeInTheDocument();

      // Disabled buttons have relaxed contrast requirements but should still be visible
      const { ratio } = colorContrastUtils.getContrastFromElement(button!);
      expect(ratio).toBeGreaterThan(2); // Minimum for disabled elements
    });

    test('should handle button states (hover, focus, active)', () => {
      render(
        <MantineProvider>
          <div>
            <MockButton variant="filled" color="green">
              Stateful Button
            </MockButton>
          </div>
        </MantineProvider>,
      );

      const button = document.querySelector('button');
      expect(button).toBeInTheDocument();

      // Test different pseudo-states
      const baseContrast = colorContrastUtils.getContrastFromElement(button!);
      expect(baseContrast.passes).toBeTruthy();

      // Simulate hover state (darker background)
      button!.style.backgroundColor = '#006600';
      const hoverContrast = colorContrastUtils.getContrastFromElement(button!);
      expect(hoverContrast.passes).toBeTruthy();
      expect(hoverContrast.ratio).toBeGreaterThanOrEqual(baseContrast.ratio);
    });
  });

  describe('text Color Contrast', () => {
    test('should meet contrast requirements for body text', () => {
      render(
        <MantineProvider>
          <div style={{ backgroundColor: 'white' }}>
            <MockText color="#333333">
              This is body text that should meet AA contrast requirements.
            </MockText>
          </div>
        </MantineProvider>,
      );

      const text = document.querySelector('p');
      expect(text).toBeInTheDocument();

      const { ratio, passes } = colorContrastUtils.getContrastFromElement(text!);
      expect(passes).toBeTruthy();
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('should meet contrast requirements for large text', () => {
      render(
        <MantineProvider>
          <div style={{ backgroundColor: 'white' }}>
            <MockText size="large" weight="bold" color="#666666">
              This is large text with relaxed contrast requirements.
            </MockText>
          </div>
        </MantineProvider>,
      );

      const text = document.querySelector('p');
      expect(text).toBeInTheDocument();

      const { ratio } = colorContrastUtils.getContrastFromElement(text!);
      // Large text (18px+ or 14px+ bold) only needs 3:1 ratio
      expect(colorContrastUtils.meetsWCAGStandard(ratio, 'AA', 'large')).toBeTruthy();
    });

    test('should handle link color contrast', () => {
      render(
        <MantineProvider>
          <div style={{ backgroundColor: 'white' }}>
            <a href="https://example.com" style={{ color: '#0066cc' }}>
              This is a link with proper contrast
            </a>
          </div>
        </MantineProvider>,
      );

      const link = document.querySelector('a');
      expect(link).toBeInTheDocument();

      const { passes } = colorContrastUtils.getContrastFromElement(link!);
      expect(passes).toBeTruthy();
    });
  });

  describe('alert and Status Color Contrast', () => {
    const alertTypes = [
      { type: 'info', description: 'informational alerts' },
      { type: 'success', description: 'success messages' },
      { type: 'warning', description: 'warning notifications' },
      { type: 'error', description: 'error messages' },
    ];

    alertTypes.forEach(({ type, description }) => {
      test(`should meet contrast requirements for ${description}`, () => {
        render(
          <MantineProvider>
            <MockAlert color={type}>
              This is a {type} alert message that needs to be accessible.
            </MockAlert>
          </MantineProvider>,
        );

        const alert = document.querySelector('[role="alert"]') as HTMLElement;
        expect(alert).toBeInTheDocument();

        const { ratio, passes } = colorContrastUtils.getContrastFromElement(alert);
        expect(passes).toBeTruthy();
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('dark Theme Color Contrast', () => {
    const darkTheme = createTheme({
      colors: {
        dark: [
          '#C1C2C5', // 0
          '#A6A7AB', // 1
          '#909296', // 2
          '#5C5F66', // 3
          '#373A40', // 4
          '#2C2E33', // 5
          '#25262B', // 6
          '#1A1B1E', // 7
          '#141517', // 8
          '#101113', // 9
        ],
      },
    });

    test('should meet contrast requirements in dark mode', () => {
      render(
        <MantineProvider theme={darkTheme}>
          <div style={{ backgroundColor: '#1A1B1E', color: '#C1C2C5', padding: '16px' }}>
            <MockText>This is text in dark mode that should meet contrast requirements.</MockText>
            <MockButton variant="filled" color="blue">
              Dark Mode Button
            </MockButton>
          </div>
        </MantineProvider>,
      );

      const text = document.querySelector('p');
      const button = document.querySelector('button');

      expect(text).toBeInTheDocument();
      expect(button).toBeInTheDocument();

      // Test text contrast in dark mode
      const textContrast = colorContrastUtils.getContrastFromElement(text!);
      expect(textContrast.passes).toBeTruthy();

      // Test button contrast in dark mode
      const buttonContrast = colorContrastUtils.getContrastFromElement(button!);
      expect(buttonContrast.passes).toBeTruthy();
    });

    test('should handle dark mode state variants', () => {
      render(
        <MantineProvider theme={darkTheme}>
          <div style={{ backgroundColor: '#1A1B1E', padding: '16px' }}>
            <MockAlert color="error">Error message in dark mode</MockAlert>
            <MockAlert color="success">Success message in dark mode</MockAlert>
          </div>
        </MantineProvider>,
      );

      const alerts = document.querySelectorAll('[role="alert"]');

      alerts.forEach(alertNode => {
        const alertElement = alertNode as HTMLElement;
        const { passes } = colorContrastUtils.getContrastFromElement(alertElement);
        expect(passes).toBeTruthy();
      });
    });
  });

  describe('high Contrast Mode', () => {
    test('should work with Windows high contrast mode', async () => {
      // Simulate high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <MantineProvider>
          <div
            style={{
              backgroundColor: 'ButtonFace',
              color: 'ButtonText',
              border: '1px solid ButtonBorder',
            }}
          >
            <button
              style={{
                backgroundColor: 'ButtonFace',
                color: 'ButtonText',
                border: '1px solid ButtonBorder',
              }}
            >
              High Contrast Button
            </button>
          </div>
        </MantineProvider>,
      );

      // In high contrast mode, system colors are used
      // These should always meet contrast requirements
      const axe = await getAxe();
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  describe('interactive Element Focus Contrast', () => {
    test('should maintain contrast for focus indicators', () => {
      render(
        <MantineProvider>
          <div>
            <button
              style={{
                outline: '2px solid #0066cc',
                outlineOffset: '2px',
              }}
              data-testid="focused-button"
            >
              Focused Button
            </button>
          </div>
        </MantineProvider>,
      );

      const button = document.querySelector('[data-testid="focused-button"]');
      expect(button).toBeInTheDocument();

      // Focus indicators should have 3:1 contrast with adjacent colors
      const focusColor = '#0066cc';
      const backgroundColor = '#ffffff';
      const focusContrast = colorContrastUtils.getContrastRatio(focusColor, backgroundColor);

      expect(focusContrast).toBeGreaterThanOrEqual(3.0); // WCAG 2.1 focus indicator requirement
    });

    test('should handle custom focus styles', () => {
      render(
        <MantineProvider>
          <div>
            <input
              type="text"
              style={{
                boxShadow: '0 0 0 2px #0066cc',
                borderColor: '#0066cc',
              }}
              data-testid="focused-input"
            />
          </div>
        </MantineProvider>,
      );

      const input = document.querySelector('[data-testid="focused-input"]');
      expect(input).toBeInTheDocument();

      // Test that focus styles meet contrast requirements
      const focusContrast = colorContrastUtils.getContrastRatio('#0066cc', '#ffffff');
      expect(colorContrastUtils.meetsWCAGStandard(focusContrast, 'AA')).toBeTruthy();
    });
  });

  describe('integration with Design System', () => {
    test('should validate all design system color combinations', async () => {
      const colorCombinations = [
        { bg: '#ffffff', text: '#000000', name: 'black on white' },
        { bg: '#f8f9fa', text: '#495057', name: 'dark gray on light gray' },
        { bg: '#007bff', text: '#ffffff', name: 'white on primary blue' },
        { bg: '#28a745', text: '#ffffff', name: 'white on success green' },
        { bg: '#dc3545', text: '#ffffff', name: 'white on danger red' },
        { bg: '#ffc107', text: '#000000', name: 'black on warning yellow' },
      ];

      colorCombinations.forEach(({ bg, text, name }) => {
        const ratio = colorContrastUtils.getContrastRatio(text, bg);
        const passes = colorContrastUtils.meetsWCAGStandard(ratio);

        expect(passes).toBeTruthy();
        console.log(`✓ ${name}: ${ratio.toFixed(2)}:1 contrast ratio`);
      });
    });

    test('should work with CSS custom properties', () => {
      render(
        <MantineProvider>
          <div
            style={
              {
                '--text-color': '#333333',
                '--bg-color': '#ffffff',
                color: 'var(--text-color)',
                backgroundColor: 'var(--bg-color)',
              } as React.CSSProperties
            }
            data-testid="css-custom-props"
          >
            Text using CSS custom properties
          </div>
        </MantineProvider>,
      );

      const element = document.querySelector('[data-testid="css-custom-props"]');
      expect(element).toBeInTheDocument();

      const { passes } = colorContrastUtils.getContrastFromElement(element as HTMLElement);
      expect(passes).toBeTruthy();
    });
  });
});
