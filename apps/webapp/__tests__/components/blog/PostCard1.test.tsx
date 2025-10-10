import PostCard1 from '@/components/blog/PostCard1';
import { TBlogPost } from '@/data/data';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock aside hook globally for all tests
vi.mock('@/components/aside', () => ({
  useAside: () => ({
    close: vi.fn(),
  }),
}));

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, ...props }: any) => (
    <img
      src={typeof src === 'string' ? src : src?.src || ''}
      alt={alt}
      data-fill={fill ? 'true' : 'false'}
      data-priority={priority ? 'true' : 'false'}
      {...props}
    />
  ),
}));

describe('postCard1', () => {
  const mockPost: TBlogPost = {
    title: 'Test Blog Post',
    handle: 'test-blog-post',
    excerpt: 'This is a test blog post excerpt that provides a preview of the content.',
    author: {
      name: 'John Doe',
      description: 'Test author description',
      avatar: {
        src: '/avatar.jpg',
        width: 40,
        height: 40,
        alt: 'John Doe',
      },
    },
    date: '2024-01-01',
    timeToRead: '5 min read',
    featuredImage: {
      src: '/test-image.jpg',
      width: 800,
      height: 600,
      alt: 'Test Blog Post',
    },
  };

  test('should render post card with title', () => {
    render(<PostCard1 post={mockPost} />);

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
  });

  test('should render post image', () => {
    render(<PostCard1 post={mockPost} />);

    const postImage = screen.getByTestId('post-image');
    expect(postImage).toBeInTheDocument();
    expect(postImage).toHaveAttribute('src', '/test-image.jpg');
    expect(postImage).toHaveAttribute('alt', 'Test Blog Post');
  });

  test('should render post excerpt', () => {
    render(<PostCard1 post={mockPost} />);

    expect(
      screen.getByText('This is a test blog post excerpt that provides a preview of the content.'),
    ).toBeInTheDocument();
  });

  test('should render post meta information', () => {
    render(<PostCard1 post={mockPost} />);

    const postMeta = screen.getByTestId('post-meta');
    expect(postMeta).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  test('should render post links with correct hrefs', () => {
    render(<PostCard1 post={mockPost} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(2); // At least image and title links

    // Check that blog post links point to the correct URL
    const blogLinks = links.filter(link => link.getAttribute('href') === '/blog/test-blog-post');
    expect(blogLinks.length).toBeGreaterThanOrEqual(2);
  });

  test('should render post title as a link', () => {
    render(<PostCard1 post={mockPost} />);

    const titleLinks = screen.getAllByRole('link', { name: 'Test Blog Post' });
    expect(titleLinks.length).toBeGreaterThan(0);

    const titleLink = titleLinks[0];
    expect(titleLink).toHaveAttribute('href', '/blog/test-blog-post');
  });

  test('should render post image as a link', () => {
    render(<PostCard1 post={mockPost} />);

    const imageLinks = screen.getAllByRole('link');
    const imageLink = imageLinks.find(link => link.getAttribute('title') === 'Test Blog Post');
    expect(imageLink).toBeInTheDocument();
    expect(imageLink).toHaveAttribute('href', '/blog/test-blog-post');
  });

  test('should handle small size variant', () => {
    render(<PostCard1 post={mockPost} size="sm" />);

    const postCard = screen.getByTestId('post-card-1');
    expect(postCard).toHaveClass('gap-y-6');
  });

  test('should handle medium size variant', () => {
    const { container } = render(<PostCard1 post={mockPost} size="md" />);

    const postCard = container.firstChild as HTMLElement;
    expect(postCard).toHaveClass('gap-y-10');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<PostCard1 post={mockPost} />);
    }).not.toThrow();
  });
});
