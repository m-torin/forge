import IconDiscount from '@/components/IconDiscount';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('iconDiscount', () => {
  test('should render svg element', () => {
    const { container } = render(<IconDiscount />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should apply default className', () => {
    const { container } = render(<IconDiscount />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-5', 'h-5');
  });

  test('should apply custom className', () => {
    const { container } = render(<IconDiscount className="h-6 w-6 text-red-500" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-6', 'h-6', 'text-red-500');
    expect(svg).not.toHaveClass('w-5', 'h-5');
  });

  test('should render all path elements', () => {
    const { container } = render(<IconDiscount />);

    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(4);
  });

  test('should have correct stroke attributes', () => {
    const { container } = render(<IconDiscount />);

    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
    });
  });

  test('should have correct strokeWidth for different paths', () => {
    const { container } = render(<IconDiscount />);

    const paths = container.querySelectorAll('path');
    // First two paths have stroke-width 1.5
    expect(paths[0]).toHaveAttribute('stroke-width', '1.5');
    expect(paths[1]).toHaveAttribute('stroke-width', '1.5');
    // Last two paths (dots) have stroke-width 2
    expect(paths[2]).toHaveAttribute('stroke-width', '2');
    expect(paths[3]).toHaveAttribute('stroke-width', '2');
  });

  test('should have fill="none" attribute on svg', () => {
    const { container } = render(<IconDiscount />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  test('should have xmlns attribute', () => {
    const { container } = render(<IconDiscount />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
  });

  test('should inherit color from parent', () => {
    const { container } = render(
      <div style={{ color: 'blue' }}>
        <IconDiscount />
      </div>,
    );

    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('stroke', 'currentColor');
    });
  });

  test('should render discount tag shape correctly', () => {
    const { container } = render(<IconDiscount />);

    const paths = container.querySelectorAll('path');
    // First path is the tag outline
    expect(paths[0]).toHaveAttribute('d');
    expect(paths[0]).toHaveAttribute('d', expect.stringContaining('M3.9889'));
  });

  test('should render diagonal line correctly', () => {
    const { container } = render(<IconDiscount />);

    const paths = container.querySelectorAll('path');
    // Second path is the diagonal line
    expect(paths[1]).toHaveAttribute('d', 'M9 15L15 9');
  });

  test('should render dots correctly', () => {
    const { container } = render(<IconDiscount />);

    const paths = container.querySelectorAll('path');
    // Third and fourth paths are dots
    expect(paths[2]).toHaveAttribute('d', 'M14.4945 14.5H14.5035');
    expect(paths[3]).toHaveAttribute('d', 'M9.49451 9.5H9.50349');
  });

  test('should be accessible with wrapper', () => {
    const { container } = render(
      <div role="img" aria-label="Discount">
        <IconDiscount />
      </div>,
    );

    const wrapper = screen.getByRole('img');
    expect(wrapper).toHaveAttribute('aria-label', 'Discount');
  });

  test('should scale properly with different sizes', () => {
    const { container } = render(<IconDiscount className="h-10 w-10" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-10', 'h-10');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should render with custom className', () => {
    const { container } = render(<IconDiscount className="custom-class" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });

  test('should render consistently', () => {
    const { container: container } = render(<IconDiscount />);
    const { container: container2 } = render(<IconDiscount />);

    expect(container.innerHTML).toBe(container2.innerHTML);
  });
});
