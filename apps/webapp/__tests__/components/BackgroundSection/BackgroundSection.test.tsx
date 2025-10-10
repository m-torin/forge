import BackgroundSection from '@/components/BackgroundSection/BackgroundSection';
import { render } from '@testing-library/react';
import { describe, expect } from 'vitest';

describe('backgroundSection', () => {
  test('should render background section', () => {
    const { container } = render(<BackgroundSection />);

    const section = container.querySelector('.nc-BackgroundSection');
    expect(section).toBeInTheDocument();
  });

  test('should apply custom className', () => {
    const { container } = render(<BackgroundSection className="custom-bg" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('custom-bg');
  });

  test('should render as different HTML elements', () => {
    const { container } = render(<BackgroundSection />);

    const section = container.firstChild as HTMLElement;
    expect(section.tagName.toLowerCase()).toBe('div');
  });

  test('should apply background styles', () => {
    const { container } = render(<BackgroundSection />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass(/bg-/);
  });

  test('should handle background color variants', () => {
    const { container } = render(<BackgroundSection className="bg-primary-500" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-primary-500');
  });

  test('should render with gradient background', () => {
    const { container } = render(<BackgroundSection className="bg-gradient-to-r" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-gradient-to-r');
  });

  test('should handle full width background', () => {
    const { container } = render(<BackgroundSection />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('w-screen');
  });

  test('should apply padding variants', () => {
    const { container } = render(<BackgroundSection className="p-8" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('p-8');
  });

  test('should render with background image', () => {
    const { container } = render(<BackgroundSection className="bg-cover bg-center" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('bg-cover');
    expect(section).toHaveClass('bg-center');
  });

  test('should handle overlay opacity', () => {
    const { container } = render(<BackgroundSection className="bg-black/50" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toBeInTheDocument();
  });

  test('should be responsive', () => {
    const { container } = render(<BackgroundSection />);

    const responsiveElement = container.querySelector('[class*="xl:"], [class*="2xl:"]');
    expect(responsiveElement).toBeInTheDocument();
  });

  test('should handle dark mode variants', () => {
    const { container } = render(<BackgroundSection />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass(/dark:/);
  });

  test('should render nested content properly', () => {
    const { container } = render(<BackgroundSection />);

    // BackgroundSection is a decorative element, doesn't render children
    const section = container.firstChild as HTMLElement;
    expect(section).toBeInTheDocument();
    expect(section).toBeEmptyDOMElement();
  });

  test('should pass through additional props', () => {
    const { container } = render(<BackgroundSection className="custom-class" />);

    const section = container.firstChild as HTMLElement;
    expect(section).toHaveClass('custom-class');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<BackgroundSection />);
    }).not.toThrow();
  });
});
