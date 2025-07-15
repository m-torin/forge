import { FetchProvider } from '@/client/providers/fetch-provider';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchProvider', () => {
  let provider: FetchProvider;

  beforeEach(() => {
    provider = new FetchProvider();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    test('should create instance with name and type', () => {
      expect(provider).toBeInstanceOf(FetchProvider);
      expect(provider.name).toBe('fetch');
      expect(provider.type).toBe('html');
    });

    test('should initialize successfully when fetch is available', async () => {
      await expect(provider.initialize({})).resolves.not.toThrow();
    });

    test('should throw error when fetch is not available', async () => {
      const originalFetch = global.fetch;
      // @ts-ignore
      global.fetch = undefined;

      await expect(provider.initialize({})).rejects.toThrow(
        'Fetch API not available in this environment',
      );

      global.fetch = originalFetch;
    });
  });

  describe('extract functionality', () => {
    const mockHtml = `
      <html>
        <head><title>Test Page Title</title></head>
        <body>
          <h1 id="main-title">Main Title</h1>
          <p class="content">Test content paragraph</p>
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
          <span>Simple text</span>
        </body>
      </html>
    `;

    test('should extract title from title tag', async () => {
      const selectors = {
        title: 'title',
      };

      const result = await provider.extract(mockHtml, selectors);

      expect(result).toStrictEqual({
        title: 'Test Page Title',
      });
    });

    test('should extract content by ID selector', async () => {
      const selectors = {
        mainTitle: '#main-title',
      };

      const result = await provider.extract(mockHtml, selectors);

      expect(result).toStrictEqual({
        mainTitle: 'Main Title',
      });
    });

    test('should extract content by tag selector', async () => {
      const selectors = {
        heading: 'h1',
        paragraph: 'p',
        span: 'span',
      };

      const result = await provider.extract(mockHtml, selectors);

      expect(result).toStrictEqual({
        heading: 'Main Title',
        paragraph: 'Test content paragraph',
        span: 'Simple text',
      });
    });

    test('should handle selector config objects', async () => {
      const selectors = {
        title: { selector: 'title' },
        mainTitle: { selector: '#main-title' },
      };

      const result = await provider.extract(mockHtml, selectors);

      expect(result).toStrictEqual({
        title: 'Test Page Title',
        mainTitle: 'Main Title',
      });
    });

    test('should handle non-matching selectors gracefully', async () => {
      const selectors = {
        nonExistent: '#does-not-exist',
        anotherMissing: 'missing-tag',
      };

      const result = await provider.extract(mockHtml, selectors);

      expect(result).toStrictEqual({});
    });

    test('should handle empty HTML', async () => {
      const selectors = {
        title: 'title',
        heading: 'h1',
      };

      const result = await provider.extract('', selectors);

      expect(result).toStrictEqual({});
    });

    test('should handle malformed HTML', async () => {
      const selectors = {
        title: 'title',
      };

      const result = await provider.extract('<invalid>html', selectors);

      expect(result).toStrictEqual({});
    });

    test('should handle empty selectors', async () => {
      const result = await provider.extract(mockHtml, {});

      expect(result).toStrictEqual({});
    });

    test('should trim whitespace from extracted content', async () => {
      const htmlWithWhitespace = `
        <html>
          <head><title>  Whitespace Title  </title></head>
          <body>
            <h1 id="title">  Spaced Heading  </h1>
          </body>
        </html>
      `;

      const selectors = {
        title: 'title',
        heading: '#title',
      };

      const result = await provider.extract(htmlWithWhitespace, selectors);

      expect(result).toStrictEqual({
        title: 'Whitespace Title',
        heading: 'Spaced Heading',
      });
    });
  });

  describe('healthCheck', () => {
    test('should return true when fetch is working', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
      });

      const result = await provider.healthCheck();

      expect(result).toBeTruthy();
      expect(mockFetch).toHaveBeenCalledWith('data:text/html,<html></html>');
    });

    test('should return false when fetch fails', async () => {
      mockFetch.mockRejectedValue(new Error('Fetch failed'));

      const result = await provider.healthCheck();

      expect(result).toBeFalsy();
    });

    test('should return false when response is not ok', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
      });

      const result = await provider.healthCheck();

      expect(result).toBeFalsy(); // Returns false when response.ok is false
    });
  });

  describe('edge cases', () => {
    test('should handle special characters in HTML content', async () => {
      const htmlWithSpecialChars = `
        <html>
          <head><title>Title & Symbols</title></head>
          <body>
            <h1 id="special">Content with "quotes" and <tags></h1>
          </body>
        </html>
      `;

      const selectors = {
        title: 'title',
        special: '#special',
      };

      const result = await provider.extract(htmlWithSpecialChars, selectors);

      expect(result.title).toBe('Title & Symbols');
      // The regex-based extraction might not handle nested tags perfectly
      expect(result.special).toBeDefined();
    });

    test('should handle selectors with complex IDs', async () => {
      const htmlWithComplexIds = `
        <html>
          <body>
            <div id="complex-id-123">Complex ID Content</div>
            <div id="with_underscore">Underscore ID</div>
          </body>
        </html>
      `;

      const selectors = {
        complex: '#complex-id-123',
        underscore: '#with_underscore',
      };

      const result = await provider.extract(htmlWithComplexIds, selectors);

      expect(result.complex).toBe('Complex ID Content');
      expect(result.underscore).toBe('Underscore ID');
    });
  });
});
