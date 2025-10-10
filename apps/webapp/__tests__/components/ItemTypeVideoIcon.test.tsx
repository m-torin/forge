import ItemTypeVideoIcon from '@/components/ItemTypeVideoIcon';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('itemTypeVideoIcon', () => {
  test('should render container div and svg', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    const svg = container.querySelector('svg');

    expect(containerDiv).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
  });

  test('should apply default className to container', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass(
      'bg-black/50',
      'flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'text-white',
      'w-8',
      'h-8',
      'md:w-10',
      'md:h-10',
    );
  });

  test('should apply custom className to container', () => {
    const { container } = render(<ItemTypeVideoIcon className="h-12 w-12 bg-red-500" />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass(
      'bg-black/50',
      'flex',
      'items-center',
      'justify-center',
      'rounded-full',
      'text-white',
      'w-12',
      'h-12',
      'bg-red-500',
    );
  });

  test('should apply correct className to svg', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-4', 'h-4', 'md:w-5', 'md:h-5');
  });

  test('should have correct viewBox', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should have fill="none" on svg', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  test('should render all path elements', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(3);
  });

  test('should have correct stroke attributes on paths', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-width', '1.5');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
    });
  });

  test('should render camera body path correctly', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const paths = container.querySelectorAll('path');
    // First path is the camera body
    expect(paths[0]).toHaveAttribute('d', expect.stringContaining('M12.53 20.4201'));
  });

  test('should render camera lens path correctly', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const paths = container.querySelectorAll('path');
    // Second path is the lens/cone
    expect(paths[1]).toHaveAttribute('d', expect.stringContaining('M19.52 17.0999'));
  });

  test('should render record button path correctly', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const paths = container.querySelectorAll('path');
    // Third path is the record button
    expect(paths[2]).toHaveAttribute('d', expect.stringContaining('M11.5 11C12.3284'));
  });

  test('should maintain aspect ratio', () => {
    const { container } = render(<ItemTypeVideoIcon className="h-20 w-20" />);

    const containerDiv = container.querySelector('div');
    const svg = container.querySelector('svg');

    expect(containerDiv).toHaveClass('w-20', 'h-20');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should have semi-transparent black background', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('bg-black/50');
  });

  test('should have white text color', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('text-white');
  });

  test('should be centered with flexbox', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('flex', 'items-center', 'justify-center');
  });

  test('should be rounded', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('rounded-full');
  });

  test('should handle extra spacing in className template literal', () => {
    const { container } = render(<ItemTypeVideoIcon />);

    const containerDiv = container.querySelector('div');
    // Check that classes are properly applied
    const classes = containerDiv?.className || '';
    expect(classes).toContain('flex');
    expect(classes).toContain('bg-black/50');
    expect(classes).toContain('rounded-full');
  });
});
