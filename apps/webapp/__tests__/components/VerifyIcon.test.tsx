import VerifyIcon from '@/components/VerifyIcon';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('verifyIcon Component', () => {
  test('renders the component with default props', () => {
    render(<VerifyIcon />);

    const span = screen.getByTestId('verify-icon-span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveClass('ml-1');
  });

  test('renders with custom className', () => {
    const customClass = 'custom-verify-icon';
    render(<VerifyIcon className={customClass} />);

    const span = screen.getByTestId('verify-icon-span');
    expect(span).toHaveClass(customClass);
  });

  test('renders with custom iconClass', () => {
    const customIconClass = 'w-6 h-6';
    render(<VerifyIcon iconClass={customIconClass} />);

    const svg = screen.getByTestId('verify-icon-svg');
    expect(svg).toHaveClass(customIconClass);
  });

  test('renders with both custom className and iconClass', () => {
    const customClass = 'custom-verify-icon';
    const customIconClass = 'w-8 h-8';
    render(<VerifyIcon className={customClass} iconClass={customIconClass} />);

    const span = screen.getByTestId('verify-icon-span');
    const svg = screen.getByTestId('verify-icon-svg');

    expect(span).toHaveClass(customClass);
    expect(svg).toHaveClass(customIconClass);
  });

  test('renders SVG with correct viewBox', () => {
    render(<VerifyIcon />);

    const svg = screen.getByTestId('verify-icon-svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 17 17');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  test('renders badge path with correct attributes', () => {
    render(<VerifyIcon />);

    const badgePath = screen.getByTestId('verify-icon-badge-path');
    expect(badgePath).toBeInTheDocument();
    expect(badgePath).toHaveAttribute('fill', '#38BDF8');
    expect(badgePath).toHaveAttribute('stroke', '#38BDF8');
    expect(badgePath).toHaveAttribute('stroke-width', '1.5');
    expect(badgePath).toHaveAttribute('stroke-linecap', 'round');
    expect(badgePath).toHaveAttribute('stroke-linejoin', 'round');
  });

  test('renders checkmark path with correct attributes', () => {
    render(<VerifyIcon />);

    const checkmarkPath = screen.getByTestId('verify-icon-checkmark-path');
    expect(checkmarkPath).toBeInTheDocument();
    expect(checkmarkPath).toHaveAttribute('stroke', 'white');
    expect(checkmarkPath).toHaveAttribute('stroke-width', '1.5');
    expect(checkmarkPath).toHaveAttribute('stroke-linecap', 'round');
    expect(checkmarkPath).toHaveAttribute('stroke-linejoin', 'round');
  });

  test('renders with default classes when no props provided', () => {
    render(<VerifyIcon />);

    const span = screen.getByTestId('verify-icon-span');
    const svg = screen.getByTestId('verify-icon-svg');

    expect(span).toHaveClass('ml-1');
    expect(svg).toHaveClass('w-5', 'h-5');
  });

  test('renders without default classes when custom props provided', () => {
    const customClass = 'custom-verify-icon';
    const customIconClass = 'w-6 h-6';
    render(<VerifyIcon className={customClass} iconClass={customIconClass} />);

    const span = screen.getByTestId('verify-icon-span');
    const svg = screen.getByTestId('verify-icon-svg');

    expect(span).not.toHaveClass('ml-1');
    expect(svg).not.toHaveClass('w-5', 'h-5');
    expect(span).toHaveClass(customClass);
    expect(svg).toHaveClass(customIconClass);
  });

  test('renders SVG structure correctly', () => {
    render(<VerifyIcon />);

    const svg = screen.getByTestId('verify-icon-svg');
    const badgePath = screen.getByTestId('verify-icon-badge-path');
    const checkmarkPath = screen.getByTestId('verify-icon-checkmark-path');

    expect(svg).toContainElement(badgePath);
    expect(svg).toContainElement(checkmarkPath);
  });

  test('renders badge path with correct d attribute', () => {
    render(<VerifyIcon />);

    const badgePath = screen.getByTestId('verify-icon-badge-path');
    const expectedPath =
      'M7.66691 2.62178C8.12691 2.22845 8.88025 2.22845 9.34691 2.62178L10.4002 3.52845C10.6002 3.70178 10.9736 3.84178 11.2402 3.84178H12.3736C13.0802 3.84178 13.6602 4.42178 13.6602 5.12845V6.26178C13.6602 6.52178 13.8002 6.90178 13.9736 7.10178L14.8802 8.15512C15.2736 8.61512 15.2736 9.36845 14.8802 9.83512L13.9736 10.8884C13.8002 11.0884 13.6602 11.4618 13.6602 11.7284V12.8618C13.6602 13.5684 13.0802 14.1484 12.3736 14.1484H11.2402C10.9802 14.1484 10.6002 14.2884 10.4002 14.4618L9.34691 15.3684C8.88691 15.7618 8.13358 15.7618 7.66691 15.3684L6.61358 14.4618C6.41358 14.2884 6.04025 14.1484 5.77358 14.1484H4.62025C3.91358 14.1484 3.33358 13.5684 3.33358 12.8618V11.7218C3.33358 11.4618 3.19358 11.0884 3.02691 10.8884L2.12691 9.82845C1.74025 9.36845 1.74025 8.62178 2.12691 8.16178L3.02691 7.10178C3.19358 6.90178 3.33358 6.52845 3.33358 6.26845V5.12178C3.33358 4.41512 3.91358 3.83512 4.62025 3.83512H5.77358C6.03358 3.83512 6.41358 3.69512 6.61358 3.52178L7.66691 2.62178Z';
    expect(badgePath).toHaveAttribute('d', expectedPath);
  });

  test('renders checkmark path with correct d attribute', () => {
    render(<VerifyIcon />);

    const checkmarkPath = screen.getByTestId('verify-icon-checkmark-path');
    const expectedPath = 'M6.08691 8.98833L7.69358 10.6017L10.9136 7.375';
    expect(checkmarkPath).toHaveAttribute('d', expectedPath);
  });

  test('renders with multiple custom classes', () => {
    const customClass = 'custom-verify-icon text-blue-500';
    const customIconClass = 'w-6 h-6 text-white';
    render(<VerifyIcon className={customClass} iconClass={customIconClass} />);

    const span = screen.getByTestId('verify-icon-span');
    const svg = screen.getByTestId('verify-icon-svg');

    expect(span).toHaveClass('custom-verify-icon', 'text-blue-500');
    expect(svg).toHaveClass('w-6', 'h-6', 'text-white');
  });

  test('renders as a span element', () => {
    render(<VerifyIcon />);

    const span = screen.getByTestId('verify-icon-span');
    expect(span.tagName).toBe('SPAN');
  });

  test('renders SVG as child of span', () => {
    render(<VerifyIcon />);

    const span = screen.getByTestId('verify-icon-span');
    const svg = screen.getByTestId('verify-icon-svg');

    expect(span).toContainElement(svg);
  });
});
