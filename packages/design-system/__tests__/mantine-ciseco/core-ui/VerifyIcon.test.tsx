import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import VerifyIcon from '../../../mantine-ciseco/components/VerifyIcon';

describe('VerifyIcon', (_: any) => {
  it('renders verify icon', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    expect(iconWrapper).toBeInTheDocument();
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with default size', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveClass('w-5 h-5');
  });

  it('renders with custom size', (_: any) => {
    render(<VerifyIcon size={24} />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveStyle({ width: '24px', height: '24px' });
  });

  it('renders with custom color', (_: any) => {
    render(<VerifyIcon gradient />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveStyle({ background: 'linear-gradient(45deg, #38BDF8, #818CF8)' });
  });

  it('renders with custom className', (_: any) => {
    render(<VerifyIcon className="custom-class" />);
    const iconWrapper = screen.getByTestId('verify-icon');
    expect(iconWrapper).toHaveClass('custom-class');
  });

  it('renders with custom icon class', (_: any) => {
    render(<VerifyIcon iconClass="w-10 h-10" />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveClass('w-10 h-10');
  });

  it('renders with custom viewBox', (_: any) => {
    render(<VerifyIcon viewBox="0 0 24 24" />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('renders with custom stroke width', (_: any) => {
    render(<VerifyIcon strokeWidth={2} />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const paths = iconWrapper.querySelectorAll('path');
    expect(paths[0]).toHaveAttribute('stroke-width', '2');
  });

  it('supports responsive sizing object', (_: any) => {
    const responsiveSize = { base: 16, sm: 20, md: 24, lg: 32 };
    render(<VerifyIcon size={responsiveSize} />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    // Check that the responsive classes are applied
    const classes = svg?.getAttribute('class') || '';
    expect(classes).toContain('sm:w-[20px]');
    expect(classes).toContain('md:w-[24px]');
    expect(classes).toContain('lg:w-[32px]');
  });

  it('applies animation style when provided', (_: any) => {
    render(<VerifyIcon animate="spin 2s linear infinite" />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveStyle({ animation: 'spin 2s linear infinite' });
  });

  it('applies fill rule when provided', (_: any) => {
    render(<VerifyIcon fillRule="evenodd" />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveAttribute('fill-rule', 'evenodd');
  });

  it('preserves aspect ratio when specified', (_: any) => {
    render(<VerifyIcon preserveAspectRatio="xMidYMid meet" />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  });

  it('renders with default styling', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    expect(iconWrapper).toHaveClass('ml-1');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('applies gradient text fill color styles', (_: any) => {
    render(<VerifyIcon gradient />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    const styles = svg?.getAttribute('style') || '';
    // Just check that gradient styling is applied
    expect(styles).toContain('background');
  });

  it('combines multiple style properties', (_: any) => {
    render(<VerifyIcon size={30} animate="pulse 1s ease-in-out" gradient />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    expect(svg).toHaveStyle({
      width: '30px',
      height: '30px',
      animation: 'pulse 1s ease-in-out',
    });
  });

  it('renders paths with correct stroke colors', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const paths = iconWrapper.querySelectorAll('path');
    expect(paths[0]).toHaveAttribute('stroke', '#38BDF8');
    expect(paths[1]).toHaveAttribute('stroke', 'white');
  });

  it('maintains correct path structure', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const paths = iconWrapper.querySelectorAll('path');
    expect(paths).toHaveLength(2);
    expect(paths[0]).toHaveAttribute('fill', '#38BDF8');
    expect(paths[1]).not.toHaveAttribute('fill');
  });

  it('handles all props without errors', (_: any) => {
    const props = {
      size: 20,
      className: 'test-class',
      iconClass: 'w-6 h-6',
      strokeWidth: 1.5,
      animate: 'bounce 1s',
      gradient: true,
      fillRule: 'nonzero' as const,
      viewBox: '0 0 20 20',
      preserveAspectRatio: 'xMidYMid slice',
    };

    expect(() => render(<VerifyIcon {...props} />)).not.toThrow();
  });

  it('renders inline as a span element', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    expect(iconWrapper.tagName).toBe('SPAN');
  });

  it('is accessible with proper structure', (_: any) => {
    render(<VerifyIcon />);
    const iconWrapper = screen.getByTestId('verify-icon');
    const svg = iconWrapper.querySelector('svg');
    // SVG should be present and properly structured
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelectorAll('path')).toHaveLength(2);
  });
});
