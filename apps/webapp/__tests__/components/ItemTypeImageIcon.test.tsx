import ItemTypeImageIcon from '@/components/ItemTypeImageIcon';
import { render } from '@testing-library/react';
import { describe, expect } from 'vitest';

describe('itemTypeImageIcon', () => {
  test('should render container div and svg', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const containerDiv = container.querySelector('div');
    const svg = container.querySelector('svg');

    expect(containerDiv).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
  });

  test('should apply default className to container', () => {
    const { container } = render(<ItemTypeImageIcon />);

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
    const { container } = render(<ItemTypeImageIcon className="h-12 w-12" />);

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
    );
  });

  test('should apply correct className to svg', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-4', 'h-4', 'md:w-5', 'md:h-5');
  });

  test('should have correct viewBox', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should have fill="none" on svg', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  test('should render all path elements', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(3);
  });

  test('should have correct stroke attributes on paths', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      expect(path).toHaveAttribute('stroke', 'currentColor');
      expect(path).toHaveAttribute('stroke-width', '1.5');
      expect(path).toHaveAttribute('stroke-linecap', 'round');
      expect(path).toHaveAttribute('stroke-linejoin', 'round');
    });
  });

  test('should render frame path correctly', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const paths = container.querySelectorAll('path');
    // First path is the frame
    expect(paths[0]).toHaveAttribute('d', expect.stringContaining('M9 22H15C20'));
  });

  test('should render circle path correctly', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const paths = container.querySelectorAll('path');
    // Second path is the circle (sun)
    expect(paths[1]).toHaveAttribute('d', expect.stringContaining('M9 10C10.1046'));
  });

  test('should render landscape path correctly', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const paths = container.querySelectorAll('path');
    // Third path is the landscape/mountains
    expect(paths[2]).toHaveAttribute('d', expect.stringContaining('M2.67004 18.9501'));
  });

  test('should maintain aspect ratio', () => {
    const { container } = render(<ItemTypeImageIcon className="h-16 w-16" />);

    const containerDiv = container.querySelector('div');
    const svg = container.querySelector('svg');

    expect(containerDiv).toHaveClass('w-16', 'h-16');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  test('should have semi-transparent black background', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('bg-black/50');
  });

  test('should have white text color', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('text-white');
  });

  test('should be centered with flexbox', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('flex', 'items-center', 'justify-center');
  });

  test('should be rounded', () => {
    const { container } = render(<ItemTypeImageIcon />);

    const containerDiv = container.querySelector('div');
    expect(containerDiv).toHaveClass('rounded-full');
  });
});
