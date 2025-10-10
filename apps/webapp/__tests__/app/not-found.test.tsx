import NotFound from '@/app/not-found';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock image import
vi.mock('@/images/404.png', () => ({
  default: { src: '/404.png', width: 400, height: 400 },
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={className} data-testid="not-found-image" {...props} />
  ),
}));

// Mock NcImage component
vi.mock('@/shared/NcImage/NcImage', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={typeof src === 'object' ? src.src : src} alt={alt} {...props} />
  ),
}));

vi.mock('@/shared/Button/ButtonPrimary', () => ({
  default: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} data-testid="button-primary" {...props}>
      {children}
    </a>
  ),
}));

describe('notFound Page', () => {
  test('should render 404 error page', () => {
    render(<NotFound />);

    // Check for error message
    expect(screen.getByText(/THE PAGE YOU WERE LOOKING FOR DOESN'T EXIST/i)).toBeInTheDocument();
  });

  test('should display error message', () => {
    render(<NotFound />);

    expect(screen.getByText(/DOESN'T EXIST/i)).toBeInTheDocument();
  });

  test('should render go back home button', () => {
    render(<NotFound />);

    const homeButton = screen.getByTestId('button-primary');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
  });

  test('should render 404 illustration image', () => {
    render(<NotFound />);

    const image = screen.getByTestId('not-found-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt');
  });

  test('should have proper page structure', () => {
    const { container } = render(<NotFound />);

    expect(container.firstChild).toBeInTheDocument();
  });

  test('should display helpful message to user', () => {
    render(<NotFound />);

    // Look for the return home button
    const helpfulText = screen.getByText(/Return Home Page/i);
    expect(helpfulText).toBeInTheDocument();
  });

  test('should have responsive design classes', () => {
    const { container } = render(<NotFound />);

    const responsiveElement = container.querySelector(
      '[class*="sm:"], [class*="md:"], [class*="lg:"]',
    );
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should maintain accessibility standards', () => {
    render(<NotFound />);

    // Check for proper image alt text
    const image = screen.getByTestId('not-found-image');
    expect(image).toHaveAttribute('alt', 'not-found');
  });
});
