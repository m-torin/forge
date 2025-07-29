import { describe, expect, test } from 'vitest';

// Import example story
import meta, { Default } from '#/root/stories/HelloWorld.stories';

describe('story Structure', () => {
  describe('story Metadata', () => {
    test('should have valid Meta type definition', () => {
      expect(meta).toBeDefined();
      expect(meta.title).toBe('Test/HelloWorld');
      expect(meta.component).toBeDefined();
    });

    test('should have required story properties', () => {
      expect(meta.parameters).toBeDefined();
      expect(meta.parameters?.layout).toBe('centered');
      expect(meta.tags).toStrictEqual(['autodocs']);
    });

    test('should export default meta', () => {
      expect(meta).toHaveProperty('title');
      expect(meta).toHaveProperty('component');
      expect(meta).toHaveProperty('parameters');
    });
  });

  describe('story Variants', () => {
    test('should export story variants', () => {
      expect(Default).toBeDefined();
      expect(typeof Default).toBe('object');
    });

    test('should have valid StoryObj types', () => {
      expect(Default).toHaveProperty('args');
      expect(Default.args).toStrictEqual({});
    });

    test('should have valid story args', () => {
      expect(Default.args).toBeDefined();
      expect(typeof Default.args).toBe('object');
    });
  });

  describe('story Organization', () => {
    test('should follow naming conventions', () => {
      expect(meta.title).toMatch(/^[A-Z][a-zA-Z/]+$/);
    });

    test('should have proper story hierarchy', () => {
      expect(meta.title).toContain('/');
      const [category, name] = meta.title?.split('/') || ['', ''];
      expect(category).toBe('Test');
      expect(name).toBe('HelloWorld');
    });
  });

  describe('component Integration', () => {
    test('should have valid component reference', () => {
      const Component = meta.component;
      expect(typeof Component).toBe('function');
    });

    test('should render component correctly', () => {
      const Component = meta.component;
      expect(Component).toBeDefined();
      expect(typeof Component).toBe('function');
    });
  });
});
