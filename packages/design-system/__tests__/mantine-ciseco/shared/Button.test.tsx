import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import Button from '../../../mantine-ciseco/components/shared/Button/Button';

describe('Button', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', () => {
    render(<Button onClick={mockOnClick}>Click me</Button>);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="filled">Filled</Button>);
    expect(screen.getByRole('button')).toHaveClass('variant-filled');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('variant-outline');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('variant-ghost');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="xs">XS</Button>);
    expect(screen.getByRole('button')).toHaveClass('size-xs');

    rerender(<Button size="sm">SM</Button>);
    expect(screen.getByRole('button')).toHaveClass('size-sm');

    rerender(<Button size="md">MD</Button>);
    expect(screen.getByRole('button')).toHaveClass('size-md');

    rerender(<Button size="lg">LG</Button>);
    expect(screen.getByRole('button')).toHaveClass('size-lg');
  });

  it('renders disabled state', () => {
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

  it('renders loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByTestId('button-loader')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">🚀</span>;
    render(<Button leftIcon={<TestIcon />}>With Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const TestIcon = () => <span data-testid="test-icon">→</span>;
    render(<Button rightIcon={<TestIcon />}>With Right Icon</Button>);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<Button onClick={mockOnClick}>Keyboard Test</Button>);
    const button = screen.getByRole('button');

    button.focus();
    expect(button).toHaveFocus();

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalled();

    fireEvent.keyDown(button, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('renders as different element types', () => {
    const { rerender } = render(
      <Button as="a" href="/test">
        Link Button
      </Button>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(<Button as="div">Div Button</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument(); // Should still maintain button role
  });

  it('renders full width', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('renders with custom className', () => {
    render(<Button className="custom-button">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-button');
  });

  it('has proper accessibility attributes', () => {
    render(
      <Button ariaLabel="Custom label" ariaDescribedBy="description" ariaExpanded={false}>
        Accessible Button
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
    expect(button).toHaveAttribute('aria-describedby', 'description');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders with tooltip', async () => {
    render(<Button tooltip="This is a helpful button">Hover me</Button>);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('This is a helpful button');
    });
  });

  it('prevents default when type is not submit', () => {
    const mockEvent = { preventDefault: vi.fn() };
    render(
      <Button type="button" onClick={mockOnClick}>
        Button
      </Button>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button, mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('supports form submission', () => {
    const mockSubmit = vi.fn();
    render(
      <form onSubmit={mockSubmit}>
        <Button type="submit">Submit</Button>
      </form>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockSubmit).toHaveBeenCalled();
  });
});
