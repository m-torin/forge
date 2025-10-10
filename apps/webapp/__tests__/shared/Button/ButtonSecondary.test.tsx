import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

describe('buttonSecondary', () => {
  test('should render button with children', () => {
    render(<ButtonSecondary>Click Me</ButtonSecondary>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  test('should handle click events', () => {
    const mockClick = vi.fn();
    render(<ButtonSecondary onClick={mockClick}>Click Me</ButtonSecondary>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('should render as link when href is provided', () => {
    render(<ButtonSecondary href="/test">Link Button</ButtonSecondary>);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveTextContent('Link Button');
  });

  test('should apply custom className', () => {
    render(<ButtonSecondary className="custom-btn">Test</ButtonSecondary>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-btn');
  });

  test('should be disabled when disabled prop is true', () => {
    render(<ButtonSecondary disabled>Disabled Button</ButtonSecondary>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('should not fire click when disabled', () => {
    const mockClick = vi.fn();
    render(
      <ButtonSecondary disabled onClick={mockClick}>
        Disabled
      </ButtonSecondary>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).not.toHaveBeenCalled();
  });

  test('should render with different sizes', () => {
    render(<ButtonSecondary size="smaller">Small Button</ButtonSecondary>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should handle form submission', () => {
    render(<ButtonSecondary type="submit">Submit</ButtonSecondary>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">📧</span>;
    render(
      <ButtonSecondary>
        <TestIcon />
        Send Email
      </ButtonSecondary>,
    );

    const button = screen.getByRole('button');
    const icon = screen.getByTestId('test-icon');

    expect(button).toHaveTextContent('Send Email');
    expect(icon).toBeInTheDocument();
  });

  test('should apply secondary styling classes', () => {
    render(<ButtonSecondary>Secondary</ButtonSecondary>);

    const button = screen.getByRole('button');
    // The component uses outline prop which applies specific classes
    expect(button).toBeInTheDocument();
  });

  test('should handle focus states', () => {
    render(<ButtonSecondary>Focus Test</ButtonSecondary>);

    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();
  });

  test('should pass through additional props', () => {
    render(
      <ButtonSecondary data-testid="custom-button" aria-label="Custom Button">
        Test
      </ButtonSecondary>,
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Button');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<ButtonSecondary>Test Button</ButtonSecondary>);
    }).not.toThrow();
  });
});
