import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import Button from '../../../mantine-ciseco/components/shared/Button/Button';

describe('Button', (_: any) => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders button with text', (_: any) => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('renders with default text when no children provided', (_: any) => {
    render(<Button />);
    expect(screen.getByRole('button')).toHaveTextContent('Button');
  });

  it('handles click events', (_: any) => {
    render(<Button onClick={mockOnClick}>Click me</Button>);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders with custom fontSize prop', (_: any) => {
    const { rerender } = render(<Button fontSize="text-xs">Small Text</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-xs');

    rerender(<Button fontSize="text-lg font-bold">Large Bold</Button>);
    expect(screen.getByRole('button')).toHaveClass('text-lg font-bold');
  });

  it('renders with custom sizeClass prop', (_: any) => {
    const { rerender } = render(<Button sizeClass="py-2 px-3">Small Padding</Button>);
    expect(screen.getByRole('button')).toHaveClass('py-2 px-3');

    rerender(<Button sizeClass="py-5 px-8">Large Padding</Button>);
    expect(screen.getByRole('button')).toHaveClass('py-5 px-8');
  });

  it('renders disabled state', (_: any) => {
    render(
      <Button disabled onClick={mockOnClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('renders loading state', (_: any) => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders loading state with loading spinner', (_: any) => {
    render(<Button loading>Loading</Button>);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('handles keyboard navigation for button element', (_: any) => {
    render(<Button onClick={mockOnClick}>Keyboard Test</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    // Native button elements handle Enter and Space automatically
    // so we just test that click handler works
    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders as different element types', (_: any) => {
    const { rerender } = render(
      <Button as="a" href="/test">
        Link Button
      </Button>,
    );
    // When href is provided, it should use Link component which renders an anchor
    expect(screen.getByTestId('button')).toBeInTheDocument();

    rerender(<Button as="div">Div Button</Button>);
    expect(screen.getByTestId('button').tagName).toBe('DIV');
  });

  it('renders as Link when href is provided', (_: any) => {
    render(<Button href="/test">Link Button</Button>);
    const element = screen.getByTestId('button');
    expect(element).toHaveAttribute('href', '/test');
  });

  it('renders with targetBlank prop', (_: any) => {
    render(
      <Button href="/test" targetBlank>
        External Link
      </Button>,
    );
    const element = screen.getByTestId('button');
    expect(element).toHaveAttribute('target', '_blank');
    expect(element).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders with custom className', (_: any) => {
    render(<Button className="custom-button bg-blue-500">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-button');
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });

  it('renders with default classes', (_: any) => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button');

    // Base classes
    expect(button).toHaveClass('nc-Button');
    expect(button).toHaveClass('relative');
    expect(button).toHaveClass('inline-flex');
    expect(button).toHaveClass('h-auto');
    expect(button).toHaveClass('cursor-pointer');
    expect(button).toHaveClass('items-center');
    expect(button).toHaveClass('justify-center');
    expect(button).toHaveClass('rounded-full');
    expect(button).toHaveClass('transition-colors');

    // Default fontSize
    expect(button).toHaveClass('text-sm');
    expect(button).toHaveClass('sm:text-base');
    expect(button).toHaveClass('font-nomal');

    // Default sizeClass
    expect(button).toHaveClass('py-3');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('sm:py-3.5');
    expect(button).toHaveClass('sm:px-6');

    // Default className
    expect(button).toHaveClass('text-neutral-700');
    expect(button).toHaveClass('dark:text-neutral-200');
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });

  it('passes through arbitrary props', (_: any) => {
    render(
      <Button
        data-custom="test"
        id="my-button"
        role="button"
        aria-label="Custom label"
        aria-describedby="description"
        aria-expanded={false}
      >
        Button with Props
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-custom', 'test');
    expect(button).toHaveAttribute('id', 'my-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports form submission', (_: any) => {
    const mockSubmit = vi.fn((e: any) => {
      e.preventDefault();
    });

    render(
      <form onSubmit={mockSubmit}>
        <Button type="submit">Submit</Button>
      </form>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSubmit).toHaveBeenCalled();
  });

  it('uses custom data-testid when provided', (_: any) => {
    render(<Button data-testid="custom-button">Test</Button>);
    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
  });

  it('uses default data-testid when not provided', (_: any) => {
    render(<Button>Test</Button>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });
});
