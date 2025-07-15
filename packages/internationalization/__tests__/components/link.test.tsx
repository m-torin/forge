import { describe, expect, test, vi } from 'vitest';

import { useParams } from 'next/navigation';
import { Link } from '../../src/components/link';

// Mock Next.js components and hooks
vi.mock('next/link', () => ({
  default: vi.fn(({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}));

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

const mockUseParams = vi.mocked(useParams);

describe('link Component', () => {
  test('link component is exported', () => {
    expect(Link).toBeDefined();
    expect(typeof Link).toBe('function');
  });

  test('link component is a function component', () => {
    mockUseParams.mockReturnValue({ locale: 'en' });

    // Test that Link is callable as a function
    expect(typeof Link).toBe('function');
    expect(Link).toHaveLength(1); // Takes one parameter (props)
  });
});
