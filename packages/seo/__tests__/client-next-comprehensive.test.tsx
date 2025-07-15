import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock Next.js Script component
vi.mock('next/script', () => ({
  default: ({ children, dangerouslySetInnerHTML, id, strategy, type, ...props }: any) => (
    <script
      {...props}
      id={id}
      type={type}
      data-strategy={strategy}
      data-testid={id || 'jsonld-script'}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {children}
    </script>
  ),
}));

// Mock schema-dts
vi.mock('schema-dts', () => ({
  Thing: {},
  WithContext: {},
}));

describe('client Next - Comprehensive Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('jsonLd component', () => {
    test('should render single JSON-LD script', async () => {
      const { JsonLd } = await import('../src/client-next');

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
      };

      render(<JsonLd data={data} />);

      const script = screen.getByTestId('jsonld-script');
      expect(script).toBeInTheDocument();
      expect(script.innerHTML).toBe(JSON.stringify(data));
    });

    test('should render multiple JSON-LD scripts', async () => {
      const { JsonLd } = await import('../src/client-next');

      const data = [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 1',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 2',
        },
      ];

      render(<JsonLd data={data} />);

      const scripts = screen.getAllByTestId('jsonld-script');
      expect(scripts).toHaveLength(2);
      expect(scripts[0].innerHTML).toBe(JSON.stringify(data[0]));
      expect(scripts[1].innerHTML).toBe(JSON.stringify(data[1]));
    });

    test('should render with custom id', async () => {
      const { JsonLd } = await import('../src/client-next');

      const data = [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 1',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 2',
        },
      ];

      render(<JsonLd data={data} id="custom-jsonld" />);

      const scripts = screen.getAllByTestId('custom-jsonld');
      expect(scripts).toHaveLength(2);
      expect(scripts[0].innerHTML).toBe(JSON.stringify(data[0]));
      expect(scripts[1].innerHTML).toBe(JSON.stringify(data[1]));
    });

    test('should handle strategy parameter', async () => {
      const { JsonLd } = await import('../src/client-next');

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
      };

      render(<JsonLd data={data} strategy="lazyOnload" />);

      const script = screen.getByTestId('jsonld-script');
      expect(script).toBeInTheDocument();
    });
  });

  describe('optimizedJsonLd component', () => {
    test('should render single optimized JSON-LD script', async () => {
      const { OptimizedJsonLd } = await import('../src/client-next');

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
      };

      render(<OptimizedJsonLd data={data} />);

      const script = screen.getByTestId('jsonld-0');
      expect(script).toBeInTheDocument();
      expect(script).toHaveAttribute('data-strategy', 'afterInteractive');
      expect(script).toHaveAttribute('data-testid', 'jsonld-0');
      expect(script.innerHTML).toBe(JSON.stringify(data));
    });

    test('should render multiple optimized JSON-LD scripts', async () => {
      const { OptimizedJsonLd } = await import('../src/client-next');

      const data = [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 1',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 2',
        },
      ];

      render(<OptimizedJsonLd data={data} />);

      const script1 = screen.getByTestId('jsonld-0');
      const script2 = screen.getByTestId('jsonld-1');
      expect(script1).toHaveAttribute('data-testid', 'jsonld-0');
      expect(script2).toHaveAttribute('data-testid', 'jsonld-1');
    });

    test('should render with custom id and strategy', async () => {
      const { OptimizedJsonLd } = await import('../src/client-next');

      const data = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Test Article',
      };

      render(<OptimizedJsonLd data={data} id="custom-opt" strategy="lazyOnload" />);

      const script = screen.getByTestId('custom-opt-0');
      expect(script).toHaveAttribute('data-testid', 'custom-opt-0');
      expect(script).toHaveAttribute('data-strategy', 'lazyOnload');
    });

    test('should handle array data with custom id', async () => {
      const { OptimizedJsonLd } = await import('../src/client-next');

      const data = [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 1',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Test Article 2',
        },
      ];

      render(<OptimizedJsonLd data={data} id="custom-array" />);

      const script1 = screen.getByTestId('custom-array-0');
      const script2 = screen.getByTestId('custom-array-1');
      expect(script1).toHaveAttribute('data-testid', 'custom-array-0');
      expect(script2).toHaveAttribute('data-testid', 'custom-array-1');
    });
  });

  describe('streamingJsonLd component', () => {
    test('should render with fallback when promise is pending', async () => {
      const { StreamingJsonLd } = await import('../src/client-next');

      const fallbackData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Fallback Article',
      };

      const dataPromise = new Promise(() => {}); // Never resolves

      render(
        <StreamingJsonLd dataPromise={dataPromise} fallback={fallbackData} id="streaming-test" />,
      );

      // Should render fallback
      const script = screen.getByTestId('streaming-test-0');
      expect(script.innerHTML).toBe(JSON.stringify(fallbackData));
    });

    test('should render without fallback', async () => {
      const { StreamingJsonLd } = await import('../src/client-next');

      const dataPromise = new Promise(() => {}); // Never resolves

      render(<StreamingJsonLd dataPromise={dataPromise} id="streaming-no-fallback" />);

      // Should not render any script initially
      expect(screen.queryByTestId('streaming-no-fallback-0')).not.toBeInTheDocument();
    });

    test('should handle StreamingJsonLd component structure', async () => {
      const { StreamingJsonLd } = await import('../src/client-next');

      const resolvedData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Resolved Article',
      };

      const dataPromise = Promise.resolve(resolvedData);

      // Just test that the component renders without crashing
      expect(() => {
        render(<StreamingJsonLd dataPromise={dataPromise} id="streaming-resolved" />);
      }).not.toThrow();
    });

    test('should handle StreamingJsonLd with array data', async () => {
      const { StreamingJsonLd } = await import('../src/client-next');

      const resolvedData = [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Resolved Article 1',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: 'Resolved Article 2',
        },
      ];

      const dataPromise = Promise.resolve(resolvedData);

      // Just test that the component renders without crashing
      expect(() => {
        render(<StreamingJsonLd dataPromise={dataPromise} id="streaming-array" />);
      }).not.toThrow();
    });
  });

  describe('useOpenGraphPreview hook', () => {
    test('should initialize with provided metadata', async () => {
      const { useOpenGraphPreview } = await import('../src/client-next');

      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/page',
      };

      const { result } = renderHook(() => useOpenGraphPreview(metadata));

      expect(result.current.preview).toStrictEqual(metadata);
    });

    test('should update preview with updatePreview function', async () => {
      const { useOpenGraphPreview } = await import('../src/client-next');

      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
      };

      const { result } = renderHook(() => useOpenGraphPreview(metadata));

      act(() => {
        result.current.updatePreview({
          title: 'Updated Title',
          image: 'https://example.com/new-image.jpg',
        });
      });

      expect(result.current.preview).toStrictEqual({
        title: 'Updated Title',
        description: 'Test Description',
        image: 'https://example.com/new-image.jpg',
      });
    });

    test('should generate preview HTML with all fields', async () => {
      const { useOpenGraphPreview } = await import('../src/client-next');

      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com/page',
      };

      const { result } = renderHook(() => useOpenGraphPreview(metadata));

      const html = result.current.generatePreviewHtml();

      expect(html).toContain('<meta property="og:title" content="Test Title" />');
      expect(html).toContain('<meta property="og:description" content="Test Description" />');
      expect(html).toContain(
        '<meta property="og:image" content="https://example.com/image.jpg" />',
      );
      expect(html).toContain('<meta property="og:url" content="https://example.com/page" />');
    });

    test('should generate preview HTML without optional fields', async () => {
      const { useOpenGraphPreview } = await import('../src/client-next');

      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
      };

      const { result } = renderHook(() => useOpenGraphPreview(metadata));

      const html = result.current.generatePreviewHtml();

      expect(html).toContain('<meta property="og:title" content="Test Title" />');
      expect(html).toContain('<meta property="og:description" content="Test Description" />');
      expect(html).not.toContain('og:image');
      expect(html).not.toContain('og:url');
    });

    test('should update preview HTML when preview changes', async () => {
      const { useOpenGraphPreview } = await import('../src/client-next');

      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
      };

      const { result } = renderHook(() => useOpenGraphPreview(metadata));

      act(() => {
        result.current.updatePreview({
          image: 'https://example.com/new-image.jpg',
        });
      });

      const html = result.current.generatePreviewHtml();

      expect(html).toContain(
        '<meta property="og:image" content="https://example.com/new-image.jpg" />',
      );
    });

    test('should maintain callback stability', async () => {
      const { useOpenGraphPreview } = await import('../src/client-next');

      const metadata = {
        title: 'Test Title',
        description: 'Test Description',
      };

      const { result, rerender } = renderHook(() => useOpenGraphPreview(metadata));

      const initialUpdatePreview = result.current.updatePreview;
      const initialGeneratePreviewHtml = result.current.generatePreviewHtml;

      rerender();

      expect(result.current.updatePreview).toBe(initialUpdatePreview);
      expect(result.current.generatePreviewHtml).toBe(initialGeneratePreviewHtml);
    });
  });

  describe('re-exports', () => {
    test('should re-export schema-dts types', async () => {
      const clientNext = await import('../src/client-next');

      // Check that Thing and WithContext are re-exported
      expect(clientNext.Thing).toBeDefined();
      expect(clientNext.WithContext).toBeDefined();
    });
  });
});
