import packageJson from '#/root/package.json';
import { describe, expect, test } from 'vitest';

describe('package Dependencies', () => {
  test('should have @repo/ai as a workspace dependency', () => {
    expect(packageJson.dependencies).toHaveProperty('@repo/ai');
    expect(packageJson.dependencies['@repo/ai']).toBe('workspace:*');
  });

  test('should have @repo/observability as a workspace dependency', () => {
    expect(packageJson.dependencies).toHaveProperty('@repo/observability');
    expect(packageJson.dependencies['@repo/observability']).toBe('workspace:*');
  });

  test('should have AI SDK dependencies', () => {
    expect(packageJson.dependencies).toHaveProperty('@ai-sdk/provider');
    expect(packageJson.dependencies).toHaveProperty('@ai-sdk/react');
    expect(packageJson.dependencies).toHaveProperty('@ai-sdk/xai');
  });

  test('should have correct AI SDK versions', () => {
    // Check that we're using the expected AI SDK versions
    expect(packageJson.dependencies['@ai-sdk/provider']).toBe('2.0.0-beta.1');
    expect(packageJson.dependencies['@ai-sdk/react']).toBe('2.0.0-beta.6');
    expect(packageJson.dependencies['@ai-sdk/xai']).toBe('2.0.0-beta.2');
  });

  test('should have Next.js and React dependencies', () => {
    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('react-dom');
  });

  test('should have UI framework dependencies', () => {
    expect(packageJson.dependencies).toHaveProperty('@radix-ui/react-dropdown-menu');
    expect(packageJson.dependencies).toHaveProperty('@radix-ui/react-slot');
    expect(packageJson.dependencies).toHaveProperty('class-variance-authority');
    expect(packageJson.dependencies).toHaveProperty('clsx');
    expect(packageJson.dependencies).toHaveProperty('tailwind-merge');
  });

  test('should have authentication dependencies', () => {
    expect(packageJson.dependencies).toHaveProperty('next-auth');
  });

  test('should have database dependencies', () => {
    expect(packageJson.dependencies).toHaveProperty('drizzle-orm');
    expect(packageJson.dependencies).toHaveProperty('postgres');
  });

  test('should have development dependencies', () => {
    expect(packageJson.devDependencies).toHaveProperty('@repo/qa');
    expect(packageJson.devDependencies).toHaveProperty('@repo/eslint-config');
    expect(packageJson.devDependencies).toHaveProperty('@repo/config');
  });

  test('should have testing dependencies', () => {
    expect(packageJson.devDependencies).toHaveProperty('vitest');
    expect(packageJson.devDependencies).toHaveProperty('@testing-library/react');
    expect(packageJson.devDependencies).toHaveProperty('@testing-library/jest-dom');
  });

  test('should have correct package name and version', () => {
    expect(packageJson.name).toBe('ai-chatbot');
    expect(packageJson.version).toBeDefined();
  });

  test('should have correct scripts', () => {
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('lint');
    expect(packageJson.scripts).toHaveProperty('typecheck');
    expect(packageJson.scripts).toHaveProperty('test');
  });
});
