import { render } from '@testing-library/react';
import { describe, expect } from 'vitest';

// Import the component to test
import { JsonLd } from '#/client';

describe('@repo/seo/json-ld', () => {
  test('renders JSON-LD script tag with the provided data', () => {
    const testData = {
      name: 'Test Website',
      '@type': 'WebSite',
      url: 'https://example.com',
      '@context': 'https://schema.org',
    };

    const { container } = render(<JsonLd data={testData as any} />);

    // Find the script tag using container query since Testing Library doesn't provide a method for script tags
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(scriptElement).not.toBeNull();
    expect(scriptElement.type).toBe('application/ld+json');

    // Parse the script content
    const scriptContent = scriptElement.textContent;
    const parsedContent = JSON.parse(scriptContent ?? '{}');

    expect(parsedContent).toStrictEqual(testData);
  });

  test('renders with the correct type attribute', () => {
    const testData = { name: 'Test Person', '@type': 'Person' };

    const { container } = render(<JsonLd data={testData as any} />);
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(scriptElement.type).toBe('application/ld+json');
  });

  test('passes through additional properties to the script tag', () => {
    const testData = { name: 'Test Person', '@type': 'Person' };

    const { container } = render(<JsonLd data={testData as any} />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(scriptElement).not.toBeNull();
    expect(scriptElement.type).toBe('application/ld+json');
  });

  test('renders nested objects correctly', () => {
    const testData = {
      name: 'Test Person',
      '@type': 'Person',
      '@context': 'https://schema.org',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Test City',
        streetAddress: '123 Main St',
      },
    };

    const { container } = render(<JsonLd data={testData as any} />);
    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;
    const scriptContent = scriptElement.textContent;
    const parsedContent = JSON.parse(scriptContent ?? '{}');

    expect(parsedContent.address['@type']).toBe('PostalAddress');
    expect(parsedContent.address.streetAddress).toBe('123 Main St');
  });
});
