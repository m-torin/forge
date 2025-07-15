import { describe, expect, test, vi } from 'vitest';

// Mock the Link component and client dependencies
vi.mock('../src/components/link', () => ({
  Link: vi.fn().mockImplementation(() => null),
}));

vi.mock('../src/client', () => ({
  // Mock any client exports that might be re-exported
  mockExport: 'mocked',
}));

describe('client-next', () => {
  test('exports Link component', async () => {
    const { Link } = await import('../src/client-next');
    expect(Link).toBeDefined();
  });

  test('re-exports client functionality', async () => {
    const clientNext = await import('../src/client-next');
    expect(clientNext).toBeDefined();
  });
});
