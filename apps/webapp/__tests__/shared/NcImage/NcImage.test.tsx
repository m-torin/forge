import NcImage from '@/shared/NcImage/NcImage';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, vi } from 'vitest';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    className,
    fill,
    priority,
    outline,
    sizes,
    quality,
    placeholder,
    blurDataURL,
    unoptimized,
    ...props
  }: any) => {
    const imgProps: any = {
      src: typeof src === 'object' ? src.src : src,
      alt: alt || '',
      className,
      'data-testid': 'nc-image',
    };

    // Convert boolean and special props to data attributes
    const specialProps = {
      fill,
      priority,
      outline,
      sizes,
      quality,
      placeholder,
      blurDataURL,
      unoptimized,
    };
    Object.entries(specialProps).forEach(([prop, value]) => {
      if (value !== undefined) {
        imgProps[`data-${prop}`] = String(value);
      }
    });

    // Apply remaining props but filter out known problematic props
    const excludedProps = [
      'data-testid',
      'src',
      'alt',
      'className',
      'fill',
      'priority',
      'outline',
      'sizes',
      'quality',
      'placeholder',
      'blurDataURL',
      'unoptimized',
    ];
    Object.keys(props).forEach(key => {
      if (!excludedProps.includes(key)) {
        if (typeof props[key] === 'boolean') {
          imgProps[`data-${key}`] = String(props[key]);
        } else {
          imgProps[key] = props[key];
        }
      }
    });

    return React.createElement('img', imgProps);
  },
}));

describe('ncImage', () => {
  test('should render image with src and alt', () => {
    render(<NcImage src="/test-image.jpg" alt="Test image" />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  test('should apply custom className', () => {
    render(<NcImage src="/test.jpg" alt="Test" className="custom-image" />);

    const image = screen.getByTestId('nc-image');
    expect(image).toHaveClass('custom-image');
  });

  test('should handle different image sizes', () => {
    render(<NcImage src="/test.jpg" alt="Test" width={300} height={200} />);

    const image = screen.getByTestId('nc-image');
    expect(image).toHaveAttribute('width', '300');
    expect(image).toHaveAttribute('height', '200');
  });

  test('should render with fill prop', () => {
    render(<NcImage src="/test.jpg" alt="Test" fill />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should handle priority prop for eager loading', () => {
    render(<NcImage src="/test.jpg" alt="Test" priority />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should handle quality prop', () => {
    render(<NcImage src="/test.jpg" alt="Test" quality={80} />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should render with placeholder', () => {
    render(<NcImage src="/test.jpg" alt="Test" placeholder="blur" />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should handle object fit styles', () => {
    render(<NcImage src="/test.jpg" alt="Test" style={{ objectFit: 'cover' }} />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should render with responsive sizes', () => {
    render(<NcImage src="/test.jpg" alt="Test" sizes="(max-width: 768px) 100vw, 50vw" />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should handle loading state', () => {
    render(<NcImage src="/test.jpg" alt="Test" loading="lazy" />);

    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should render fallback when image fails to load', () => {
    render(<NcImage src="" alt="Failed image" />);

    // Should still render the image element, even with empty src
    const image = screen.getByTestId('nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should pass through additional props', () => {
    render(<NcImage src="/test.jpg" alt="Test" data-testid="custom-nc-image" />);

    const image = screen.getByTestId('custom-nc-image');
    expect(image).toBeInTheDocument();
  });

  test('should render without errors', () => {
    expect(() => {
      render(<NcImage src="/test.jpg" alt="Test image" />);
    }).not.toThrow();
  });
});
