import BagIcon from '@/components/BagIcon';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('bagIcon', () => {
  test('should render svg element', () => {
    const { container } = render(<BagIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 9 9');
  });

  test('should apply default className', () => {
    const { container } = render(<BagIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-5', 'h-5');
  });

  test('should apply custom className', () => {
    const { container } = render(<BagIcon className="h-8 w-8 text-blue-500" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-8', 'h-8', 'text-blue-500');
    expect(svg).not.toHaveClass('w-5', 'h-5');
  });

  test('should render all path elements', () => {
    const { container } = render(<BagIcon />);

    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(2);
  });

  test('should have correct fill attributes', () => {
    const { container } = render(<BagIcon />);

    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('fill', 'currentColor');
    });
  });

  test('should have fillRule and clipRule on second path', () => {
    const { container } = render(<BagIcon />);

    const paths = container.querySelectorAll('path');
    // Check for fill-rule attribute (hyphenated in DOM)
    expect(paths[1]).toHaveAttribute('fill-rule', 'evenodd');
    expect(paths[1]).toHaveAttribute('clip-rule', 'evenodd');
  });

  test('should inherit color from parent', () => {
    const { container } = render(
      <div style={{ color: 'red' }}>
        <BagIcon />
      </div>,
    );

    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('fill', 'currentColor');
    });
  });

  test('should maintain aspect ratio', () => {
    const { container } = render(<BagIcon className="h-10 w-10" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-10', 'h-10');
    expect(svg).toHaveAttribute('viewBox', '0 0 9 9');
  });

  test('should be accessible with role and aria-label', () => {
    const { container } = render(
      <div role="img" aria-label="Shopping bag">
        <BagIcon />
      </div>,
    );

    const wrapper = screen.getByRole('img');
    expect(wrapper).toHaveAttribute('aria-label', 'Shopping bag');
  });

  test('should render consistently', () => {
    const { container: container } = render(<BagIcon />);
    const { container: container2 } = render(<BagIcon />);

    expect(container.innerHTML).toBe(container2.innerHTML);
  });

  test('should render with custom className', () => {
    const { container } = render(<BagIcon className="custom-class" />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('custom-class');
  });
});
