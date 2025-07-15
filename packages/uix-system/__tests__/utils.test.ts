import { cn, getMantineSpacing, validateMantineSpacing } from '#/mantine/utils';
import { createTailwindV3Classes, getTailwindV3Spacing } from '#/tailwind/v3/utils';
import { createV4CustomProperty, getTailwindV4Spacing } from '#/tailwind/v4/utils';
import { describe, expect } from 'vitest';

describe('uIX System Utils', () => {
  describe('shared Utils', () => {
    describe('cn', () => {
      test('should combine class names', () => {
        expect(cn('class1', 'class2')).toBe('class1 class2');
      });

      test('should handle conditional classes', () => {
        expect(cn('base', true && 'active', false && 'inactive')).toBe('base active');
      });
    });
  });

  describe('mantine Utils', () => {
    describe('getMantineSpacing', () => {
      test('should return Mantine CSS variables', () => {
        expect(getMantineSpacing('md')).toBe('var(--mantine-spacing-md)');
        expect(getMantineSpacing('lg')).toBe('var(--mantine-spacing-lg)');
      });
    });

    describe('validateMantineSpacing', () => {
      test('should validate Mantine spacing values', () => {
        expect(validateMantineSpacing('md')).toBeTruthy();
        expect(validateMantineSpacing('invalid')).toBeFalsy();
        expect(validateMantineSpacing(123)).toBeFalsy();
      });
    });
  });

  describe('tailwind V3 Utils', () => {
    describe('getTailwindV3Spacing', () => {
      test('should return correct spacing values', () => {
        expect(getTailwindV3Spacing('4')).toBe('1rem');
        expect(getTailwindV3Spacing('8')).toBe('2rem');
      });
    });

    describe('createTailwindV3Classes', () => {
      test('should create class strings', () => {
        const classes = createTailwindV3Classes({
          spacing: '4',
          textColor: { color: 'blue', shade: '500' },
          bgColor: { color: 'gray', shade: '100' },
          radius: 'md',
        });
        expect(classes).toBe('p-4 text-blue-500 bg-gray-100 rounded-md');
      });
    });
  });

  describe('tailwind V4 Utils', () => {
    describe('getTailwindV4Spacing', () => {
      test('should return CSS variables with fallbacks', () => {
        expect(getTailwindV4Spacing('4')).toBe('var(--spacing-4, 1rem)');
        expect(getTailwindV4Spacing('8')).toBe('var(--spacing-8, 2rem)');
      });
    });

    describe('createV4CustomProperty', () => {
      test('should create custom properties', () => {
        expect(createV4CustomProperty('my-color', '#fff')).toBe('var(--my-color)');
        expect(createV4CustomProperty('my-size', '1rem', '16px')).toBe('var(--my-size, 16px)');
      });
    });
  });
});
