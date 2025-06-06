import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import VerifyIcon from '../../../mantine-ciseco/components/VerifyIcon';

describe('VerifyIcon', () => {
  it('renders verify icon', () => {
    render(<VerifyIcon />);
    const icon = screen.getByTestId('verify-icon');
    expect(icon).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<VerifyIcon className="custom-class" />);
    const icon = screen.getByTestId('verify-icon');
    expect(icon).toHaveClass('custom-class');
  });

  it('renders with custom iconClass', () => {
    render(<VerifyIcon iconClass="w-6 h-6" />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveClass('w-6 h-6');
  });

  it('renders with custom stroke width', () => {
    render(<VerifyIcon strokeWidth={2} />);
    const paths = screen.getByTestId('verify-icon').querySelectorAll('path');
    paths.forEach((path) => {
      expect(path).toHaveAttribute('stroke-width', '2');
    });
  });

  it('renders with custom viewBox', () => {
    render(<VerifyIcon viewBox="0 0 24 24" />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('renders with custom preserveAspectRatio', () => {
    render(<VerifyIcon preserveAspectRatio="xMidYMid meet" />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });

  it('renders with custom fillRule', () => {
    render(<VerifyIcon fillRule="evenodd" />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveAttribute('fill-rule', 'evenodd');
  });

  it('renders with animation', () => {
    render(<VerifyIcon animate="pulse" />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveStyle({ animation: 'pulse' });
  });

  it('renders with gradient', () => {
    render(<VerifyIcon gradient />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveStyle({
      background: 'linear-gradient(45deg, #38BDF8, #818CF8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    });
  });

  it('renders with responsive size', () => {
    render(<VerifyIcon size={{ base: 16, sm: 20, md: 24, lg: 28 }} />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveStyle({
      width: 16,
      height: 16,
      '@media (min-width: 640px)': { width: 20, height: 20 },
      '@media (min-width: 768px)': { width: 24, height: 24 },
      '@media (min-width: 1024px)': { width: 28, height: 28 },
    });
  });

  it('renders with fixed size', () => {
    render(<VerifyIcon size={24} />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveStyle({
      width: 24,
      height: 24,
    });
  });
});
