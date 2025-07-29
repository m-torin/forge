import { variants } from '@/utils/animationVariants';
import { describe, expect, test } from 'vitest';

describe('animationVariants', () => {
  describe('variants', () => {
    test('should return default animation variants', () => {
      const result = variants();

      expect(result).toHaveProperty('enter');
      expect(result).toHaveProperty('center');
      expect(result).toHaveProperty('exit');
    });

    test('should handle enter animation with positive direction', () => {
      const result = variants(500, 0.5);
      const enterResult = result.enter(1);

      expect(enterResult).toStrictEqual({
        x: 500,
        opacity: 0.5,
      });
    });

    test('should handle enter animation with negative direction', () => {
      const result = variants(500, 0.5);
      const enterResult = result.enter(-1);

      expect(enterResult).toStrictEqual({
        x: -500,
        opacity: 0.5,
      });
    });

    test('should handle center animation', () => {
      const result = variants(500, 0.5);

      expect(result.center).toStrictEqual({
        x: 0,
        opacity: 1,
      });
    });

    test('should handle exit animation with positive direction', () => {
      const result = variants(500, 0.5);
      const exitResult = result.exit(1);

      expect(exitResult).toStrictEqual({
        x: -500,
        opacity: 0.5,
      });
    });

    test('should handle exit animation with negative direction', () => {
      const result = variants(500, 0.5);
      const exitResult = result.exit(-1);

      expect(exitResult).toStrictEqual({
        x: 500,
        opacity: 0.5,
      });
    });

    test('should use default values when no parameters provided', () => {
      const result = variants();

      expect(result.enter(1)).toStrictEqual({
        x: 1000,
        opacity: 0,
      });

      expect(result.exit(-1)).toStrictEqual({
        x: 1000,
        opacity: 0,
      });
    });

    test('should handle zero values', () => {
      const result = variants(0, 0);

      expect(result.enter(1)).toStrictEqual({
        x: 0,
        opacity: 0,
      });

      expect(result.center).toStrictEqual({
        x: 0,
        opacity: 1,
      });

      expect(result.exit(1)).toStrictEqual({
        x: -0,
        opacity: 0,
      });
    });

    test('should handle negative x values', () => {
      const result = variants(-500, 0.5);

      expect(result.enter(1)).toStrictEqual({
        x: -500,
        opacity: 0.5,
      });

      expect(result.enter(-1)).toStrictEqual({
        x: 500,
        opacity: 0.5,
      });
    });

    test('should handle direction value of zero', () => {
      const result = variants(500, 0.5);

      // When direction is 0, it's treated as not positive
      expect(result.enter(0)).toStrictEqual({
        x: -500,
        opacity: 0.5,
      });

      // When direction is 0, it's treated as not negative
      expect(result.exit(0)).toStrictEqual({
        x: -500,
        opacity: 0.5,
      });
    });
  });
});
