import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

// Simple Button component for testing
const Button = ({
  onClick,
  children,
  disabled = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button onClick={onClick} disabled={disabled} data-testid="button">
    {children}
  </button>
);

describe('button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click me');
  });

  test('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByTestId('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
  });

  test('does not fire click when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>,
    );

    const button = screen.getByTestId('button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
