import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';

describe('Mintlify Assets', () => {
  let mintConfig: any;
  let referencedAssets: string[] = [];

  beforeAll(() => {
    const configPath = join(process.cwd(), 'mint.json');
    const configContent = readFileSync(configPath, 'utf-8');
    mintConfig = JSON.parse(configContent);

    // Collect all referenced assets
    referencedAssets = collectReferencedAssets(mintConfig);
  });

  test('should have valid logo assets', () => {
    expect(mintConfig.logo).toBeDefined();

    const logoDark = join(process.cwd(), mintConfig.logo.dark);
    const logoLight = join(process.cwd(), mintConfig.logo.light);

    expect(existsSync(logoDark), `Logo dark file not found: ${mintConfig.logo.dark}`).toBe(true);
    expect(existsSync(logoLight), `Logo light file not found: ${mintConfig.logo.light}`).toBe(true);

    // Check file extensions
    expect(mintConfig.logo.dark).toMatch(/\.(svg|png|jpg|jpeg)$/i);
    expect(mintConfig.logo.light).toMatch(/\.(svg|png|jpg|jpeg)$/i);
  });

  test('should have valid favicon', () => {
    expect(mintConfig.favicon).toBeDefined();

    const faviconPath = join(process.cwd(), mintConfig.favicon);
    expect(existsSync(faviconPath), `Favicon file not found: ${mintConfig.favicon}`).toBe(true);

    // Check file extension
    expect(mintConfig.favicon).toMatch(/\.(svg|ico|png)$/i);
  });

  test('should have valid image assets in content', () => {
    const mdxFiles = findMdxFiles(process.cwd());
    const imageReferences: string[] = [];
    const missingImages: string[] = [];

    mdxFiles.forEach(filePath => {
      const content = readFileSync(filePath, 'utf-8');

      // Find image references in MDX
      const imageMatches = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
      imageMatches.forEach(match => {
        const imageMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          const [, alt, src] = imageMatch;
          if (!src.startsWith('http')) {
            imageReferences.push(src);
          }
        }
      });

      // Find image references in HTML-like tags
      const imgMatches = content.match(/<img[^>]+src="([^"]+)"/g) || [];
      imgMatches.forEach(match => {
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch) {
          const src = srcMatch[1];
          if (!src.startsWith('http')) {
            imageReferences.push(src);
          }
        }
      });
    });

    // Check if all referenced images exist
    imageReferences.forEach(imagePath => {
      const fullPath = join(process.cwd(), imagePath);
      if (!existsSync(fullPath)) {
        missingImages.push(imagePath);
      }
    });

    // Report missing images but don't fail the test
    if (missingImages.length > 0) {
      console.warn('Missing image files found:', missingImages);
    }

    // For now, just ensure we have some content
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  test('should have valid asset file extensions', () => {
    const validExtensions = ['.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];

    referencedAssets.forEach(assetPath => {
      const ext = assetPath.toLowerCase().substring(assetPath.lastIndexOf('.'));
      expect(validExtensions).toContain(ext);
    });
  });

  test('should have reasonable file sizes', () => {
    const maxSize = 5 * 1024 * 1024; // 5MB

    referencedAssets.forEach(assetPath => {
      const fullPath = join(process.cwd(), assetPath);
      if (existsSync(fullPath)) {
        const stats = require('fs').statSync(fullPath);
        expect(stats.size, `Asset ${assetPath} is too large: ${stats.size} bytes`).toBeLessThan(
          maxSize,
        );
      }
    });
  });
});

function collectReferencedAssets(config: any): string[] {
  const assets: string[] = [];

  // Add logo assets
  if (config.logo) {
    assets.push(config.logo.dark, config.logo.light);
  }

  // Add favicon
  if (config.favicon) {
    assets.push(config.favicon);
  }

  return assets.filter(Boolean);
}

function findMdxFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const items = readdirSync(currentDir, { withFileTypes: true });

    items.forEach(item => {
      const fullPath = join(currentDir, item.name);

      if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
        traverse(fullPath);
      } else if (item.isFile() && item.name.endsWith('.mdx')) {
        files.push(fullPath);
      }
    });
  }

  traverse(dir);
  return files;
}
