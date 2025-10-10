import ReviewItem from '@/components/ReviewItem';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the Avatar component
vi.mock('@/shared/Avatar/Avatar', () => ({
  default: ({ userName, imgUrl, sizeClass, radius }: any) => (
    <div
      data-testid="avatar"
      data-user-name={userName}
      {...(imgUrl !== undefined && { 'data-img-url': imgUrl })}
      data-size-class={sizeClass}
      data-radius={radius}
    >
      Avatar: {userName}
    </div>
  ),
}));

// Mock the StarIcon component
vi.mock('@heroicons/react/24/solid', () => ({
  StarIcon: ({ className, 'aria-hidden': ariaHidden }: any) => (
    <div data-testid="star-icon" className={className} aria-hidden={ariaHidden}>
      ⭐
    </div>
  ),
}));

const mockReviewData = {
  id: '1',
  author: 'John Doe',
  authorAvatar: {
    src: '/avatar.jpg',
    alt: 'John Doe',
    height: 100,
    width: 100,
  },
  date: '2024-01-15',
  rating: 4,
  content: '<p>Great product! Highly recommended.</p>',
};

const mockReviewDataWithoutAvatar = {
  id: '2',
  author: 'Jane Smith',
  date: '2024-01-10',
  rating: 5,
  content: '<p>Excellent quality and fast shipping.</p>',
};

describe('reviewItem Component', () => {
  test('renders the component with review data', () => {
    render(<ReviewItem data={mockReviewData} />);

    const container = screen.getByTestId('avatar').closest('.flex');
    expect(container).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    const customClass = 'custom-review-item';
    const { container } = render(<ReviewItem data={mockReviewData} className={customClass} />);

    const reviewContainer = container.firstChild as HTMLElement;
    expect(reviewContainer).toHaveClass(customClass);
  });

  test('renders avatar with correct props', () => {
    render(<ReviewItem data={mockReviewData} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('data-user-name', 'John Doe');
    expect(avatar).toHaveAttribute('data-img-url', '/avatar.jpg');
    expect(avatar).toHaveAttribute('data-size-class', 'size-10 text-lg');
    expect(avatar).toHaveAttribute('data-radius', 'rounded-full');
  });

  test('renders avatar without image when authorAvatar is not provided', () => {
    render(<ReviewItem data={mockReviewDataWithoutAvatar} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-user-name', 'Jane Smith');
    // When authorAvatar is undefined, data-img-url attribute should not exist
    expect(avatar).not.toHaveAttribute('data-img-url');
  });

  test('renders author name', () => {
    render(<ReviewItem data={mockReviewData} />);

    // Look for the span with font-semibold class specifically
    const authorName = screen.getByText('John Doe', { selector: 'span.font-semibold' });
    expect(authorName).toBeInTheDocument();
    expect(authorName).toHaveClass('font-semibold');
  });

  test('renders review date', () => {
    render(<ReviewItem data={mockReviewData} />);

    const date = screen.getByText('2024-01-15');
    expect(date).toBeInTheDocument();
    expect(date).toHaveClass('text-sm', 'text-neutral-500', 'dark:text-neutral-400');
  });

  test('renders 5 star icons', () => {
    render(<ReviewItem data={mockReviewData} />);

    const starIcons = screen.getAllByTestId('star-icon');
    expect(starIcons).toHaveLength(5);
  });

  test('renders stars with correct rating (4 stars)', () => {
    render(<ReviewItem data={mockReviewData} />);

    const starIcons = screen.getAllByTestId('star-icon');

    // First 4 stars should be yellow (filled)
    for (let i = 0; i < 4; i++) {
      expect(starIcons[i]).toHaveClass('text-yellow-400');
      expect(starIcons[i]).not.toHaveClass('text-gray-200');
    }

    // Last star should be gray (empty)
    expect(starIcons[4]).toHaveClass('text-gray-200');
    expect(starIcons[4]).not.toHaveClass('text-yellow-400');
  });

  test('renders stars with correct rating (5 stars)', () => {
    render(<ReviewItem data={mockReviewDataWithoutAvatar} />);

    const starIcons = screen.getAllByTestId('star-icon');

    // All 5 stars should be yellow (filled)
    starIcons.forEach(star => {
      expect(star).toHaveClass('text-yellow-400');
      expect(star).not.toHaveClass('text-gray-200');
    });
  });

  test('renders stars with correct rating (1 star)', () => {
    const oneStarReview = { ...mockReviewData, rating: 1 };
    render(<ReviewItem data={oneStarReview} />);

    const starIcons = screen.getAllByTestId('star-icon');

    // First star should be yellow (filled)
    expect(starIcons[0]).toHaveClass('text-yellow-400');

    // Last 4 stars should be gray (empty)
    for (let i = 1; i < 5; i++) {
      expect(starIcons[i]).toHaveClass('text-gray-200');
    }
  });

  test('renders stars with default rating when rating is not provided', () => {
    const noRatingReview = { ...mockReviewData, rating: undefined };
    render(<ReviewItem data={noRatingReview} />);

    const starIcons = screen.getAllByTestId('star-icon');

    // First star should be yellow (default rating is 1)
    expect(starIcons[0]).toHaveClass('text-yellow-400');

    // Last 4 stars should be gray (empty)
    for (let i = 1; i < 5; i++) {
      expect(starIcons[i]).toHaveClass('text-gray-200');
    }
  });

  test('renders star icons with correct classes', () => {
    render(<ReviewItem data={mockReviewData} />);

    const starIcons = screen.getAllByTestId('star-icon');

    starIcons.forEach(star => {
      expect(star).toHaveClass('size-5', 'shrink-0');
      expect(star).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('renders review content with HTML', () => {
    render(<ReviewItem data={mockReviewData} />);

    const content = screen.getByText('Great product! Highly recommended.');
    expect(content).toBeInTheDocument();
    expect(content.closest('div')).toHaveClass('text-neutral-600', 'dark:text-neutral-300');
  });

  test('renders review content without HTML when content is empty', () => {
    const emptyContentReview = { ...mockReviewData, content: '' };
    const { container } = render(<ReviewItem data={emptyContentReview} />);

    const contentContainer = container.querySelector('.text-neutral-600');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveTextContent('');
  });

  test('renders content container with correct classes', () => {
    const { container } = render(<ReviewItem data={mockReviewData} />);

    const contentContainer = container.querySelector('.prose');
    expect(contentContainer).toHaveClass(
      'prose',
      'prose-sm',
      'sm:prose',
      'sm:max-w-2xl',
      'dark:prose-invert',
    );
  });

  test('renders main container with correct classes', () => {
    const { container } = render(<ReviewItem data={mockReviewData} />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col');
  });

  test('renders avatar container with correct classes', () => {
    render(<ReviewItem data={mockReviewData} />);

    const avatarContainer = screen.getByTestId('avatar').closest('.shrink-0');
    expect(avatarContainer).toHaveClass('shrink-0', 'pt-0.5');
  });

  test('renders info container with correct classes', () => {
    render(<ReviewItem data={mockReviewData} />);

    const infoContainer = screen.getByTestId('avatar').closest('.flex')?.querySelector('.flex-1');
    expect(infoContainer).toHaveClass('flex', 'flex-1', 'justify-between');
  });

  test('renders author info container with correct classes', () => {
    render(<ReviewItem data={mockReviewData} />);

    const authorInfoContainer = screen
      .getByText('John Doe', { selector: 'span.font-semibold' })
      .closest('.text-sm');
    expect(authorInfoContainer).toHaveClass('text-sm', 'sm:text-base');
  });

  test('renders stars container with correct classes', () => {
    render(<ReviewItem data={mockReviewData} />);

    const starsContainer = screen.getAllByTestId('star-icon')[0].closest('.flex');
    expect(starsContainer).toHaveClass('mt-0.5', 'flex', 'text-yellow-500');
  });

  test('renders with empty author name', () => {
    const emptyAuthorReview = { ...mockReviewData, author: '' };
    render(<ReviewItem data={emptyAuthorReview} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('data-user-name', '');
  });

  test('renders with empty date', () => {
    const emptyDateReview = { ...mockReviewData, date: '' };
    render(<ReviewItem data={emptyDateReview} />);

    const dateContainer = screen
      .getByTestId('avatar')
      .closest('.flex')
      ?.querySelector('.text-neutral-500');
    expect(dateContainer).toHaveTextContent('');
  });
});
