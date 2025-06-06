import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Prices from '../../../mantine-ciseco/components/Prices';

describe('Prices', () => {
  it('renders price correctly', () => {
    render(<Prices price={99.99} />);
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Prices price={99.99} className="custom-price" />);
    const container = screen.getByText('$99.99').parentElement?.parentElement;
    expect(container).toHaveClass('custom-price');
  });

  it('renders with custom contentClass', () => {
    render(<Prices price={99.99} contentClass="my-content-class" />);
    const content = screen.getByText('$99.99').parentElement;
    expect(content).toHaveClass('my-content-class');
  });

  it('renders with default contentClass', () => {
    render(<Prices price={99.99} />);
    const content = screen.getByText('$99.99').parentElement;
    expect(content).toHaveClass('py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium');
  });
});
