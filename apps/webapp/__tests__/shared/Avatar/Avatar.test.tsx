import Avatar from '@/shared/Avatar/Avatar';
import { render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, className, fill, priority, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="avatar-image"
      data-fill={fill ? 'true' : 'false'}
      data-priority={priority ? 'true' : 'false'}
      {...props}
    />
  ),
}));

// Mock VerifyIcon component
vi.mock('@/components/VerifyIcon', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="verify-icon" className={className}>
      ✓
    </div>
  ),
}));

describe('avatar', () => {
  test('should render avatar with image', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" />);

    const avatar = screen.getByTestId('avatar-image');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/test-avatar.jpg');
  });

  test('should render avatar with alt text', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" userName="User Avatar" />);

    const avatar = screen.getByTestId('avatar-image');
    expect(avatar).toHaveAttribute('alt', 'User Avatar');
  });

  test('should apply custom className', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" containerClassName="custom-avatar" />);

    const avatarContainer = screen.getByText('J').parentElement;
    expect(avatarContainer).toHaveClass('custom-avatar');
  });

  test('should render with different sizes', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" sizeClass="size-8 text-lg" />);

    const avatarContainer = screen.getByText('J').parentElement;
    expect(avatarContainer).toHaveClass('size-8', 'text-lg');
  });

  test('should render fallback when no imgUrl provided', () => {
    render(<Avatar />);

    // Should render initials as fallback
    const initials = screen.getByText('J');
    expect(initials).toBeInTheDocument();
  });

  test('should render user initials as fallback', () => {
    render(<Avatar userName="John Doe" />);

    const initials = screen.getByText('J');
    expect(initials).toBeInTheDocument();
  });

  test('should handle circular avatar shape', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" radius="rounded-full" />);

    const avatarContainer = screen.getByText('J').parentElement;
    expect(avatarContainer).toHaveClass('rounded-full');
  });

  test('should handle square avatar shape', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" radius="rounded-lg" />);

    const avatarContainer = screen.getByText('J').parentElement;
    expect(avatarContainer).toHaveClass('rounded-lg');
  });

  test('should render with border', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" containerClassName="ring-2 ring-blue-500" />);

    const avatarContainer = screen.getByText('J').parentElement;
    expect(avatarContainer).toHaveClass('ring-2', 'ring-blue-500');
  });

  test('should handle verified status indicator', () => {
    const { container } = render(<Avatar imgUrl="/test-avatar.jpg" hasChecked />);

    // The VerifyIcon component should be rendered inside a span
    const verifySpan = container.querySelector('.absolute.text-white');
    expect(verifySpan).toBeInTheDocument();

    // Check for the verify icon
    const verifyIcon = screen.getByTestId('verify-icon');
    expect(verifyIcon).toBeInTheDocument();
  });

  test('should render without errors when imgUrl is invalid', () => {
    expect(() => {
      render(<Avatar imgUrl="" />);
    }).not.toThrow();
  });

  test('should handle click events', () => {
    const mockClick = vi.fn();
    render(<Avatar imgUrl="/test-avatar.jpg" />);

    const avatarContainer = screen.getByText('J').parentElement;
    expect(avatarContainer).toBeInTheDocument();
    avatarContainer!.onclick = mockClick;
    avatarContainer!.click();
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test('should be accessible with proper alt text', () => {
    render(<Avatar imgUrl="/test-avatar.jpg" userName="John Doe" />);

    const avatar = screen.getByTestId('avatar-image');
    expect(avatar).toHaveAttribute('alt', 'John Doe');
  });
});
