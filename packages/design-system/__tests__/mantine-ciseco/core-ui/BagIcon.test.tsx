import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import BagIcon from '../../../mantine-ciseco/components/BagIcon';

describe('BagIcon', () => {
  it('renders bag icon', () => {
    render(<BagIcon />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    const { rerender } = render(<BagIcon size={24} />);
    let icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');

    rerender(<BagIcon size={32} />);
    icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('width', '32');
    expect(icon).toHaveAttribute('height', '32');
  });

  it('renders with custom color', () => {
    render(<BagIcon color="red" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ color: 'red' });
  });

  it('renders with custom className', () => {
    render(<BagIcon className="custom-icon-class" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('custom-icon-class');
  });

  it('shows item count badge when count > 0', () => {
    render(<BagIcon count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not show badge when count is 0', () => {
    render(<BagIcon count={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows 99+ for counts greater than 99', () => {
    render(<BagIcon count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders with filled variant', () => {
    render(<BagIcon variant="filled" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('icon-filled');
  });

  it('renders with outline variant', () => {
    render(<BagIcon variant="outline" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('icon-outline');
  });

  it('has proper accessibility attributes', () => {
    render(<BagIcon ariaLabel="Shopping cart" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('aria-label', 'Shopping cart');
  });

  it('animates badge on count change', async () => {
    const { rerender } = render(<BagIcon count={1} />);
    const badge = screen.getByText('1');

    // Check initial state
    expect(badge).toBeInTheDocument();

    // Update count
    rerender(<BagIcon count={2} />);

    // Badge should animate (check for animation class)
    expect(screen.getByText('2')).toHaveClass('badge-animate');
  });

  it('supports custom badge color', () => {
    render(<BagIcon count={5} badgeColor="green" />);
    const badge = screen.getByText('5');
    expect(badge).toHaveStyle({ backgroundColor: 'green' });
  });

  it('supports custom badge position', () => {
    const { rerender } = render(<BagIcon count={5} badgePosition="top-right" />);
    let badge = screen.getByText('5');
    expect(badge).toHaveClass('badge-top-right');

    rerender(<BagIcon count={5} badgePosition="bottom-right" />);
    badge = screen.getByText('5');
    expect(badge).toHaveClass('badge-bottom-right');
  });

  it('renders as button when onClick is provided', () => {
    const mockOnClick = vi.fn();
    render(<BagIcon onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<BagIcon loading />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('supports stroke width customization', () => {
    render(<BagIcon strokeWidth={3} />);
    const icon = screen.getByRole('img', { hidden: true });
    const path = icon.querySelector('path');
    expect(path).toHaveAttribute('stroke-width', '3');
  });

  it('renders with hover effects when interactive', () => {
    render(<BagIcon onClick={() => {}} />);
    const button = screen.getByRole('button');

    fireEvent.mouseEnter(button);
    expect(button).toHaveClass('hover-effect');

    fireEvent.mouseLeave(button);
    expect(button).not.toHaveClass('hover-effect');
  });

  it('supports custom SVG props', () => {
    render(<BagIcon viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('viewBox', '0 0 32 32');
    expect(icon).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });
});
