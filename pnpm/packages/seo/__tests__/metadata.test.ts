import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createMetadata } from '../metadata';
import merge from 'lodash.merge';

// Import the mocked modules
vi.mock('lodash.merge');

describe('SEO Metadata', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock merge to behave like Object.assign
    (merge as unknown as any).mockImplementation((target, ...sources) => {
      return Object.assign({}, target, ...sources);
    });
  });

  it('creates metadata with required fields', () => {
    const metadata = createMetadata({
      title: 'Test Page',
      description: 'This is a test page',
    });

    expect(metadata).toEqual(
      expect.objectContaining({
        title: 'Test Page | next-forge',
        description: 'This is a test page',
        applicationName: 'next-forge',
        authors: [
          {
            name: 'Hayden Bleasel',
            url: 'https://haydenbleasel.com/',
          },
        ],
        creator: 'Hayden Bleasel',
        formatDetection: {
          telephone: false,
        },
        appleWebApp: {
          capable: true,
          statusBarStyle: 'default',
          title: 'Test Page | next-forge',
        },
        openGraph: {
          title: 'Test Page | next-forge',
          description: 'This is a test page',
          type: 'website',
          siteName: 'next-forge',
          locale: 'en_US',
        },
        publisher: 'Hayden Bleasel',
        twitter: {
          card: 'summary_large_image',
          creator: '@haydenbleasel',
        },
      }),
    );
  });

  it('adds image to openGraph when provided', () => {
    const metadata = createMetadata({
      title: 'Test Page',
      description: 'This is a test page',
      image: 'https://example.com/image.jpg',
    });

    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        images: [
          {
            url: 'https://example.com/image.jpg',
            width: 1200,
            height: 630,
            alt: 'Test Page',
          },
        ],
      }),
    );
  });

  it('merges additional properties with default metadata', () => {
    const metadata = createMetadata({
      title: 'Test Page',
      description: 'This is a test page',
      keywords: ['test', 'page', 'seo'],
      robots: {
        index: false,
        follow: true,
      },
    });

    // Check that merge was called with the correct arguments
    expect(merge).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Page | next-forge',
        description: 'This is a test page',
      }),
      expect.objectContaining({
        keywords: ['test', 'page', 'seo'],
        robots: {
          index: false,
          follow: true,
        },
      }),
    );

    // Check that the result includes the merged properties
    expect(metadata).toEqual(
      expect.objectContaining({
        title: 'Test Page | next-forge',
        description: 'This is a test page',
        keywords: ['test', 'page', 'seo'],
        robots: {
          index: false,
          follow: true,
        },
      }),
    );
  });

  it('formats title correctly', () => {
    const metadata = createMetadata({
      title: 'Custom Title',
      description: 'This is a test page',
    });

    expect(metadata.title).toBe('Custom Title | next-forge');
    expect(metadata.openGraph?.title).toBe('Custom Title | next-forge');
    expect(metadata.appleWebApp?.title).toBe('Custom Title | next-forge');
  });

  it('sets description in multiple places', () => {
    const metadata = createMetadata({
      title: 'Test Page',
      description: 'Custom description for testing',
    });

    expect(metadata.description).toBe('Custom description for testing');
    expect(metadata.openGraph?.description).toBe(
      'Custom description for testing',
    );
  });

  it('handles complex additional properties', () => {
    const metadata = createMetadata({
      title: 'Test Page',
      description: 'This is a test page',
      alternates: {
        canonical: 'https://example.com/page',
        languages: {
          'en-US': 'https://example.com/page',
          'fr-FR': 'https://example.com/fr/page',
        },
      },
      verification: {
        google: 'google-verification-code',
        yandex: 'yandex-verification-code',
      },
    });

    expect(metadata).toEqual(
      expect.objectContaining({
        alternates: {
          canonical: 'https://example.com/page',
          languages: {
            'en-US': 'https://example.com/page',
            'fr-FR': 'https://example.com/fr/page',
          },
        },
        verification: {
          google: 'google-verification-code',
          yandex: 'yandex-verification-code',
        },
      }),
    );
  });
});
