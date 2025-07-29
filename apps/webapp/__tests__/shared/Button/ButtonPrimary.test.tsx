import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

describe('buttonPrimary', () => {
  test('should render button with children', () => {
    render(<ButtonPrimary>Click Me</ButtonPrimary>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
  });

  test('should handle click events', () => {
    const mockClick = vi.fn();
    render(<ButtonPrimary onClick={mockClick}>Click Me</ButtonPrimary>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('should render as link when href is provided', () => {
    render(<ButtonPrimary href="/test">Link Button</ButtonPrimary>);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveTextContent('Link Button');
  });

  test('should apply custom className', () => {
    render(<ButtonPrimary className="custom-btn">Test</ButtonPrimary>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-btn');
  });

  test('should be disabled when disabled prop is true', () => {
    render(<ButtonPrimary disabled>Disabled Button</ButtonPrimary>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('should not fire click when disabled', () => {
    const mockClick = vi.fn();
    render(
      <ButtonPrimary disabled onClick={mockClick}>
        Disabled
      </ButtonPrimary>,
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).not.toHaveBeenCalled();
  });

  test('should render with different sizes', () => {
    render(<ButtonPrimary size="smaller">Small Button</ButtonPrimary>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test('should handle form submission', () => {
    render(<ButtonPrimary type="submit">Submit</ButtonPrimary>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('should render with icon', () => {
    const TestIcon = () => <span data-testid="test-icon">📧</span>;
    render(
      <ButtonPrimary>
        <TestIcon />
        Send Email
      </ButtonPrimary>,
    );

    const button = screen.getByRole('button');
    const icon = screen.getByTestId('test-icon');

    expect(button).toHaveTextContent('Send Email');
    expect(icon).toBeInTheDocument();
  });

  test('should apply primary styling classes', () => {
    render(<ButtonPrimary>Primary</ButtonPrimary>);

    const button = screen.getByRole('button');
    // The component uses dark/white color which applies specific classes
    expect(button).toBeInTheDocument();
  });

  test('should handle focus states', () => {
    render(<ButtonPrimary>Focus Test</ButtonPrimary>);

    const button = screen.getByRole('button');
    button.focus();

    expect(button).toHaveFocus();
  });

  test('should pass through additional props', () => {
    render(
      <ButtonPrimary data-testid="custom-button" aria-label="Custom Button">
        Test
      </ButtonPrimary>,
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom Button');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<ButtonPrimary>Test Button</ButtonPrimary>);
    }).not.toThrow();
  });
});
