import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test-utils';
import PostCard1 from '../../../mantine-ciseco/components/blog/PostCard1';
import { mockPost } from '../test-utils';

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, 'data-testid': testId, ...props }: any) => (
    <img src={src} alt={alt} data-testid={testId} {...props} />
  ),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, 'data-testid': testId, ...props }: any) => (
    <a href={href} data-testid={testId} {...props}>
      {children}
    </a>
  ),
}));

// Mock useLocalizeHref hook
vi.mock('../../../mantine-ciseco/hooks/useLocale', () => ({
  useLocalizeHref: () => (href: string) => `/en${href}`,
}));

describe('PostCard1', () => {
  const defaultPost = mockPost({
    title: 'Test Blog Post',
    excerpt: 'Test blog post excerpt',
    author: { name: 'Test Author', avatar: { src: '/test-avatar.jpg' } },
    date: '2024-01-01',
    featuredImage: { src: '/test-blog.jpg' },
    handle: 'test-blog-post',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders post card with basic information', () => {
    render(<PostCard1 post={defaultPost} />);

    expect(screen.getByTestId('post-card')).toBeInTheDocument();
    expect(screen.getByText(defaultPost.title)).toBeInTheDocument();
    expect(screen.getByText(defaultPost.excerpt)).toBeInTheDocument();
    expect(screen.getByText(defaultPost.author.name)).toBeInTheDocument();
  });

  it('renders post image with correct attributes', () => {
    render(<PostCard1 post={defaultPost} />);

    const image = screen.getByTestId('post-card-image');
    expect(image).toHaveAttribute('src', defaultPost.featuredImage.src);
    expect(image).toHaveAttribute('alt', defaultPost.title);
  });

  it('renders title as a link to the blog post', () => {
    render(<PostCard1 post={defaultPost} />);

    const titleLink = screen.getByTestId('post-card-title-link');
    expect(titleLink).toHaveAttribute('href', `/en/blog/${defaultPost.handle}`);
    expect(titleLink).toHaveTextContent(defaultPost.title);
  });

  it('renders excerpt text', () => {
    render(<PostCard1 post={defaultPost} />);

    const excerpt = screen.getByTestId('post-card-excerpt');
    expect(excerpt).toHaveTextContent(defaultPost.excerpt);
  });

  it('renders post meta information', () => {
    render(<PostCard1 post={defaultPost} />);

    expect(screen.getByTestId('post-card-meta')).toBeInTheDocument();
    expect(screen.getByTestId('post-card-meta-author')).toHaveTextContent(defaultPost.author.name);
    expect(screen.getByTestId('post-card-meta-date')).toHaveTextContent(defaultPost.date);
  });

  it('renders with custom className', () => {
    const customClass = 'custom-post-card';
    render(<PostCard1 post={defaultPost} className={customClass} />);

    const card = screen.getByTestId('post-card');
    expect(card).toHaveClass(customClass);
  });

  it('renders with small size variant', () => {
    render(<PostCard1 post={defaultPost} size="sm" />);

    const title = screen.getByTestId('post-card-title');
    expect(title).toHaveClass('text-base', 'sm:text-xl');
  });

  it('renders with medium size variant by default', () => {
    render(<PostCard1 post={defaultPost} />);

    const title = screen.getByTestId('post-card-title');
    expect(title).toHaveClass('text-lg', 'sm:text-2xl');
  });

  it('renders with custom testId', () => {
    const customTestId = 'custom-blog-card';
    render(<PostCard1 post={defaultPost} testId={customTestId} />);

    expect(screen.getByTestId(customTestId)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-title`)).toBeInTheDocument();
    expect(screen.getByTestId(`${customTestId}-image`)).toBeInTheDocument();
  });

  it('handles posts without images gracefully', () => {
    const postWithoutImage = mockPost({
      ...defaultPost,
      featuredImage: null,
    });

    render(<PostCard1 post={postWithoutImage} />);

    expect(screen.getByTestId('post-card')).toBeInTheDocument();
    expect(screen.queryByTestId('post-card-image')).not.toBeInTheDocument();
  });

  it('renders image link with correct href', () => {
    render(<PostCard1 post={defaultPost} />);

    const imageLink = screen.getByTestId('post-card-image-link');
    expect(imageLink).toHaveAttribute('href', `/en/blog/${defaultPost.handle}`);
    expect(imageLink).toHaveAttribute('title', defaultPost.title);
  });
});
