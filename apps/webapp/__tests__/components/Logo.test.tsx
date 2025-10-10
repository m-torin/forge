import Logo from '@/components/Logo';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('logo Component', () => {
  test('renders logo with default props', () => {
    render(<Logo />);

    const logoLink = screen.getByRole('link');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  test('renders with custom className', () => {
    const customClass = 'custom-logo-class';
    render(<Logo className={customClass} />);

    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveClass(customClass);
  });

  test('renders SVG element', () => {
    const { container } = render(<Logo />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '112');
    expect(svg).toHaveAttribute('height', '44');
  });

  test('passes additional props to SVG', () => {
    const testId = 'logo-svg';
    render(<Logo data-testid={testId} />);

    const svg = screen.getByTestId(testId);
    expect(svg).toBeInTheDocument();
  });

  test('applies dark mode class', () => {
    render(<Logo />);

    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveClass('dark:text-neutral-50');
  });
});
