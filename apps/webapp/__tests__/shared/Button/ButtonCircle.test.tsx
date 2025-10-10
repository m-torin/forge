import ButtonCircle from '@/shared/Button/ButtonCircle';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

describe('buttonCircle', () => {
  test('should render circular button', () => {
    render(<ButtonCircle>⭐</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('⭐');
  });

  test('should have circular styling', () => {
    render(<ButtonCircle>♡</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
  });

  test('should handle click events', () => {
    const mockClick = vi.fn();
    render(<ButtonCircle onClick={mockClick}>⚙</ButtonCircle>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('should apply custom className', () => {
    render(<ButtonCircle className="custom-circle">+</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-circle');
  });

  test('should be disabled when disabled prop is true', () => {
    render(<ButtonCircle disabled>X</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('should render different sizes', () => {
    render(<ButtonCircle size="size-12">→</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('size-12');
  });

  test('should render with icon content', () => {
    const TestIcon = () => <span data-testid="circle-icon">🔍</span>;
    render(
      <ButtonCircle>
        <TestIcon />
      </ButtonCircle>,
    );

    const icon = screen.getByTestId('circle-icon');
    expect(icon).toBeInTheDocument();
  });

  test('should handle hover effects', () => {
    render(<ButtonCircle>👍</ButtonCircle>);

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    // Should handle hover without crashing
    expect(button).toBeInTheDocument();
  });

  test('should handle different button types', () => {
    render(<ButtonCircle type="submit">✓</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('should maintain aspect ratio', () => {
    const { container } = render(<ButtonCircle>O</ButtonCircle>);

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass('rounded-full');
  });

  test('should pass through additional props', () => {
    render(
      <ButtonCircle data-testid="circle-btn" aria-label="Circular button">
        ●
      </ButtonCircle>,
    );

    const button = screen.getByTestId('circle-btn');
    expect(button).toHaveAttribute('aria-label', 'Circular button');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<ButtonCircle>•</ButtonCircle>);
    }).not.toThrow();
  });

  test('should apply custom color classes', () => {
    render(<ButtonCircle colorClassName="bg-blue-500 text-white">🔵</ButtonCircle>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-500', 'text-white');
  });
});
