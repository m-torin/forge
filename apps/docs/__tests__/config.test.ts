import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';

describe('Mintlify Configuration', () => {
  let mintConfig: any;

  beforeAll(() => {
    const configPath = join(process.cwd(), 'mint.json');
    const configContent = readFileSync(configPath, 'utf-8');
    mintConfig = JSON.parse(configContent);
  });

  test('should have valid schema structure', () => {
    expect(mintConfig).toHaveProperty('$schema');
    expect(mintConfig).toHaveProperty('name');
    expect(mintConfig).toHaveProperty('navigation');
    expect(Array.isArray(mintConfig.navigation)).toBe(true);
  });

  test('should have valid logo configuration', () => {
    expect(mintConfig.logo).toHaveProperty('dark');
    expect(mintConfig.logo).toHaveProperty('light');

    // Check if logo files exist
    expect(existsSync(join(process.cwd(), mintConfig.logo.dark))).toBe(true);
    expect(existsSync(join(process.cwd(), mintConfig.logo.light))).toBe(true);
  });

  test('should have valid favicon', () => {
    expect(mintConfig).toHaveProperty('favicon');
    expect(existsSync(join(process.cwd(), mintConfig.favicon))).toBe(true);
  });

  test('should have valid color scheme', () => {
    expect(mintConfig.colors).toHaveProperty('primary');
    expect(mintConfig.colors).toHaveProperty('light');
    expect(mintConfig.colors).toHaveProperty('dark');
    expect(mintConfig.colors).toHaveProperty('anchors');
  });

  test('should have valid topbar configuration', () => {
    expect(Array.isArray(mintConfig.topbarLinks)).toBe(true);
    expect(mintConfig.topbarCtaButton).toHaveProperty('name');
    expect(mintConfig.topbarCtaButton).toHaveProperty('url');
  });
});
