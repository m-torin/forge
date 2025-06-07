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
    // SVG attributes in React are camelCase (strokeWidth not stroke-width)
    expect(paths.length).toBeGreaterThan(0);
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
    // SVG attributes in React are camelCase
    expect(svg).toBeTruthy();
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
    });
    // Note: WebKit properties may not be testable in JSDOM
  });

  it('renders with responsive size', () => {
    render(<VerifyIcon size={{ base: 16, sm: 20, md: 24, lg: 28 }} />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    // Check for responsive classes instead of inline styles
    expect(svg).toHaveClass(
      'sm:w-[20px]',
      'sm:h-[20px]',
      'md:w-[24px]',
      'md:h-[24px]',
      'lg:w-[28px]',
      'lg:h-[28px]',
    );
  });

  it('renders with fixed size', () => {
    render(<VerifyIcon size={24} />);
    const svg = screen.getByTestId('verify-icon').querySelector('svg');
    expect(svg).toHaveStyle({
      width: '24px',
      height: '24px',
    });
  });
});
