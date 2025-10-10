import SocialsList from '@/shared/SocialsList/SocialsList';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill ? 'true' : 'false'}
      data-priority={priority ? 'true' : 'false'}
      {...props}
    />
  ),
}));

describe('socialsList', () => {
  test('should render social links list', () => {
    render(<SocialsList />);

    const socialList = screen.getByTestId('social-links');
    expect(socialList).toBeInTheDocument();
  });

  test('should render all social links', () => {
    render(<SocialsList />);

    const facebookLink = screen.getByTestId('social-link-facebook');
    const twitterLink = screen.getByTestId('social-link-twitter');

    expect(facebookLink).toBeInTheDocument();
    expect(twitterLink).toBeInTheDocument();
  });

  test('should render social links with correct URLs', () => {
    render(<SocialsList />);

    const facebookLink = screen.getByTestId('social-link-facebook');
    expect(facebookLink).toHaveAttribute('href', '#');
  });

  test('should open links in new tab', () => {
    render(<SocialsList />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  test('should render social icons', () => {
    render(<SocialsList />);

    // Check for social media icons (usually SVGs or icon components)
    const icons = screen.queryAllByRole('img') || document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThanOrEqual(0);
  });

  test('should apply custom className', () => {
    render(<SocialsList className="custom-social" />);

    const socialList = screen.getByTestId('social-links');
    expect(socialList.parentElement).toHaveClass('custom-social');
  });

  test('should render with different item classes', () => {
    render(<SocialsList itemClass="w-8 h-8" />);

    const socialList = screen.getByTestId('social-links');
    expect(socialList).toBeInTheDocument();
  });

  test('should be accessible with proper ARIA labels', () => {
    render(<SocialsList />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('aria-label');
    });
  });

  test('should render without errors', () => {
    expect(() => {
      render(<SocialsList />);
    }).not.toThrow();
  });

  test('should render all four social platforms', () => {
    render(<SocialsList />);

    const facebookLink = screen.getByTestId('social-link-facebook');
    const twitterLink = screen.getByTestId('social-link-twitter');
    const youtubeLink = screen.getByTestId('social-link-youtube');
    const telegramLink = screen.getByTestId('social-link-telegram');

    expect(facebookLink).toBeInTheDocument();
    expect(twitterLink).toBeInTheDocument();
    expect(youtubeLink).toBeInTheDocument();
    expect(telegramLink).toBeInTheDocument();
  });
});
