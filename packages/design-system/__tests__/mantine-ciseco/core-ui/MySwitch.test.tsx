import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import MySwitch from '../../../mantine-ciseco/components/MySwitch';

describe('MySwitch', (_: any) => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders switch', (_: any) => {
    render(<MySwitch />);
    expect(screen.getByTestId('switch-toggle')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders with label', (_: any) => {
    render(<MySwitch label="Enable notifications" />);
    expect(screen.getByTestId('switch-label')).toHaveTextContent('Enable notifications');
  });

  it('renders with description', (_: any) => {
    render(<MySwitch desc="This is a description" />);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('handles enabled state', (_: any) => {
    render(<MySwitch enabled onChange={mockOnChange} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-checked');
  });

  it('handles disabled state (not supported, should not crash)', () => {
    // MySwitch does not support disabled, so just ensure it renders
    render(<MySwitch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('toggles on click', (_: any) => {
    render(<MySwitch onChange={mockOnChange} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('renders with custom className', (_: any) => {
    render(<MySwitch className="custom-switch" />);
    const container = screen.getByTestId('switch-toggle');
    expect(container).toHaveClass('custom-switch');
  });
});
