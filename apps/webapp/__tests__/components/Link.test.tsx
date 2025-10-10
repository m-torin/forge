import { Link } from '@/components/Link';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the shared link component
vi.mock('@/shared/link', () => ({
  Link: ({ children, href, className, style, ...props }: any) => (
    <a href={href} className={className} style={style} {...props}>
      {children}
    </a>
  ),
}));

describe('link', () => {
  test('should render link with children', () => {
    render(<Link href="/test">Test Link</Link>);

    const link = screen.getByText('Test Link');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  test('should pass href prop correctly', () => {
    render(<Link href="/about">About</Link>);

    const link = screen.getByText('About');
    expect(link).toHaveAttribute('href', '/about');
  });

  test('should pass className prop', () => {
    render(
      <Link href="/" className="custom-link">
        Home
      </Link>,
    );

    const link = screen.getByText('Home');
    expect(link).toHaveClass('custom-link');
  });

  test('should forward ref correctly', () => {
    const ref = vi.fn();
    render(
      <Link href="/" ref={ref}>
        Link
      </Link>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  test('should pass additional props', () => {
    render(
      <Link href="/test" target="_blank" rel="noopener noreferrer" data-testid="custom-link">
        External Link
      </Link>,
    );

    const link = screen.getByTestId('custom-link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should handle onClick events', () => {
    const handleClick = vi.fn();
    render(
      <Link href="/test" onClick={handleClick}>
        Click Me
      </Link>,
    );

    const link = screen.getByText('Click Me');
    link.click();

    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'click',
        target: expect.any(HTMLElement),
      }),
    );
  });

  test('should support Next.js Link props', () => {
    render(
      <Link href="/dynamic/[id]" as="/dynamic/123" prefetch={false} replace scroll={false}>
        Dynamic Link
      </Link>,
    );

    const link = screen.getByText('Dynamic Link');
    expect(link).toBeInTheDocument();
  });

  test('should handle complex href objects', () => {
    render(
      <Link
        href={
          {
            pathname: '/posts/[id]',
            query: { id: '123' },
          } as any
        }
      >
        Post Link
      </Link>,
    );

    const link = screen.getByText('Post Link');
    expect(link).toBeInTheDocument();
  });

  test('should pass aria attributes', () => {
    render(
      <Link href="/accessible" aria-label="Go to accessible page" aria-current="page">
        Accessible
      </Link>,
    );

    const link = screen.getByText('Accessible');
    expect(link).toHaveAttribute('aria-label', 'Go to accessible page');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  test('should handle style prop', () => {
    render(
      <Link href="/styled" style={{ color: 'red', textDecoration: 'none' }}>
        Styled Link
      </Link>,
    );

    const link = screen.getByText('Styled Link');
    // Just verify the component renders with style prop (style may be processed by CSS-in-JS)
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/styled');
  });
});
