import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import Avatar from '../../../mantine-ciseco/components/shared/Avatar';

describe('Avatar', () => {
  it('renders avatar with image', () => {
    render(<Avatar src="/avatar.jpg" alt="User Avatar" />);
    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('src', '/avatar.jpg');
    expect(image).toHaveAttribute('alt', 'User Avatar');
  });

  it('renders avatar with initials fallback', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Avatar name="John" size="xs" />);
    expect(screen.getByTestId('avatar')).toHaveClass('size-xs');

    rerender(<Avatar name="John" size="sm" />);
    expect(screen.getByTestId('avatar')).toHaveClass('size-sm');

    rerender(<Avatar name="John" size="md" />);
    expect(screen.getByTestId('avatar')).toHaveClass('size-md');

    rerender(<Avatar name="John" size="lg" />);
    expect(screen.getByTestId('avatar')).toHaveClass('size-lg');

    rerender(<Avatar name="John" size="xl" />);
    expect(screen.getByTestId('avatar')).toHaveClass('size-xl');
  });

  it('renders with different shapes', () => {
    const { rerender } = render(<Avatar name="John" shape="circle" />);
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-full');

    rerender(<Avatar name="John" shape="square" />);
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-none');

    rerender(<Avatar name="John" shape="rounded" />);
    expect(screen.getByTestId('avatar')).toHaveClass('rounded-md');
  });

  it('handles image loading error', () => {
    render(<Avatar src="/invalid-image.jpg" name="John Doe" />);
    const image = screen.getByRole('img');

    fireEvent.error(image);

    // Should fallback to initials
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders with status indicator', () => {
    render(<Avatar name="John" status="online" />);

    const statusIndicator = screen.getByTestId('avatar-status');
    expect(statusIndicator).toHaveClass('status-online');
  });

  it('shows notification badge', () => {
    render(<Avatar name="John" notification={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();
    render(<Avatar name="John" onClick={mockOnClick} />);

    const avatar = screen.getByTestId('avatar');
    fireEvent.click(avatar);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it('generates consistent colors for names', () => {
    const { rerender } = render(<Avatar name="John Doe" />);
    const avatar1 = screen.getByTestId('avatar');
    const backgroundColor1 = getComputedStyle(avatar1).backgroundColor;

    rerender(<Avatar name="John Doe" />);
    const avatar2 = screen.getByTestId('avatar');
    const backgroundColor2 = getComputedStyle(avatar2).backgroundColor;

    expect(backgroundColor1).toBe(backgroundColor2);
  });

  it('renders with custom color', () => {
    render(<Avatar name="John" color="blue" />);
    const avatar = screen.getByTestId('avatar');

    expect(avatar).toHaveClass('bg-blue-500');
  });

  it('supports group layout', () => {
    render(
      <div data-testid="avatar-group">
        <Avatar name="John" />
        <Avatar name="Jane" />
        <Avatar name="Bob" />
      </div>,
    );

    const group = screen.getByTestId('avatar-group');
    expect(group).toHaveClass('avatar-group');
  });

  it('renders with custom className', () => {
    render(<Avatar name="John" className="custom-avatar" />);
    expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar');
  });

  it('handles hover effects', () => {
    render(<Avatar name="John" hoverable />);
    const avatar = screen.getByTestId('avatar');

    fireEvent.mouseEnter(avatar);
    expect(avatar).toHaveClass('hover-effect');
  });

  it('shows tooltip with user info', async () => {
    render(<Avatar name="John Doe" tooltip="John Doe - Developer" />);
    const avatar = screen.getByTestId('avatar');

    fireEvent.mouseEnter(avatar);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('John Doe - Developer');
    });
  });

  it('renders with border', () => {
    render(<Avatar name="John" bordered borderColor="blue" />);
    const avatar = screen.getByTestId('avatar');

    expect(avatar).toHaveClass('border-2', 'border-blue-500');
  });

  it('supports accessibility attributes', () => {
    render(<Avatar name="John Doe" alt="John Doe's profile picture" role="button" tabIndex={0} />);

    const avatar = screen.getByTestId('avatar');
    expect(avatar).toHaveAttribute('alt', "John Doe's profile picture");
    expect(avatar).toHaveAttribute('role', 'button');
    expect(avatar).toHaveAttribute('tabindex', '0');
  });
});
