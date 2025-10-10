import { Badge } from '@/shared/badge';
import { render, screen } from '@testing-library/react';
import { describe, expect } from 'vitest';

describe('badge', () => {
  test('should render badge with text', () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    render(<Badge className="custom-badge">Test</Badge>);

    const badge = screen.getByText('Test');
    expect(badge).toHaveClass('custom-badge');
  });

  test('should render different badge colors', () => {
    render(<Badge color="red">Error</Badge>);

    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();
  });

  test('should render blue badge color', () => {
    render(<Badge color="blue">Blue Badge</Badge>);

    const badge = screen.getByText('Blue Badge');
    expect(badge).toBeInTheDocument();
  });

  test('should render green badge', () => {
    render(<Badge color="green">Green Badge</Badge>);

    const badge = screen.getByText('Green Badge');
    expect(badge).toBeInTheDocument();
  });

  test('should render red badge', () => {
    render(<Badge color="red">Red Badge</Badge>);

    const badge = screen.getByText('Red Badge');
    expect(badge).toBeInTheDocument();
  });

  test('should apply default styling', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge).toHaveClass(/rounded/);
  });

  test('should render with icon', () => {
    const TestIcon = () => <span data-testid="badge-icon">⭐</span>;
    render(
      <Badge>
        <TestIcon />
        Featured
      </Badge>,
    );

    const icon = screen.getByTestId('badge-icon');
    expect(icon).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  test('should render as different HTML elements', () => {
    render(<Badge>Default Badge</Badge>);

    const badge = screen.getByText('Default Badge');
    expect(badge.tagName).toBe('SPAN');
  });

  test('should pass through additional props', () => {
    render(
      <Badge data-testid="custom-badge" aria-label="Status badge">
        Status
      </Badge>,
    );

    const badge = screen.getByTestId('custom-badge');
    expect(badge).toHaveAttribute('aria-label', 'Status badge');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Badge>Test Badge</Badge>);
    }).not.toThrow();
  });
});
