import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import PostCard1 from '../../../mantine-ciseco/components/blog/PostCard1';
import { mockPost } from '../test-utils';

describe('PostCard1', () => {
  const defaultPost = mockPost();
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders post card with basic information', () => {
    render(<PostCard1 post={defaultPost} />);

    expect(screen.getByText(defaultPost.title)).toBeInTheDocument();
    expect(screen.getByText(defaultPost.excerpt)).toBeInTheDocument();
    expect(screen.getByText(defaultPost.author)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', defaultPost.title);
  });

  it('renders post image', () => {
    render(<PostCard1 post={defaultPost} />);
    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('src', defaultPost.image);
    expect(image).toHaveAttribute('alt', defaultPost.title);
  });

  it('handles click on post card', () => {
    render(<PostCard1 post={defaultPost} onClick={mockOnClick} />);
    const card = screen.getByTestId('post-card');

    fireEvent.click(card);
    expect(mockOnClick).toHaveBeenCalledWith(defaultPost);
  });

  it('displays formatted publish date', () => {
    render(<PostCard1 post={defaultPost} showDate />);

    // Assuming date formatting, adjust based on actual implementation
    expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
  });

  it('shows read time when provided', () => {
    render(<PostCard1 post={defaultPost} showReadTime />);
    expect(screen.getByText(defaultPost.readTime)).toBeInTheDocument();
  });

  it('renders post categories', () => {
    render(<PostCard1 post={defaultPost} showCategories />);

    defaultPost.categories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('handles category clicks', () => {
    const mockOnCategoryClick = vi.fn();
    render(<PostCard1 post={defaultPost} showCategories onCategoryClick={mockOnCategoryClick} />);

    const categoryButton = screen.getByText(defaultPost.categories[0]);
    fireEvent.click(categoryButton);

    expect(mockOnCategoryClick).toHaveBeenCalledWith(defaultPost.categories[0]);
  });

  it('renders with different layouts', () => {
    const { rerender } = render(<PostCard1 post={defaultPost} layout="vertical" />);
    expect(screen.getByTestId('post-card')).toHaveClass('layout-vertical');

    rerender(<PostCard1 post={defaultPost} layout="horizontal" />);
    expect(screen.getByTestId('post-card')).toHaveClass('layout-horizontal');

    rerender(<PostCard1 post={defaultPost} layout="minimal" />);
    expect(screen.getByTestId('post-card')).toHaveClass('layout-minimal');
  });

  it('shows author avatar when provided', () => {
    const postWithAvatar = mockPost({
      authorAvatar: '/author-avatar.jpg',
    });

    render(<PostCard1 post={postWithAvatar} showAuthor />);

    const authorAvatar = screen.getByAltText(`${postWithAvatar.author} avatar`);
    expect(authorAvatar).toHaveAttribute('src', '/author-avatar.jpg');
  });

  it('renders with featured badge', () => {
    const featuredPost = mockPost({ featured: true });
    render(<PostCard1 post={featuredPost} />);

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('handles hover effects', () => {
    render(<PostCard1 post={defaultPost} />);
    const card = screen.getByTestId('post-card');

    fireEvent.mouseEnter(card);
    expect(card).toHaveClass('hover-effect');

    fireEvent.mouseLeave(card);
    expect(card).not.toHaveClass('hover-effect');
  });

  it('renders with custom className', () => {
    render(<PostCard1 post={defaultPost} className="custom-post-card" />);
    expect(screen.getByTestId('post-card')).toHaveClass('custom-post-card');
  });

  it('shows like and share buttons', () => {
    const mockOnLike = vi.fn();
    const mockOnShare = vi.fn();

    render(<PostCard1 post={defaultPost} showActions onLike={mockOnLike} onShare={mockOnShare} />);

    const likeButton = screen.getByLabelText('Like post');
    const shareButton = screen.getByLabelText('Share post');

    expect(likeButton).toBeInTheDocument();
    expect(shareButton).toBeInTheDocument();

    fireEvent.click(likeButton);
    fireEvent.click(shareButton);

    expect(mockOnLike).toHaveBeenCalledWith(defaultPost);
    expect(mockOnShare).toHaveBeenCalledWith(defaultPost);
  });

  it('displays like count', () => {
    const postWithLikes = mockPost({ likes: 42 });
    render(<PostCard1 post={postWithLikes} showLikes />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows comment count', () => {
    const postWithComments = mockPost({ commentCount: 15 });
    render(<PostCard1 post={postWithComments} showComments />);

    expect(screen.getByText('15 comments')).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    render(<PostCard1 loading />);

    expect(screen.getByTestId('post-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(defaultPost.title)).not.toBeInTheDocument();
  });

  it('handles image loading error', () => {
    render(<PostCard1 post={defaultPost} />);
    const image = screen.getByRole('img');

    fireEvent.error(image);
    expect(image).toHaveAttribute('src', '/placeholder-blog.png');
  });

  it('supports lazy loading', () => {
    render(<PostCard1 post={defaultPost} lazyLoad />);
    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders with excerpt truncation', () => {
    const longExcerptPost = mockPost({
      excerpt:
        'This is a very long excerpt that should be truncated after a certain number of characters to maintain card layout consistency across the blog grid.',
    });

    render(<PostCard1 post={longExcerptPost} excerptLength={100} />);

    const excerpt = screen.getByText(/This is a very long excerpt/);
    expect(excerpt.textContent?.length).toBeLessThanOrEqual(103); // 100 + "..."
  });

  it('shows reading progress indicator', () => {
    const postWithProgress = mockPost({ readingProgress: 65 });
    render(<PostCard1 post={postWithProgress} showProgress />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '65');
  });

  it('handles keyboard navigation', () => {
    render(<PostCard1 post={defaultPost} onClick={mockOnClick} />);
    const card = screen.getByTestId('post-card');

    card.focus();
    expect(card).toHaveFocus();

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(defaultPost);
  });

  it('renders with published status', () => {
    const draftPost = mockPost({ status: 'draft' });
    render(<PostCard1 post={draftPost} showStatus />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByTestId('post-card')).toHaveClass('status-draft');
  });

  it('supports bookmark functionality', () => {
    const mockOnBookmark = vi.fn();
    render(<PostCard1 post={defaultPost} onBookmark={mockOnBookmark} showBookmark />);

    const bookmarkButton = screen.getByLabelText('Bookmark post');
    fireEvent.click(bookmarkButton);

    expect(mockOnBookmark).toHaveBeenCalledWith(defaultPost);
  });

  it('displays tags when provided', () => {
    const postWithTags = mockPost({
      tags: ['React', 'JavaScript', 'Web Development'],
    });

    render(<PostCard1 post={postWithTags} showTags />);

    postWithTags.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });
});
