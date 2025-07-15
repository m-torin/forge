import { describe, expect, test, vi } from 'vitest';

// Mock the Link component
vi.mock('../src/components/link', () => ({
  Link: vi.fn().mockImplementation(() => null),
}));

describe('client', () => {
  test('exports Link component', async () => {
    const { Link } = await import('../src/client');
    expect(Link).toBeDefined();
  });
});
