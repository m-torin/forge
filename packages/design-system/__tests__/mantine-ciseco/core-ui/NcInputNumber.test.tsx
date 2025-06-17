import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import NcInputNumber from '../../../mantine-ciseco/components/NcInputNumber';

describe('NcInputNumber', (_: any) => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default value', (_: any) => {
    render(<NcInputNumber />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders with label', (_: any) => {
    render(<NcInputNumber label="Quantity" />);
    expect(screen.getByText('Quantity')).toBeInTheDocument();
  });

  it('renders with description', (_: any) => {
    render(<NcInputNumber label="Quantity" desc="How many items?" />);
    expect(screen.getByText('How many items?')).toBeInTheDocument();
  });

  it('handles increment and decrement', (_: any) => {
    render(<NcInputNumber defaultValue={5} min={1} max={10} onChange={mockOnChange} />);
    const incrementButton = screen.getAllByRole('button')[1];
    const decrementButton = screen.getAllByRole('button')[0];

    fireEvent.click(incrementButton);
    expect(mockOnChange).toHaveBeenCalledWith(6);
    fireEvent.click(decrementButton);
    expect(mockOnChange).toHaveBeenCalledWith(5);
  });

  it('does not decrement below min', (_: any) => {
    render(<NcInputNumber defaultValue={1} min={1} onChange={mockOnChange} />);
    const decrementButton = screen.getAllByRole('button')[0];
    expect(decrementButton).toBeDisabled();
    fireEvent.click(decrementButton);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('does not increment above max', (_: any) => {
    render(<NcInputNumber defaultValue={10} max={10} onChange={mockOnChange} />);
    const incrementButton = screen.getAllByRole('button')[1];
    expect(incrementButton).toBeDisabled();
    fireEvent.click(incrementButton);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('renders with custom className', (_: any) => {
    render(<NcInputNumber className="custom-input-number" />);
    const container = screen.getByText('1').parentElement?.parentElement;
    expect(container).toHaveClass('custom-input-number');
  });

  it('updates value when defaultValue changes', (_: any) => {
    const { rerender } = render(<NcInputNumber defaultValue={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<NcInputNumber defaultValue={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
