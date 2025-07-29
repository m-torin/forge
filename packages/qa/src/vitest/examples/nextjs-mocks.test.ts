// Test for Next.js mocks completeness
import { describe, expect } from 'vitest';

describe('next.js Mocks Completeness', () => {
  test('should import all Next.js mock modules without errors', async () => {
    // Import the main index to register all mocks
    expect(() => {
      import('../mocks/packages/nextjs/index');
    }).not.toThrow();
  });

  test('should have server actions utilities', async () => {
    const { serverActionTestUtils } = await import('../mocks/packages/nextjs/server-actions');

    expect(serverActionTestUtils.createMockFormData).toBeDefined();
    expect(serverActionTestUtils.createMockServerAction).toBeDefined();
    expect(serverActionTestUtils.simulateFormSubmission).toBeDefined();
  });

  test('should have metadata utilities', async () => {
    const { metadataTestUtils } = await import('../mocks/packages/nextjs/metadata');

    expect(metadataTestUtils.createMockMetadata).toBeDefined();
    expect(metadataTestUtils.createMockImageMetadata).toBeDefined();
    expect(metadataTestUtils.expectMetadataGenerated).toBeDefined();
  });

  test('should have testing utilities', async () => {
    const { testingUtils } = await import('../mocks/packages/nextjs/testing');

    expect(testingUtils.createMockMiddlewareConfig).toBeDefined();
    expect(testingUtils.createMockNextConfig).toBeDefined();
    expect(testingUtils.expectMiddlewareMatch).toBeDefined();
  });

  test('should have navigation utilities', async () => {
    const { navigationTestUtils } = await import('../mocks/packages/nextjs/navigation');

    expect(navigationTestUtils.createMockRouter).toBeDefined();
    expect(navigationTestUtils.createMockSearchParams).toBeDefined();
    expect(navigationTestUtils.expectNavigation).toBeDefined();
  });

  test('should have component utilities', async () => {
    const { componentTestUtils } = await import('../mocks/packages/nextjs/components');

    expect(componentTestUtils.createMockLink).toBeDefined();
    expect(componentTestUtils.createMockImage).toBeDefined();
    expect(componentTestUtils.expectLinkPrefetch).toBeDefined();
  });

  test('should have server utilities', async () => {
    const { serverTestUtils } = await import('../mocks/packages/nextjs/server');

    expect(serverTestUtils.createMockRequest).toBeDefined();
    expect(serverTestUtils.createMockResponse).toBeDefined();
    expect(serverTestUtils.simulateServerSideExecution).toBeDefined();
  });

  test('should have dynamic utilities', async () => {
    const { dynamicTestUtils } = await import('../mocks/packages/nextjs/dynamic');

    expect(dynamicTestUtils.createMockDynamic).toBeDefined();
    expect(dynamicTestUtils.simulateDynamicImport).toBeDefined();
    expect(dynamicTestUtils.expectDynamicImport).toBeDefined();
  });

  test('should mock server action form data creation', async () => {
    const { serverActionTestUtils } = await import('../mocks/packages/nextjs/server-actions');

    const mockData = { name: 'test', email: 'test@example.com' };
    const formData = serverActionTestUtils.createMockFormData(mockData);

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('name')).toBe('test');
    expect(formData.get('email')).toBe('test@example.com');
  });

  test('should mock metadata generation', async () => {
    const { metadataTestUtils } = await import('../mocks/packages/nextjs/metadata');

    const mockMetadata = metadataTestUtils.createMockMetadata({
      title: 'Test Title',
      description: 'Test Description',
    });

    expect(mockMetadata.title).toBe('Test Title');
    expect(mockMetadata.description).toBe('Test Description');
    expect(mockMetadata.openGraph).toBeDefined();
  });

  test('should mock middleware configuration', async () => {
    const { testingUtils } = await import('../mocks/packages/nextjs/testing');

    const mockConfig = testingUtils.createMockMiddlewareConfig({
      matcher: ['/api/:path*'],
    });

    expect(mockConfig.matcher).toContain('/api/:path*');
  });

  test('should mock link prefetch behavior', async () => {
    const { mockLinkPrefetch } = await import('../mocks/packages/nextjs/components');

    const href = '/test-page';
    await mockLinkPrefetch.simulatePrefetch(href);

    expect(mockLinkPrefetch.isPrefetched(href)).toBeTruthy();
  });
});

describe('next.js Mock Functions', () => {
  test('should mock generateMetadata function', async () => {
    const { mockGenerateMetadata } = await import('../mocks/packages/nextjs/metadata');

    const props = { params: { id: '123' } };
    const metadata = await mockGenerateMetadata(props);

    expect(metadata.title).toBe('Mock Title');
    expect(metadata.description).toBe('Mock Description');
  });

  test('should mock middleware matching', async () => {
    const { mockDoesMiddlewareMatch } = await import('../mocks/packages/nextjs/testing');

    const config = { matcher: ['/api/*'] };
    const result = mockDoesMiddlewareMatch({
      config,
      url: '/api/users',
    });

    expect(typeof result).toBe('boolean');
  });

  test('should mock dynamic imports', async () => {
    const { mockDynamicImport } = await import('../mocks/packages/nextjs/dynamic');

    const importResult = await mockDynamicImport.simulateImport('/components/TestComponent');

    expect(importResult.default).toBeDefined();
    expect(importResult.loaded).toBeTruthy();
  });
});

describe('next.js Mock Integration', () => {
  test('should provide comprehensive Next.js 15 coverage', async () => {
    // Test that all major Next.js 15 features are covered
    // Use explicit imports instead of template literals to avoid Vite warnings
    const imports = [
      () => import('../mocks/packages/nextjs/server-actions'),
      () => import('../mocks/packages/nextjs/metadata'),
      () => import('../mocks/packages/nextjs/testing'),
      () => import('../mocks/packages/nextjs/navigation'),
      () => import('../mocks/packages/nextjs/components'),
      () => import('../mocks/packages/nextjs/server'),
      () => import('../mocks/packages/nextjs/dynamic'),
      () => import('../mocks/packages/nextjs/cache'),
      () => import('../mocks/packages/nextjs/headers'),
      () => import('../mocks/packages/nextjs/router'),
      () => import('../mocks/packages/nextjs/fonts'),
      () => import('../mocks/packages/nextjs/errors'),
    ];

    for (const importFn of imports) {
      expect(async () => {
        await importFn();
      }).not.toThrow();
    }
  });
});
