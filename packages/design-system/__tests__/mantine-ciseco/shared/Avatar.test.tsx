import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Avatar from '../../../mantine-ciseco/components/shared/Avatar/Avatar';

describe('Avatar', () => {
  it('renders avatar with image', () => {
    render(<Avatar imgUrl="/avatar.jpg" userName="John Doe" />);
    const image = screen.getByAltText('John Doe');
    // Next.js Image component optimizes the URL
    expect(image).toHaveAttribute('src', expect.stringContaining('avatar.jpg'));
    expect(image).toHaveAttribute('alt', 'John Doe');
  });

  it('renders avatar with initials fallback', () => {
    render(<Avatar userName="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders with custom size class', () => {
    render(<Avatar sizeClass="size-8 text-base" />);
    const container = screen.getByText('J').parentElement;
    expect(container).toHaveClass('size-8 text-base');
  });

  it('renders with custom radius', () => {
    render(<Avatar radius="rounded-md" />);
    const container = screen.getByText('J').parentElement;
    expect(container).toHaveClass('rounded-md');
  });

  it('renders with custom container class', () => {
    render(<Avatar containerClassName="custom-container" />);
    const container = screen.getByText('J').parentElement;
    expect(container).toHaveClass('custom-container');
  });

  it('renders with verification icon', () => {
    render(<Avatar hasChecked />);
    const icon = screen.getByTestId('verify-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with custom verification icon class', () => {
    render(<Avatar hasChecked hasCheckedClass="w-6 h-6 bottom-2 -right-1" />);
    const icon = screen.getByTestId('verify-icon').parentElement;
    expect(icon).toHaveClass('w-6 h-6 bottom-2 -right-1');
  });
});
