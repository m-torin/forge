import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../test-utils';
import Input from '../../../src/mantine-ciseco/components/shared/Input/Input';

describe('Input', (_: any) => {
  it('renders input with default props', (_: any) => {
    render(<Input />);
    const input = screen.getByTestId('input-field');
    expect(input).toHaveClass('text-sm', 'font-normal', 'rounded-full', 'h-11', 'px-4', 'py-3');
  });

  it('renders with custom className', (_: any) => {
    render(<Input className="custom-input" />);
    expect(screen.getByTestId('input-field')).toHaveClass('custom-input');
  });

  it('renders with custom font class', (_: any) => {
    render(<Input fontClass="text-lg font-bold" />);
    expect(screen.getByTestId('input-field')).toHaveClass('text-lg', 'font-bold');
  });

  it('renders with custom rounded class', (_: any) => {
    render(<Input rounded="rounded-lg" />);
    expect(screen.getByTestId('input-field')).toHaveClass('rounded-lg');
  });

  it('renders with custom size class', (_: any) => {
    render(<Input sizeClass="h-14 px-6 py-4" />);
    expect(screen.getByTestId('input-field')).toHaveClass('h-14', 'px-6', 'py-4');
  });

  it('handles user input', (_: any) => {
    render(<Input />);
    const input = screen.getByTestId('input-field');
    fireEvent.change(input, { target: { value: 'test input' } });
    expect(input).toHaveValue('test input');
  });

  it('renders with different input types', (_: any) => {
    const { rerender, container } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    const passwordInput = container.querySelector('input[type="password"]');
    expect(passwordInput).toHaveAttribute('type', 'password');

    rerender(<Input type="number" />);
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
  });

  it('handles disabled state', (_: any) => {
    render(<Input disabled />);
    const input = screen.getByTestId('input-field');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled: bg-neutral-200', 'dark:disabled:bg-neutral-800');
  });

  it('forwards ref to input element', (_: any) => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('forwards additional HTML attributes', (_: any) => {
    render(
      <Input
        id="test-input"
        name="test"
        placeholder="Enter text"
        required
        aria-label="Test input"
        data-testid="test-input"
      />,
    );
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'test');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-label', 'Test input');
  });
});
