import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
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

  it('renders with custom className', () => {
    render(<Button className="custom-button">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');
  });

  it('renders with custom fontSize', () => {
    render(<Button fontSize="text-lg">Large Text</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-lg');
  });

  it('renders with custom sizeClass', () => {
    render(<Button sizeClass="py-2 px-3">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('py-2 px-3');
  });

  it('renders as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders with target blank when specified', () => {
    render(
      <Button href="/test" targetBlank>
        External Link
      </Button>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders loading state', () => {
    const { container } = render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    
    const loadingSvg = container.querySelector('svg');
    expect(loadingSvg).toBeInTheDocument();
    expect(loadingSvg).toHaveClass('animate-spin');
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('renders with custom component', () => {
    const CustomComponent = ({ children, ...props }: any) => (
      <div data-testid="custom-component" {...props}>
        {children}
      </div>
    );

    render(<Button as={CustomComponent}>Custom Component</Button>);
    expect(screen.getByTestId('custom-component')).toBeInTheDocument();
  });
});
