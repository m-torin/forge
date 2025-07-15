import { describe, expect, test } from 'vitest';

describe('components/structured-data', () => {
  test('exports structured data utilities', async () => {
    const structuredData = await import('../../src/components/structured-data');

    expect(structuredData).toBeDefined();
    expect('createStructuredData' in structuredData).toBeTruthy();
    expect('structuredData' in structuredData).toBeTruthy();
    expect('JsonLd' in structuredData).toBeTruthy();
  });
});
