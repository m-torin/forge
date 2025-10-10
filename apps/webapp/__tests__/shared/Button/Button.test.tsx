import { Button } from '@/shared/Button/Button';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

describe('button', () => {
  test('should render button with children', () => {
    render(<Button>Click Me</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  test('should handle click events', () => {
    const mockClick = vi.fn();
    render(<Button onClick={mockClick}>Click Me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('should apply custom className', () => {
    render(<Button className="custom-btn">Test</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-btn');
  });

  test('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('should not fire click when disabled', () => {
    const mockClick = vi.fn();
    render(
      <Button disabled onClick={mockClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).not.toHaveBeenCalled();
  });

  test('should render different button types', () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('should render outline variant', () => {
    render(<Button outline>Secondary</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should render plain variant', () => {
    render(<Button plain>Plain Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should render different button sizes', () => {
    render(<Button size="smaller">Small Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should render different colors', () => {
    render(<Button color="red">Red Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">⚙️</span>;
    render(
      <Button>
        <TestIcon />
        Settings
      </Button>,
    );

    const button = screen.getByRole('button');
    const icon = screen.getByTestId('test-icon');

    expect(button).toHaveTextContent('Settings');
    expect(icon).toBeInTheDocument();
  });

  test('should handle focus states', () => {
    render(<Button>Focus Test</Button>);

    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();
  });

  test('should render as link when href is provided', () => {
    render(<Button href="/test">Link Button</Button>);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  test('should pass through additional props', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom Button">
        Test
      </Button>,
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Button');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Button>Test Button</Button>);
    }).not.toThrow();
  });
});
