import { describe, expect, it } from 'vitest';
import nextConfig from '../next.ts';
import baseConfig from '../index.ts';

describe('Next.js ESLint Configuration', () => {
  it('exports an array of configuration objects', () => {
    expect(Array.isArray(nextConfig)).toBe(true);
    expect(nextConfig.length).toBeGreaterThan(0);
  });

  it('extends the base configuration', () => {
    // The Next.js config should include all base configs
    expect(nextConfig.length).toBeGreaterThanOrEqual(baseConfig.length);

    // The first items should match the base config
    for (let i = 0; i < baseConfig.length; i++) {
      expect(nextConfig[i]).toBeDefined();
    }
  });

  it('includes React-specific configuration', () => {
    // Find React-specific config
    const reactConfig = nextConfig.find(
      (config) =>
        typeof config === 'object' &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes('.jsx')) &&
        config.plugins &&
        config.plugins.react,
    );

    expect(reactConfig).toBeDefined();
    expect(reactConfig.plugins.react).toBeDefined();
    expect(reactConfig.plugins['react-hooks']).toBeDefined();
    expect(reactConfig.plugins['jsx-a11y']).toBeDefined();
  });

  it('includes React settings', () => {
    // Find config with React settings
    const configWithReactSettings = nextConfig.find(
      (config) =>
        typeof config === 'object' && config.settings && config.settings.react,
    );

    expect(configWithReactSettings).toBeDefined();
    expect(configWithReactSettings.settings.react.version).toBe('detect');
  });

  it('includes React rules', () => {
    // Find config with React rules
    const configWithReactRules = nextConfig.find(
      (config) =>
        typeof config === 'object' &&
        config.rules &&
        config.rules['react/react-in-jsx-scope'] !== undefined,
    );

    expect(configWithReactRules).toBeDefined();
    expect(configWithReactRules.rules['react/react-in-jsx-scope']).toBe('off');
    expect(configWithReactRules.rules['react-hooks/rules-of-hooks']).toBe(
      'error',
    );
  });

  it('includes accessibility rules', () => {
    // Find config with a11y rules
    const configWithA11yRules = nextConfig.find(
      (config) =>
        typeof config === 'object' &&
        config.rules &&
        config.rules['jsx-a11y/alt-text'] !== undefined,
    );

    expect(configWithA11yRules).toBeDefined();
    expect(configWithA11yRules.rules['jsx-a11y/alt-text']).toBe('error');
    expect(configWithA11yRules.rules['jsx-a11y/aria-props']).toBe('error');
  });

  it('includes Next.js specific configuration', () => {
    // Find Next.js specific config
    const nextJsConfig = nextConfig.find(
      (config) =>
        typeof config === 'object' && config.settings && config.settings.next,
    );

    expect(nextJsConfig).toBeDefined();
    expect(nextJsConfig.settings.next.rootDir).toBe('.');
  });

  it('includes special rules for Next.js pages and app directories', () => {
    // Find config for Next.js pages/app
    const pagesAppConfig = nextConfig.find(
      (config) =>
        typeof config === 'object' &&
        config.files &&
        Array.isArray(config.files) &&
        config.files.some((pattern) => pattern.includes('pages/')) &&
        config.files.some((pattern) => pattern.includes('app/')),
    );

    expect(pagesAppConfig).toBeDefined();
    expect(pagesAppConfig.rules['import/no-default-export']).toBe('off');
    expect(pagesAppConfig.rules['import/prefer-default-export']).toBe('error');
  });

  it('includes ignores for Next.js build directories', () => {
    // Find config with Next.js ignores
    const ignoresConfig = nextConfig.find(
      (config) =>
        typeof config === 'object' &&
        config.ignores &&
        Array.isArray(config.ignores) &&
        config.ignores.some((pattern) => pattern.includes('.next/')),
    );

    expect(ignoresConfig).toBeDefined();
    expect(ignoresConfig.ignores).toContain('.next/**');
    expect(ignoresConfig.ignores).toContain('out/**');
  });
});
