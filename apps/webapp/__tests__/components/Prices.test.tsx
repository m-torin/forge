import Prices from '@/components/Prices';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('prices Component', () => {
  test('renders price with default formatting', () => {
    render(<Prices price={99.99} />);

    const priceElement = screen.getByText('$99.99');
    expect(priceElement).toBeInTheDocument();
  });

  test('renders price with custom className', () => {
    const customClass = 'custom-prices-class';
    render(<Prices price={50} className={customClass} />);

    const container = screen.getByText('$50.00').closest('div')?.parentElement;
    expect(container).toHaveClass(customClass);
  });

  test('renders price with custom contentClass', () => {
    const customContentClass = 'custom-content-class';
    render(<Prices price={25.5} contentClass={customContentClass} />);

    const priceContainer = screen.getByText('$25.50').closest('div');
    expect(priceContainer).toHaveClass(customContentClass);
  });

  test('formats price with two decimal places', () => {
    render(<Prices price={100} />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  test('formats price with existing decimals', () => {
    render(<Prices price={99.9} />);

    expect(screen.getByText('$99.90')).toBeInTheDocument();
  });

  test('formats zero price correctly', () => {
    render(<Prices price={0} />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  test('formats negative price correctly', () => {
    render(<Prices price={-10.5} />);

    expect(screen.getByText('$-10.50')).toBeInTheDocument();
  });

  test('formats large price correctly', () => {
    render(<Prices price={9999.99} />);

    expect(screen.getByText('$9999.99')).toBeInTheDocument();
  });

  test('applies default contentClass when not provided', () => {
    render(<Prices price={75} />);

    const priceContainer = screen.getByText('$75.00').closest('div');
    expect(priceContainer).toHaveClass(
      'py-1',
      'px-2',
      'md:py-1.5',
      'md:px-2.5',
      'text-sm',
      'font-medium',
    );
  });

  test('applies green styling classes', () => {
    render(<Prices price={45} />);

    const priceContainer = screen.getByText('$45.00').closest('div');
    expect(priceContainer).toHaveClass('border-green-500');

    const priceText = screen.getByText('$45.00');
    expect(priceText).toHaveClass('text-green-500');
  });

  test('applies border styling', () => {
    render(<Prices price={30} />);

    const priceContainer = screen.getByText('$30.00').closest('div');
    expect(priceContainer).toHaveClass('border-2', 'rounded-lg');
  });

  test('applies flex layout', () => {
    render(<Prices price={60} />);

    const priceContainer = screen.getByText('$60.00').closest('div');
    expect(priceContainer).toHaveClass('flex', 'items-center');
  });

  test('renders with all props combined', () => {
    const customClass = 'outer-class';
    const customContentClass = 'inner-class';
    render(<Prices price={88.88} className={customClass} contentClass={customContentClass} />);

    const outerContainer = screen.getByText('$88.88').closest('div')?.parentElement;
    const innerContainer = screen.getByText('$88.88').closest('div');

    expect(outerContainer).toHaveClass(customClass);
    expect(innerContainer).toHaveClass(customContentClass);
    expect(screen.getByText('$88.88')).toBeInTheDocument();
  });

  test('handles decimal price correctly', () => {
    render(<Prices price={0.99} />);

    expect(screen.getByText('$0.99')).toBeInTheDocument();
  });

  test('handles integer price correctly', () => {
    render(<Prices price={42} />);

    expect(screen.getByText('$42.00')).toBeInTheDocument();
  });
});
