import { render, screen } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '../../../uix/components/ui/switch';

describe('Switch', () => {
  it('renders correctly', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('can be toggled on and off', async () => {
    const user = userEvent.setup();
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();

    await user.click(switchElement);
    expect(switchElement).toBeChecked();

    await user.click(switchElement);
    expect(switchElement).not.toBeChecked();
  });

  it('handles onChange callback', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch onChange={handleChange} />);
    const switchElement = screen.getByRole('switch');

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    expect(handleChange.mock.calls[0][0].target.checked).toBe(true);

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Object));
    expect(handleChange.mock.calls[1][0].target.checked).toBe(false);
  });

  it('can be controlled', () => {
    const handleChange = vi.fn();
    const { rerender } = render(<Switch checked={false} onChange={handleChange} />);

    expect(screen.getByRole('switch')).not.toBeChecked();

    rerender(<Switch checked={true} onChange={handleChange} />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('can be disabled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch disabled onChange={handleChange} />);
    const switchElement = screen.getByRole('switch');

    expect(switchElement).toBeDisabled();

    await user.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Switch className="custom-switch" />);
    const switchWrapper = screen.getByRole('switch').closest('.custom-switch');
    expect(switchWrapper).toBeInTheDocument();
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Switch />);

    const switchElement = screen.getByRole('switch');

    // Focus the switch
    await user.tab();
    expect(switchElement).toHaveFocus();

    // Toggle with space key
    await user.keyboard(' ');
    expect(switchElement).toBeChecked();

    await user.keyboard(' ');
    expect(switchElement).not.toBeChecked();
  });

  it('renders with required attribute', () => {
    render(<Switch required />);
    expect(screen.getByRole('switch')).toBeRequired();
  });

  it('renders with name attribute', () => {
    render(<Switch name="notifications" />);
    expect(screen.getByRole('switch')).toHaveAttribute('name', 'notifications');
  });

  it('renders with value attribute', () => {
    render(<Switch value="on" />);
    expect(screen.getByRole('switch')).toHaveAttribute('value', 'on');
  });

  it('renders with label', () => {
    render(<Switch label="Enable notifications" />);
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(<Switch description="Receive email notifications" />);
    expect(screen.getByText('Receive email notifications')).toBeInTheDocument();
  });

  it('can have default checked state', () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Switch size="xs" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(<Switch size="sm" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(<Switch size="md" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(<Switch size="lg" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(<Switch size="xl" />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });
});
