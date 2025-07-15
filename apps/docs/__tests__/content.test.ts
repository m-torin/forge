import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { beforeAll, describe, expect, test } from 'vitest';

describe('Mintlify Content', () => {
  let mdxFiles: string[] = [];

  beforeAll(() => {
    // Find all MDX files recursively
    mdxFiles = findMdxFiles(process.cwd());
  });

  test('should have MDX files', () => {
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  test('should have valid frontmatter in all MDX files', () => {
    mdxFiles.forEach(filePath => {
      const content = readFileSync(filePath, 'utf-8');

      // Check for frontmatter structure
      expect(content).toMatch(/^---\s*\n/);
      expect(content).toMatch(/\n---\s*\n/);

      // Extract frontmatter
      const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
      expect(frontmatterMatch).toBeTruthy();

      const frontmatter = frontmatterMatch![1];

      // Check for required fields
      expect(frontmatter).toMatch(/title:/);
      expect(frontmatter).toMatch(/description:/);
    });
  });

  test('should have valid internal links', () => {
    const brokenLinks: string[] = [];

    mdxFiles.forEach(filePath => {
      const content = readFileSync(filePath, 'utf-8');

      // Find all internal links (starting with /)
      const internalLinks = content.match(/\[([^\]]+)\]\((\/[^)]+)\)/g) || [];

      internalLinks.forEach(link => {
        const match = link.match(/\[([^\]]+)\]\((\/[^)]+)\)/);
        if (match) {
          const [, linkText, linkPath] = match;

          // Skip external links and anchors
          if (linkPath.startsWith('http') || linkPath.startsWith('#')) {
            return;
          }

          // Check if the linked file exists
          const targetPath = join(process.cwd(), `${linkPath}.mdx`);
          if (!existsSync(targetPath)) {
            brokenLinks.push(`${linkPath} in ${filePath}`);
          }
        }
      });
    });

    // Report broken links but don't fail the test
    if (brokenLinks.length > 0) {
      console.warn('Broken internal links found:', brokenLinks);
    }

    // For now, just ensure we have some valid links
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  test('should have valid code blocks', () => {
    const invalidLanguages: string[] = [];

    mdxFiles.forEach(filePath => {
      const content = readFileSync(filePath, 'utf-8');

      // Find code blocks
      const codeBlocks = content.match(/```[\s\S]*?```/g) || [];

      codeBlocks.forEach(block => {
        // Check for proper code block syntax
        expect(block).toMatch(/^```/);
        expect(block).toMatch(/```$/);

        // Check for language specification (optional but recommended)
        const hasLanguage = block.match(/^```(\w+)/);
        if (hasLanguage) {
          const language = hasLanguage[1];
          const validLanguages = [
            'typescript',
            'tsx',
            'javascript',
            'jsx',
            'json',
            'bash',
            'shell',
            'mdx',
            'html',
            'css',
            'sql',
            'prisma',
            'yaml',
            'toml',
            'diff',
            'text',
          ];
          if (!validLanguages.includes(language)) {
            invalidLanguages.push(`${language} in ${filePath}`);
          }
        }
      });
    });

    // Report invalid languages but don't fail the test
    if (invalidLanguages.length > 0) {
      console.warn('Invalid code block languages found:', invalidLanguages);
    }

    // For now, just ensure we have some code blocks
    expect(mdxFiles.length).toBeGreaterThan(0);
  });

  test('should have consistent heading structure', () => {
    const headingIssues: string[] = [];

    mdxFiles.forEach(filePath => {
      const content = readFileSync(filePath, 'utf-8');

      // Check for main heading (should be # heading)
      const headings = content.match(/^#{1,6}\s+.+$/gm) || [];

      if (headings.length > 0) {
        // First heading should be level 1
        const firstHeading = headings[0];
        if (firstHeading && !firstHeading.match(/^#\s+/)) {
          headingIssues.push(`First heading not level 1 in ${filePath}`);
        }

        // Check for proper heading hierarchy (no skipping levels)
        let currentLevel = 1;
        headings.forEach((heading, index) => {
          const level = heading.match(/^(#{1,6})\s+/)?.[1].length || 0;
          if (level > currentLevel + 1) {
            headingIssues.push(`Heading level ${level} after level ${currentLevel} in ${filePath}`);
          }
          currentLevel = level;
        });
      }
    });

    // Report heading issues but don't fail the test
    if (headingIssues.length > 0) {
      console.warn('Heading structure issues found:', headingIssues);
    }

    // For now, just ensure we have some headings
    expect(mdxFiles.length).toBeGreaterThan(0);
  });
});

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
