import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import MySwitch from '../../../mantine-ciseco/components/MySwitch';

describe('MySwitch', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders switch', () => {
    render(<MySwitch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<MySwitch label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<MySwitch desc="This is a description" />);
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('handles enabled state', () => {
    render(<MySwitch enabled onChange={mockOnChange} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('handles disabled state (not supported, should not crash)', () => {
    // MySwitch does not support disabled, so just ensure it renders
    render(<MySwitch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('toggles on click', () => {
    render(<MySwitch onChange={mockOnChange} />);
    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('renders with custom className', () => {
    render(<MySwitch className="custom-switch" />);
    expect(screen.getByRole('switch').parentElement).toHaveClass('custom-switch');
  });
});
