import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from '../json-ld';
import type { WithContext, Person } from 'schema-dts';

describe('JsonLd Component', () => {
  it('renders a script tag with the correct type', () => {
    const personData: WithContext<Person> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'John Doe',
      jobTitle: 'Software Developer',
      email: 'john@example.com',
    };

    const { container } = render(<JsonLd code={personData} />);

    // Get the script element
    const scriptElement = container.querySelector('script');

    // Check that the script element exists
    expect(scriptElement).not.toBeNull();

    // Check that the script element has the correct type
    expect(scriptElement?.getAttribute('type')).toBe('application/ld+json');
  });

  it('renders the JSON-LD data correctly', () => {
    const personData: WithContext<Person> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'John Doe',
      jobTitle: 'Software Developer',
      email: 'john@example.com',
    };

    const { container } = render(<JsonLd code={personData} />);

    // Get the script element
    const scriptElement = container.querySelector('script');

    // Check that the script element has the correct content
    const scriptContent = scriptElement?.innerHTML;
    const parsedContent = JSON.parse(scriptContent || '{}');

    // Check that the parsed content matches the original data
    expect(parsedContent).toEqual(personData);
  });

  it('handles complex nested objects', () => {
    const complexData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Example Organization',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-234-567-8901',
        contactType: 'customer service',
        areaServed: ['US', 'CA', 'MX'],
        availableLanguage: ['en', 'es', 'fr'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'Anytown',
        addressRegion: 'ST',
        postalCode: '12345',
        addressCountry: 'US',
      },
    };

    const { container } = render(<JsonLd code={complexData} />);

    // Get the script element
    const scriptElement = container.querySelector('script');

    // Check that the script element has the correct content
    const scriptContent = scriptElement?.innerHTML;
    const parsedContent = JSON.parse(scriptContent || '{}');

    // Check that the parsed content matches the original data
    expect(parsedContent).toEqual(complexData);

    // Check specific nested properties
    expect(parsedContent.contactPoint['@type']).toBe('ContactPoint');
    expect(parsedContent.contactPoint.areaServed).toEqual(['US', 'CA', 'MX']);
    expect(parsedContent.address.streetAddress).toBe('123 Main St');
  });

  it('handles arrays of objects', () => {
    const arrayData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Item 1',
          url: 'https://example.com/item1',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Item 2',
          url: 'https://example.com/item2',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Item 3',
          url: 'https://example.com/item3',
        },
      ],
    };

    const { container } = render(<JsonLd code={arrayData} />);

    // Get the script element
    const scriptElement = container.querySelector('script');

    // Check that the script element has the correct content
    const scriptContent = scriptElement?.innerHTML;
    const parsedContent = JSON.parse(scriptContent || '{}');

    // Check that the parsed content matches the original data
    expect(parsedContent).toEqual(arrayData);

    // Check array length
    expect(parsedContent.itemListElement.length).toBe(3);

    // Check specific array items
    expect(parsedContent.itemListElement[0].position).toBe(1);
    expect(parsedContent.itemListElement[1].name).toBe('Item 2');
    expect(parsedContent.itemListElement[2].url).toBe(
      'https://example.com/item3',
    );
  });
});
