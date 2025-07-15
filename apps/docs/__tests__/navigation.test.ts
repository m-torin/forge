import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';

describe('Mintlify Navigation', () => {
  let mintConfig: any;
  let navigationPages: string[] = [];

  beforeAll(() => {
    const configPath = join(process.cwd(), 'mint.json');
    const configContent = readFileSync(configPath, 'utf-8');
    mintConfig = JSON.parse(configContent);

    // Extract all page paths from navigation
    navigationPages = extractPagePaths(mintConfig.navigation);
  });

  test('should have navigation structure', () => {
    expect(mintConfig.navigation).toBeDefined();
    expect(Array.isArray(mintConfig.navigation)).toBe(true);
    expect(mintConfig.navigation.length).toBeGreaterThan(0);
  });

  test('should have valid page references', () => {
    navigationPages.forEach(pagePath => {
      const filePath = join(process.cwd(), `${pagePath}.mdx`);
      expect(existsSync(filePath), `Page ${pagePath}.mdx does not exist`).toBe(true);
    });
  });

  test('should have no duplicate page references', () => {
    const uniquePages = new Set(navigationPages);
    expect(uniquePages.size).toBe(navigationPages.length);
  });

  test('should have valid group structure', () => {
    mintConfig.navigation.forEach((group: any) => {
      expect(group).toHaveProperty('group');
      expect(typeof group.group).toBe('string');
      expect(group.group.length).toBeGreaterThan(0);
    });
  });

  test('should have valid page metadata', () => {
    navigationPages.forEach(pagePath => {
      const filePath = join(process.cwd(), `${pagePath}.mdx`);
      const content = readFileSync(filePath, 'utf-8');

      // Check for frontmatter
      expect(content).toMatch(/^---\s*\n/);
      expect(content).toMatch(/\n---\s*\n/);

      // Check for title
      expect(content).toMatch(/title:/);
    });
  });
});

function extractPagePaths(navigation: any[]): string[] {
  const pages: string[] = [];

  function traverse(items: any[]) {
    items.forEach(item => {
      if (typeof item === 'string') {
        pages.push(item);
      } else if (item.pages) {
        traverse(item.pages);
      }
    });
  }

  traverse(navigation);
  return pages;
}
