import { describe, expect } from 'vitest';

import {
  cleanText,
  extractEmails,
  extractImages,
  extractLinks,
  extractMetadata,
  extractPhoneNumbers,
  extractStructuredData,
  extractText,
} from '@/shared/utils/extraction';

describe('extraction Utilities', () => {
  describe('extractText', () => {
    test('should extract text from HTML', () => {
      const html = '<div><p>Hello <strong>World</strong></p><span>Test</span></div>';
      const result = extractText(html);

      expect(result).toBe('Hello World Test');
    });

    test('should handle empty HTML', () => {
      expect(extractText('')).toBe('');
    });

    test('should remove script and style tags', () => {
      const html = `
        <div>
          <script>console.log('test');</script>
          <p>Visible text</p>
          <style>body { color: red, }</style>
          <span>More text</span>
        </div>
      `;
      const result = extractText(html);

      expect(result).toBe('Visible text More text');
    });

    test('should handle nested elements', () => {
      const html = '<div><p>Outer <span>Inner <em>Deep</em></span> Text</p></div>';
      const result = extractText(html);

      expect(result).toBe('Outer Inner Deep Text');
    });

    test('should preserve spacing between elements', () => {
      const html = '<div>First</div><div>Second</div>';
      const result = extractText(html);

      expect(result).toBe('First Second');
    });
  });

  describe('extractLinks', () => {
    test('should extract absolute links', () => {
      const html = `
        <a href="https://example.com">Example</a>
        <a href="https://test.com">Test</a>
      `;
      const result = extractLinks(html);

      expect(result).toStrictEqual([
        { href: 'https://example.com', text: 'Example' },
        { href: 'https://test.com', text: 'Test' },
      ]);
    });

    test('should resolve relative links with base URL', () => {
      const html = `
        <a href="/about">About</a>
        <a href="contact">Contact</a>
      `;
      const result = extractLinks(html, 'https://example.com');

      expect(result).toStrictEqual([
        { href: 'https://example.com/about', text: 'About' },
        { href: 'https://example.com/contact', text: 'Contact' },
      ]);
    });

    test('should handle links without href', () => {
      const html = '<a>No href</a><a href="">Empty href</a>';
      const result = extractLinks(html);

      expect(result).toStrictEqual([]);
    });

    test('should extract link text with nested elements', () => {
      const html = '<a href="/test">Click <strong>here</strong> now</a>';
      const result = extractLinks(html);

      expect(result).toStrictEqual([{ href: '/test', text: 'Click here now' }]);
    });

    test('should handle mailto and tel links', () => {
      const html = `
        <a href="mailto:test@example.com">Email</a>
        <a href="tel:+1234567890">Phone</a>
      `;
      const result = extractLinks(html);

      expect(result).toStrictEqual([
        { href: 'mailto:test@example.com', text: 'Email' },
        { href: 'tel:+1234567890', text: 'Phone' },
      ]);
    });
  });

  describe('extractImages', () => {
    test('should extract image sources', () => {
      const html = `
        <img src="https://example.com/image1.jpg" alt="Image 1">
        <img src="/images/photo.png" alt="Photo">
      `;
      const result = extractImages(html);

      expect(result).toStrictEqual([
        { src: 'https://example.com/image1.jpg', alt: 'Image 1' },
        { src: '/images/photo.png', alt: 'Photo' },
      ]);
    });

    test('should resolve relative image URLs', () => {
      const html = '<img src="logo.png" alt="Logo">';
      const result = extractImages(html, 'https://example.com');

      expect(result).toStrictEqual([{ src: 'https://example.com/logo.png', alt: 'Logo' }]);
    });

    test('should handle images without alt text', () => {
      const html = '<img src="test.jpg">';
      const result = extractImages(html);

      expect(result).toStrictEqual([{ src: 'test.jpg', alt: '' }]);
    });

    test('should skip images without src', () => {
      const html = '<img alt="No source">';
      const result = extractImages(html);

      expect(result).toStrictEqual([]);
    });

    test('should handle data URLs', () => {
      const html = '<img src="data:image/png;base64,iVBORw0KG..." alt="Data">';
      const result = extractImages(html);

      expect(result).toStrictEqual([{ src: 'data:image/png;base64,iVBORw0KG...', alt: 'Data' }]);
    });
  });

  describe('extractMetadata', () => {
    test('should extract meta tags', () => {
      const html = `
        <html>
          <head>
            <title>Page Title</title>
            <meta name="description" content="Page description">
            <meta name="keywords" content="test, example">
            <meta property="og:title" content="Open Graph Title">
            <meta property="og:image" content="https://example.com/og.jpg">
          </head>
        </html>
      `;
      const result = extractMetadata(html);

      expect(result).toStrictEqual({
        title: 'Page Title',
        description: 'Page description',
        keywords: 'test, example',
        'og:title': 'Open Graph Title',
        'og:image': 'https://example.com/og.jpg',
      });
    });

    test('should handle missing metadata', () => {
      const html = '<html><body>Content</body></html>';
      const result = extractMetadata(html);

      expect(result).toStrictEqual({
        title: '',
      });
    });

    test('should prioritize property over name', () => {
      const html = `
        <meta name="author" content="Name Author">
        <meta property="author" content="Property Author">
      `;
      const result = extractMetadata(html);

      expect(result.author).toBe('Property Author');
    });
  });

  describe('extractStructuredData', () => {
    test('should extract JSON-LD structured data', () => {
      const html = `
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Test Product",
          "price": "19.99"
        }
        </script>
      `;
      const result = extractStructuredData(html);

      expect(result).toStrictEqual([
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Test Product',
          price: '19.99',
        },
      ]);
    });

    test('should handle multiple structured data blocks', () => {
      const html = `
        <script type="application/ld+json">
        {"@type": "Organization", "name": "Company"}
        </script>
        <script type="application/ld+json">
        {"@type": "Product", "name": "Product"}
        </script>
      `;
      const result = extractStructuredData(html);

      expect(result).toHaveLength(2);
      expect(result[0]['@type']).toBe('Organization');
      expect(result[1]['@type']).toBe('Product');
    });

    test('should handle invalid JSON gracefully', () => {
      const html = `
        <script type="application/ld+json">
        {invalid json}
        </script>
      `;
      const result = extractStructuredData(html);

      expect(result).toStrictEqual([]);
    });
  });

  describe('extractEmails', () => {
    test('should extract email addresses', () => {
      const text = 'Contact us at info@example.com or support@test.com';
      const result = extractEmails(text);

      expect(result).toStrictEqual(['info@example.com', 'support@test.com']);
    });

    test('should handle complex email formats', () => {
      const text = 'Email: user.name+tag@example.co.uk';
      const result = extractEmails(text);

      expect(result).toStrictEqual(['user.name+tag@example.co.uk']);
    });

    test('should avoid false positives', () => {
      const text = 'Price is $10.99 @ store';
      const result = extractEmails(text);

      expect(result).toStrictEqual([]);
    });

    test('should extract unique emails', () => {
      const text = 'Email test@example.com or test@example.com for info';
      const result = extractEmails(text);

      expect(result).toStrictEqual(['test@example.com']);
    });
  });

  describe('extractPhoneNumbers', () => {
    test('should extract US phone numbers', () => {
      const text = 'Call us at (555) 123-4567 or 555-987-6543';
      const result = extractPhoneNumbers(text);

      expect(result).toStrictEqual(['(555) 123-4567', '555-987-6543']);
    });

    test('should extract international format', () => {
      const text = 'International: +1-555-123-4567';
      const result = extractPhoneNumbers(text);

      expect(result).toStrictEqual(['+1-555-123-4567']);
    });

    test('should handle different formats', () => {
      const text = '555.123.4567 or 5551234567';
      const result = extractPhoneNumbers(text);

      expect(result).toStrictEqual(['555.123.4567', '5551234567']);
    });

    test('should avoid false positives', () => {
      const text = 'Product code: 12345';
      const result = extractPhoneNumbers(text);

      expect(result).toStrictEqual([]);
    });
  });

  describe('cleanText', () => {
    test('should clean whitespace', () => {
      const text = '  Hello   World  \n\n  Test  ';
      const result = cleanText(text);

      expect(result).toBe('Hello World Test');
    });

    test('should remove HTML entities', () => {
      const text = 'Hello &amp; World &lt;test&gt;';
      const result = cleanText(text);

      expect(result).toBe('Hello & World <test>');
    });

    test('should handle special characters', () => {
      const text = 'Price: $10.99 — Save 50%!';
      const result = cleanText(text);

      expect(result).toBe('Price: $10.99 — Save 50%!');
    });

    test('should handle empty input', () => {
      expect(cleanText('')).toBe('');
      expect(cleanText('   ')).toBe('');
    });
  });
});
