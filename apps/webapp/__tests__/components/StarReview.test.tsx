import StarReview from '@/components/StarReview';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the StarIcon component
vi.mock('@heroicons/react/24/solid', () => ({
  StarIcon: ({ className, color, fill }: any) => (
    <div data-testid="star-icon" className={className} data-color={color} data-fill={fill}>
      ⭐
    </div>
  ),
}));

describe('starReview Component', () => {
  test('renders the component with default props', () => {
    render(<StarReview />);

    const container = screen.getByTestId('star-review');
    expect(container).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    const customClass = 'custom-star-review';
    render(<StarReview className={customClass} />);

    const container = screen.getByTestId('star-review');
    expect(container).toHaveClass(customClass);
  });

  test('renders 5 star buttons', () => {
    render(<StarReview />);

    const starButtons = screen.getAllByRole('button');
    expect(starButtons).toHaveLength(5);
  });

  test('renders stars with correct initial state (no rating)', () => {
    render(<StarReview />);

    const starIcons = screen.getAllByTestId('star-icon');
    expect(starIcons).toHaveLength(5);

    // All stars should be gray initially
    const starButtons = screen.getAllByRole('button');
    starButtons.forEach(button => {
      expect(button).toHaveClass('text-gray-300');
      expect(button).not.toHaveClass('text-yellow-400');
    });
  });

  test('renders stars with initial rating', () => {
    const initialRating = 3;
    render(<StarReview initialRating={initialRating} />);

    const starButtons = screen.getAllByRole('button');

    // First 3 stars should be yellow
    for (let i = 0; i < 3; i++) {
      expect(starButtons[i]).toHaveClass('text-yellow-400');
    }

    // Last 2 stars should be gray
    for (let i = 3; i < 5; i++) {
      expect(starButtons[i]).toHaveClass('text-gray-300');
    }
  });

  test('handles star click correctly', () => {
    const onRatingChange = vi.fn();
    render(<StarReview onRatingChange={onRatingChange} />);

    const starButtons = screen.getAllByRole('button');

    // Click on the 4th star (index 3)
    fireEvent.click(starButtons[3]);

    expect(onRatingChange).toHaveBeenCalledWith(4);

    // First 4 stars should be yellow
    for (let i = 0; i < 4; i++) {
      expect(starButtons[i]).toHaveClass('text-yellow-400');
    }

    // Last star should be gray
    expect(starButtons[4]).toHaveClass('text-gray-300');
  });

  test('handles star hover correctly', () => {
    render(<StarReview />);

    const starButtons = screen.getAllByRole('button');

    // Hover over the 3rd star (index 2)
    fireEvent.mouseEnter(starButtons[2]);

    // First 3 stars should be yellow
    for (let i = 0; i < 3; i++) {
      expect(starButtons[i]).toHaveClass('text-yellow-400');
    }

    // Last 2 stars should be gray
    for (let i = 3; i < 5; i++) {
      expect(starButtons[i]).toHaveClass('text-gray-300');
    }
  });

  test('updates rating when clicking different stars', () => {
    const onRatingChange = vi.fn();
    render(<StarReview onRatingChange={onRatingChange} />);

    const starButtons = screen.getAllByRole('button');

    // Click on the 2nd star
    fireEvent.click(starButtons[1]);
    expect(onRatingChange).toHaveBeenCalledWith(2);

    // Click on the 5th star
    fireEvent.click(starButtons[4]);
    expect(onRatingChange).toHaveBeenCalledWith(5);

    // Should have been called twice
    expect(onRatingChange).toHaveBeenCalledTimes(2);
  });

  test('renders hidden input with rating value', () => {
    const initialRating = 3;
    render(<StarReview initialRating={initialRating} />);

    const hiddenInput = screen.getByDisplayValue('3');
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput).toHaveAttribute('type', 'hidden');
    expect(hiddenInput).toHaveAttribute('name', 'rating');
  });

  test('updates hidden input when rating changes', () => {
    render(<StarReview />);

    const starButtons = screen.getAllByRole('button');

    // Click on the 1st star
    fireEvent.click(starButtons[0]);

    const hiddenInput = screen.getByDisplayValue('1');
    expect(hiddenInput).toBeInTheDocument();
  });

  test('renders stars with correct accessibility labels', () => {
    render(<StarReview />);

    const starButtons = screen.getAllByRole('button');

    expect(starButtons[0]).toHaveAttribute('aria-label', 'Rate 1 star');
    expect(starButtons[1]).toHaveAttribute('aria-label', 'Rate 2 stars');
    expect(starButtons[2]).toHaveAttribute('aria-label', 'Rate 3 stars');
    expect(starButtons[3]).toHaveAttribute('aria-label', 'Rate 4 stars');
    expect(starButtons[4]).toHaveAttribute('aria-label', 'Rate 5 stars');
  });

  test('renders stars with correct hover classes', () => {
    render(<StarReview />);

    const starButtons = screen.getAllByRole('button');

    starButtons.forEach(button => {
      expect(button).toHaveClass('text-gray-300', 'hover:text-yellow-200');
    });
  });

  test('renders star icons with correct props', () => {
    render(<StarReview />);

    const starIcons = screen.getAllByTestId('star-icon');

    starIcons.forEach(icon => {
      expect(icon).toHaveClass('size-6');
      expect(icon).toHaveAttribute('data-color', 'currentColor');
      expect(icon).toHaveAttribute('data-fill', 'currentColor');
    });
  });

  test('works without onRatingChange callback', () => {
    render(<StarReview />);

    const starButtons = screen.getAllByRole('button');

    // Should not throw error when clicking without callback
    expect(() => {
      fireEvent.click(starButtons[2]);
    }).not.toThrow();
  });

  test('renders container with correct classes', () => {
    render(<StarReview />);

    const container = screen.getByTestId('star-review');
    expect(container).toHaveClass('star-review');
  });

  test('renders star container with correct classes', () => {
    render(<StarReview />);

    const starContainer = screen.getByTestId('star-review').firstElementChild;
    expect(starContainer).toHaveClass('flex', 'items-center', 'gap-1');
  });
});
