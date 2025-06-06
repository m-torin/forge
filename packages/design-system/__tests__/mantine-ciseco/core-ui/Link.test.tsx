import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import Link from '../../../mantine-ciseco/components/Link';

describe('Link', () => {
  it('renders link with text', () => {
    render(<Link href="/test">Test Link</Link>);
    expect(screen.getByRole('link')).toHaveTextContent('Test Link');
  });

  it('renders with href attribute', () => {
    render(<Link href="/products">Products</Link>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products');
  });

  it('renders external link with target blank', () => {
    render(
      <Link href="https://example.com" external>
        External Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();
    render(
      <Link href="/test" onClick={mockOnClick}>
        Clickable Link
      </Link>,
    );

    const link = screen.getByRole('link');
    fireEvent.click(link);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Link href="/test" variant="primary">
        Primary
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('link-primary');

    rerender(
      <Link href="/test" variant="secondary">
        Secondary
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('link-secondary');

    rerender(
      <Link href="/test" variant="subtle">
        Subtle
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('link-subtle');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Link href="/test" size="xs">
        XS Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-xs');

    rerender(
      <Link href="/test" size="sm">
        SM Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-sm');

    rerender(
      <Link href="/test" size="md">
        MD Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-base');

    rerender(
      <Link href="/test" size="lg">
        LG Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-lg');
  });

  it('renders with underline styles', () => {
    const { rerender } = render(
      <Link href="/test" underline="always">
        Always
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('underline');

    rerender(
      <Link href="/test" underline="hover">
        Hover
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('hover:underline');

    rerender(
      <Link href="/test" underline="never">
        Never
      </Link>,
    );
    expect(screen.getByRole('link')).not.toHaveClass('underline');
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="link-icon">🔗</span>;
    render(
      <Link href="/test" icon={<TestIcon />}>
        Link with Icon
      </Link>,
    );
    expect(screen.getByTestId('link-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const TestIcon = () => <span data-testid="right-icon">→</span>;
    render(
      <Link href="/test" rightIcon={<TestIcon />}>
        Link with Right Icon
      </Link>,
    );
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(
      <Link href="/test" disabled>
        Disabled Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('pointer-events-none', 'opacity-50');
  });

  it('renders with custom className', () => {
    render(
      <Link href="/test" className="custom-link">
        Custom
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('custom-link');
  });

  it('shows hover effects', () => {
    render(<Link href="/test">Hover Link</Link>);
    const link = screen.getByRole('link');

    fireEvent.mouseEnter(link);
    expect(link).toHaveClass('hover-effect');
  });

  it('handles keyboard navigation', () => {
    const mockOnClick = vi.fn();
    render(
      <Link href="/test" onClick={mockOnClick}>
        Keyboard Link
      </Link>,
    );
    const link = screen.getByRole('link');

    link.focus();
    expect(link).toHaveFocus();

    fireEvent.keyDown(link, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders as button when no href', () => {
    const mockOnClick = vi.fn();
    render(<Link onClick={mockOnClick}>Button Link</Link>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with active state', () => {
    render(
      <Link href="/test" active>
        Active Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('link-active');
  });

  it('renders with loading state', () => {
    render(
      <Link href="/test" loading>
        Loading Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('pointer-events-none');
    expect(screen.getByTestId('link-loader')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <Link href="/test" ariaLabel="Navigate to test page" ariaDescribedBy="link-description">
        Accessible Link
      </Link>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Navigate to test page');
    expect(link).toHaveAttribute('aria-describedby', 'link-description');
  });

  it('renders with download attribute', () => {
    render(
      <Link href="/file.pdf" download="document.pdf">
        Download
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('download', 'document.pdf');
  });

  it('supports Next.js Link integration', () => {
    render(
      <Link href="/test" prefetch shallow>
        Next Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders with custom colors', () => {
    render(
      <Link href="/test" color="blue">
        Blue Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('text-blue-600');
  });

  it('supports responsive styling', () => {
    render(
      <Link href="/test" size={{ base: 'sm', md: 'md', lg: 'lg' }}>
        Responsive Link
      </Link>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
  });

  it('renders with breadcrumb style', () => {
    render(
      <Link href="/test" breadcrumb>
        Breadcrumb Link
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('breadcrumb-link');
  });

  it('handles focus and blur events', () => {
    const mockOnFocus = vi.fn();
    const mockOnBlur = vi.fn();

    render(
      <Link href="/test" onFocus={mockOnFocus} onBlur={mockOnBlur}>
        Focus Link
      </Link>,
    );

    const link = screen.getByRole('link');

    fireEvent.focus(link);
    expect(mockOnFocus).toHaveBeenCalled();

    fireEvent.blur(link);
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('renders with tooltip', async () => {
    render(
      <Link href="/test" tooltip="Click to navigate">
        Tooltip Link
      </Link>,
    );

    const link = screen.getByRole('link');
    fireEvent.mouseEnter(link);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Click to navigate');
    });
  });

  it('supports dark mode styling', () => {
    render(<Link href="/test">Dark Mode Link</Link>);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-blue-600', 'dark:text-blue-400');
  });
});
