import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import the module to test
import { createMetadata } from '../server-next';

describe('@repo/seo/metadata', (_: any) => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup environment for each test
    vi.stubGlobal('process', {
      ...process,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        VERCEL_PROJECT_PRODUCTION_URL: 'test-project.vercel.app',
      },
    });
  });

  it('generates basic metadata with required fields', (_: any) => {
    const metadata = createMetadata({
      description: 'Test description',
      title: 'Test Page',
    });

    expect(metadata.title).toBe('Test Page | forge');
    expect(metadata.description).toBe('Test description');
    expect(metadata.applicationName).toBe('forge');
    expect(metadata.openGraph?.title).toBe('Test Page | forge');
    expect(metadata.openGraph?.description).toBe('Test description');
  });

  it('sets metadataBase based on production URL', (_: any) => {
    const metadata = createMetadata({
      description: 'Test description',
      title: 'Test Page',
    });

    expect(metadata.metadataBase?.href).toBe('http://test-project.vercel.app/');
  });

  it('uses https protocol in production', (_: any) => {
    // Setup production environment
    vi.stubGlobal('process', {
      ...process,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        VERCEL_PROJECT_PRODUCTION_URL: 'test-project.vercel.app',
      },
    });

    const metadata = createMetadata({
      description: 'Test description',
      title: 'Test Page',
    });

    expect(metadata.metadataBase?.href).toBe('https://test-project.vercel.app/');
  });

  it('handles image URLs in OpenGraph', (_: any) => {
    const metadata = createMetadata({
      description: 'Test description',
      image: '/path/to/image.jpg',
      title: 'Test Page',
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        width: 1200,
        url: '/path/to/image.jpg',
        alt: 'Test Page',
        height: 630,
      },
    ]);
  });

  it('merges custom properties with defaults', (_: any) => {
    const metadata = createMetadata({
      description: 'Test description',
      openGraph: {
        type: 'article',
        publishedTime: '2023-01-01',
      } as any,
      themeColor: '#ff0000',
      title: 'Test Page',
    });

    expect(metadata.themeColor).toBe('#ff0000');
    expect((metadata.openGraph as any)?.type).toBe('article');
    expect((metadata.openGraph as any)?.publishedTime).toBe('2023-01-01');

    // Default properties should still be present
    expect(metadata.openGraph?.title).toBe('Test Page | forge');
    expect(metadata.openGraph?.description).toBe('Test description');
  });

  it('falls back to undefined metadataBase when no production URL is set', (_: any) => {
    // Setup environment without production URL
    vi.stubGlobal('process', {
      ...process,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        VERCEL_PROJECT_PRODUCTION_URL: undefined,
      },
    });

    const metadata = createMetadata({
      description: 'Test description',
      title: 'Test Page',
    });

    expect(metadata.metadataBase).toBeUndefined();
  });
});
