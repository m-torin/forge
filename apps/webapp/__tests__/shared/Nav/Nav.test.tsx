import Nav from '@/shared/Nav/Nav';
import { render, screen } from '@testing-library/react';
import { describe, expect } from 'vitest';

describe('nav', () => {
  test('should render navigation component', () => {
    render(<Nav />);

    const nav = screen.getByRole('list');
    expect(nav).toBeInTheDocument();
  });

  test('should render children', () => {
    render(
      <Nav>
        <li>Home</li>
        <li>Shop</li>
      </Nav>,
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Shop')).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    render(<Nav className="custom-nav" />);

    const nav = screen.getByRole('list');
    expect(nav).toHaveClass('custom-nav');
  });

  test('should have default classes', () => {
    render(<Nav />);

    const nav = screen.getByRole('list');
    expect(nav).toHaveClass('hidden-scrollbar', 'flex', 'overflow-x-auto');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Nav />);
    }).not.toThrow();
  });

  test('should render with empty children', () => {
    render(<Nav />);

    const nav = screen.getByRole('list');
    expect(nav).toBeInTheDocument();
  });
});
