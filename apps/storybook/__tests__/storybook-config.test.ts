import { MantineProvider } from '@mantine/core';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, test } from 'vitest';

// Import Storybook configuration
import mainConfig from '#/root/.storybook/main';
import previewConfig from '#/root/.storybook/preview';

describe('storybook Configuration', () => {
  describe('main Configuration', () => {
    test('should have valid main.ts configuration', () => {
      expect(mainConfig).toBeDefined();
      expect(mainConfig.framework).toBeDefined();
      expect(typeof mainConfig.framework).toBe('object');
    });

    test('should have required addons', () => {
      expect(mainConfig.addons).toBeDefined();
      expect(mainConfig.addons).toHaveLength(5);
      expect(mainConfig.addons).toStrictEqual(
        expect.arrayContaining([
          expect.stringContaining('@storybook/addon-themes'),
          expect.stringContaining('@storybook/addon-docs'),
          expect.stringContaining('@storybook/addon-a11y'),
        ]),
      );
    });

    test('should have correct story patterns', () => {
      expect(mainConfig.stories).toBeDefined();
      expect(mainConfig.stories).toStrictEqual(
        expect.arrayContaining([
          '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
          '../../../packages/uix-system/src/mantine/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
          '../../../packages/editor/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
        ]),
      );
    });

    test('should have webpack configuration', () => {
      expect(mainConfig.webpackFinal).toBeDefined();
      expect(typeof mainConfig.webpackFinal).toBe('function');
    });
  });

  describe('preview Configuration', () => {
    test('should have valid preview.tsx setup', () => {
      expect(previewConfig).toBeDefined();
      expect(previewConfig.decorators).toBeDefined();
      expect(previewConfig.parameters).toBeDefined();
    });

    test('should have theme decorators', () => {
      expect(previewConfig.decorators).toBeDefined();
      expect(Array.isArray(previewConfig.decorators)).toBeTruthy();
      expect(previewConfig.decorators).toHaveLength(2);
    });

    test('should have chromatic configuration', () => {
      expect(previewConfig.parameters?.chromatic).toBeDefined();
      expect(previewConfig.parameters?.chromatic?.modes).toBeDefined();
      expect(previewConfig.parameters?.chromatic?.modes?.dark).toBeDefined();
      expect(previewConfig.parameters?.chromatic?.modes?.light).toBeDefined();
    });

    test('should have theme configuration', () => {
      expect(previewConfig.parameters?.themes).toBeDefined();
      expect(previewConfig.parameters?.themes?.default).toBe('light');
      expect(previewConfig.parameters?.themes?.list).toHaveLength(2);
    });
  });

  describe('mantine Integration', () => {
    test('should render components with MantineProvider', () => {
      const TestComponent = () =>
        React.createElement('div', { 'data-testid': 'test-component' }, 'Test');

      render(React.createElement(MantineProvider, null, React.createElement(TestComponent)));

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    test('should support theme switching', () => {
      // Test that theme switching works
      expect(previewConfig.parameters?.themes?.list).toStrictEqual(
        expect.arrayContaining([
          { class: 'light', color: '#ffffff', name: 'light' },
          { class: 'dark', color: '#000000', name: 'dark' },
        ]),
      );
    });
  });
});
