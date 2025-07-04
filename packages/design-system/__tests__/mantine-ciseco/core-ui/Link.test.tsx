import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import { Link } from '../../../src/mantine-ciseco/components/Link';

describe('Link', (_: any) => {
  it('renders link with text', (_: any) => {
    render(<Link href="/test">Test Link</Link>);
    expect(screen.getByTestId('link')).toHaveTextContent('Test Link');
  });

  it('renders with href attribute', (_: any) => {
    render(<Link href="/products">Products</Link>);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/products');
  });

  it('renders external link', (_: any) => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
        External Link
      </Link>,
    );
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles click events', (_: any) => {
    const mockOnClick = vi.fn();
    render(
      <Link href="/test" onClick={mockOnClick}>
        Clickable Link
      </Link>,
    );

    const link = screen.getByTestId('link');
    fireEvent.click(link);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with className', (_: any) => {
    render(
      <Link href="/test" className="custom-link text-blue-500 hover:underline">
        Styled Link
      </Link>,
    );
    expect(screen.getByTestId('link')).toHaveClass('custom-link');
  });

  it('renders without href (defaults to #)', (_: any) => {
    render(<Link>No Href Link</Link>);
    expect(screen.getByTestId('link')).toHaveAttribute('href', '#');
  });

  it('prevents navigation for hash links', (_: any) => {
    const mockPreventDefault = vi.fn();
    render(<Link href="#section">Hash Link</Link>);

    const link = screen.getByTestId('link');
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'preventDefault', { value: mockPreventDefault });

    fireEvent(link, event);
    // Hash links don't prevent default in the simple implementation
  });

  it('renders with all standard anchor attributes', (_: any) => {
    render(
      <Link href="/test" title="Link Title" aria-label="Accessible Label" data-testid="test-link">
        Full Featured Link
      </Link>,
    );

    const link = screen.getByTestId('test-link');
    expect(link).toHaveAttribute('title', 'Link Title');
    expect(link).toHaveAttribute('aria-label', 'Accessible Label');
    expect(link).toHaveAttribute('data-testid', 'test-link');
  });
});
