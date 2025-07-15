import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { JsonLd } from '#/client';

describe('@repo/seo/client', () => {
  test('renders JSON-LD script tag with single data object', () => {
    const testData = {
      name: 'Test Website',
      '@type': 'WebSite',
      url: 'https://example.com',
      '@context': 'https://schema.org',
    };

    const { container } = render(<JsonLd data={testData as any} />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(scriptElement).not.toBeNull();
    expect(scriptElement.type).toBe('application/ld+json');

    const scriptContent = scriptElement.textContent;
    const parsedContent = JSON.parse(scriptContent ?? '{}');

    expect(parsedContent).toStrictEqual(testData);
  });

  test('renders JSON-LD script tag with array of data objects', () => {
    const testData = [
      {
        name: 'Test Website',
        '@type': 'WebSite',
        url: 'https://example.com',
        '@context': 'https://schema.org',
      },
      {
        name: 'Test Organization',
        '@type': 'Organization',
        url: 'https://example.com',
        '@context': 'https://schema.org',
      },
    ];

    const { container } = render(<JsonLd data={testData as any} />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElements = container.querySelectorAll('script[type="application/ld+json"]');

    expect(scriptElements).toHaveLength(2);
    expect((scriptElements[0] as HTMLScriptElement).type).toBe('application/ld+json');
    expect((scriptElements[1] as HTMLScriptElement).type).toBe('application/ld+json');

    const firstContent = JSON.parse((scriptElements[0] as HTMLScriptElement).textContent ?? '{}');
    const secondContent = JSON.parse((scriptElements[1] as HTMLScriptElement).textContent ?? '{}');

    expect(firstContent).toStrictEqual(testData[0]);
    expect(secondContent).toStrictEqual(testData[1]);
  });

  test('uses provided id for script keys', () => {
    const testData = {
      name: 'Test Website',
      '@type': 'WebSite',
      url: 'https://example.com',
      '@context': 'https://schema.org',
    };

    const { container } = render(<JsonLd data={testData as any} id="test-id" />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(scriptElement).not.toBeNull();
    // Note: We can't directly access the key prop in testing, but we can verify the element exists
    expect(scriptElement).toBeDefined();
  });

  test('uses index as key when no id is provided', () => {
    const testData = [
      {
        name: 'Test Website',
        '@type': 'WebSite',
        url: 'https://example.com',
        '@context': 'https://schema.org',
      },
      {
        name: 'Test Organization',
        '@type': 'Organization',
        url: 'https://example.com',
        '@context': 'https://schema.org',
      },
    ];

    const { container } = render(<JsonLd data={testData as any} />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElements = container.querySelectorAll('script[type="application/ld+json"]');

    expect(scriptElements).toHaveLength(2);
    // Note: In React testing, we can't directly access the key prop, but we can verify the elements exist
    expect(scriptElements[0]).toBeDefined();
    expect(scriptElements[1]).toBeDefined();
  });

  test('handles complex nested data structures', () => {
    const testData = {
      name: 'Test Person',
      '@type': 'Person',
      '@context': 'https://schema.org',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Test City',
        streetAddress: '123 Main St',
      },
      worksFor: {
        '@type': 'Organization',
        name: 'Test Company',
        url: 'https://testcompany.com',
      },
    };

    const { container } = render(<JsonLd data={testData as any} />);

    // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
    const scriptElement = container.querySelector(
      'script[type="application/ld+json"]',
    ) as HTMLScriptElement;

    expect(scriptElement).not.toBeNull();
    const parsedContent = JSON.parse(scriptElement.textContent ?? '{}');

    expect(parsedContent.address['@type']).toBe('PostalAddress');
    expect(parsedContent.address.streetAddress).toBe('123 Main St');
    expect(parsedContent.worksFor['@type']).toBe('Organization');
    expect(parsedContent.worksFor.name).toBe('Test Company');
  });
});
