import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import Avatar from '../../../src/mantine-ciseco/components/shared/Avatar/Avatar';

// Mock Next.js Image component
vi.mock('next/image', (_: any) => ({
  default: ({ src, alt, fill, ...props }: any) => (
    <img src={typeof src === 'object' ? src.src : src} alt={alt} {...props} />
  ),
}));

// Mock the avatar image import
vi.mock('../../../src/mantine-ciseco/images/users/avatar4.jpg', (_: any) => ({
  default: { src: '/default-avatar.jpg', width: 100, height: 100 },
}));

describe('Avatar', (_: any) => {
  it('renders avatar with custom image', (_: any) => {
    render(<Avatar imgUrl="/custom-avatar.jpg" userName="John Smith" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    const image = screen.getByRole('img');

    expect(avatar).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/custom-avatar.jpg');
    expect(image).toHaveAttribute('alt', 'John Smith');
  });

  it('renders avatar with default image when no imgUrl provided', (_: any) => {
    render(<Avatar userName="Jane Doe" testId="avatar" />);
    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('src', '/default-avatar.jpg');
    expect(image).toHaveAttribute('alt', 'Jane Doe');
  });

  it('renders first letter of userName', (_: any) => {
    render(<Avatar userName="Alice Johnson" testId="avatar" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders default userName when not provided', (_: any) => {
    render(<Avatar testId="avatar" />);
    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of 'John Doe'
  });

  it('renders with custom size class', (_: any) => {
    render(<Avatar sizeClass="size-10 text-lg" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('size-10', 'text-lg');
  });

  it('renders with custom radius', (_: any) => {
    render(<Avatar radius="rounded-lg" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('rounded-lg');
  });

  it('renders with custom container className', (_: any) => {
    render(<Avatar containerClassName="ring-2 ring-blue-500" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveClass('ring-2', 'ring-blue-500');
  });

  it('renders verified badge when hasChecked is true', (_: any) => {
    render(<Avatar hasChecked testId="avatar" />);
    const verifyIcon = screen.getByTestId('avatar').querySelector('.absolute.text-white');
    expect(verifyIcon).toBeInTheDocument();
  });

  it('renders with custom hasCheckedClass', (_: any) => {
    render(<Avatar hasChecked hasCheckedClass="w-6 h-6 bottom-0 right-0" testId="avatar" />);
    const verifyIcon = screen.getByTestId('avatar').querySelector('.absolute.text-white');
    expect(verifyIcon).toHaveClass('w-6', 'h-6', 'bottom-0', 'right-0');
  });

  it('applies background color based on userName when no image', (_: any) => {
    render(<Avatar imgUrl="" userName="Test User" testId="avatar" />);
    const avatar = screen.getByTestId('avatar');

    // Should have a background color style
    expect(avatar).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('renders with default classes', (_: any) => {
    render(<Avatar testId="avatar" />);
    const avatar = screen.getByTestId('avatar');

    expect(avatar).toHaveClass(
      'wil-avatar',
      'relative',
      'inline-flex',
      'shrink-0',
      'items-center',
      'justify-center',
      'font-semibold',
      'text-neutral-100',
      'uppercase',
      'shadow-inner',
      'rounded-full',
      'size-6',
      'text-sm',
      'ring-1',
      'ring-white',
      'dark:ring-neutral-900',
    );
  });

  it('maintains consistent color for same userName', (_: any) => {
    const { rerender } = render(<Avatar imgUrl="" userName="Consistent User" testId="avatar" />);
    const avatar1 = screen.getByTestId('avatar');
    const style1 = window.getComputedStyle(avatar1).backgroundColor;

    rerender(<Avatar imgUrl="" userName="Consistent User" testId="avatar" />);
    const avatar2 = screen.getByTestId('avatar');
    const style2 = window.getComputedStyle(avatar2).backgroundColor;

    expect(style1).toBe(style2);
  });
});
