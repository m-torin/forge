import { describe, it, expect } from 'vitest';

import { extractFromHtml } from '../shared/patterns/quick-scrape';
import { ScrapingConfig, SelectorMap } from '../shared/types/scraping-types';
import { validateConfigOrThrow } from '../shared/utils/validation';

describe('Shared Scraping Utilities', () => {
  describe('extractFromHtml', () => {
    it('should extract data from HTML string', async () => {
      const html = `
        <html>
          <head>
            <title>Test Page</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <h1>Test Heading</h1>
            <div class="content">Test content</div>
          </body>
        </html>
      `;

      const selectors: SelectorMap = {
        title: { selector: 'h1' },
        description: { selector: 'meta[name="description"]', attribute: 'content' },
        content: { selector: '.content' },
      };

      const result = await extractFromHtml(html, selectors);

      expect(result).toEqual({
        title: 'Test Heading',
        description: 'Test description',
        content: 'Test content',
      });
    });

    it('should handle missing elements', async () => {
      const html = '<div>Test</div>';
      const selectors: SelectorMap = {
        title: { selector: 'h1' },
        content: { selector: '.content' },
      };

      const result = await extractFromHtml(html, selectors);

      expect(result).toEqual({
        title: null,
        content: null,
      });
    });
  });

  describe('validateConfigOrThrow', () => {
    it('should validate a valid config', () => {
      const config: ScrapingConfig = {
        providers: {
          'node-fetch': { timeout: 5000 },
        },
      };

      expect(() => validateConfigOrThrow(config)).not.toThrow();
    });

    it('should reject an invalid config', () => {
      const config = {
        providers: {
          'node-fetch': {
            timeout: 'invalid-number', // This should cause validation to fail
          },
        },
      };

      expect(() => validateConfigOrThrow(config)).toThrow();
    });
  });
});
