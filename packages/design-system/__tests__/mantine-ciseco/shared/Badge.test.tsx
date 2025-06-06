import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Badge from '../../../mantine-ciseco/components/shared/Badge/Badge';

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge name="Test Badge" />);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders badge with custom className', () => {
    render(<Badge name="Test Badge" className="custom-class" />);
    const badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('renders badge with different colors', () => {
    const { rerender } = render(<Badge name="Test Badge" color="pink" />);
    let badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-pink-800', 'bg-pink-100');

    rerender(<Badge name="Test Badge" color="red" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-red-800', 'bg-red-100');

    rerender(<Badge name="Test Badge" color="gray" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-gray-800', 'bg-gray-100');

    rerender(<Badge name="Test Badge" color="green" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-green-800', 'bg-green-100');

    rerender(<Badge name="Test Badge" color="purple" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-purple-800', 'bg-purple-100');

    rerender(<Badge name="Test Badge" color="indigo" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-indigo-800', 'bg-indigo-100');

    rerender(<Badge name="Test Badge" color="yellow" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-yellow-800', 'bg-yellow-100');

    rerender(<Badge name="Test Badge" color="blue" />);
    badge = screen.getByText('Test Badge');
    expect(badge).toHaveClass('text-blue-800', 'bg-blue-100');
  });

  it('renders badge as link when href is provided', () => {
    render(<Badge name="Test Badge" href="/test" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveTextContent('Test Badge');
  });

  it('renders badge as span when no href is provided', () => {
    render(<Badge name="Test Badge" />);
    const badge = screen.getByText('Test Badge');
    expect(badge.tagName).toBe('SPAN');
  });

  it('renders badge with hover effect when href is provided', () => {
    render(<Badge name="Test Badge" href="/test" color="blue" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:bg-blue-800');
  });

  it('renders badge without hover effect when no href is provided', () => {
    render(<Badge name="Test Badge" color="blue" />);
    const badge = screen.getByText('Test Badge');
    expect(badge).not.toHaveClass('hover:bg-blue-800');
  });
});
