import { Input } from '@/shared/input';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, vi } from 'vitest';

describe('input', () => {
  test('should render input field', () => {
    render(<Input placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  test('should handle text input', () => {
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    fireEvent.change(input, { target: { value: 'test value' } });

    expect(input).toHaveValue('test value');
  });

  test('should apply custom className', () => {
    const { container } = render(<Input className="custom-input" placeholder="Test" />);

    // The className is applied to the wrapper span with data-slot="control"
    const wrapper = container.querySelector('[data-slot="control"]');
    expect(wrapper).toHaveClass('custom-input');
  });

  test('should handle disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);

    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  test('should handle different input types', () => {
    render(<Input type="email" placeholder="Email" />);

    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  test('should handle required attribute', () => {
    render(<Input required placeholder="Required field" />);

    const input = screen.getByPlaceholderText('Required field');
    expect(input).toBeRequired();
  });

  test('should handle readOnly state', () => {
    render(<Input readOnly value="Read only" />);

    const input = screen.getByDisplayValue('Read only');
    expect(input).toHaveAttribute('readOnly');
  });

  test('should handle focus and blur events', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(<Input onFocus={onFocus} onBlur={onBlur} placeholder="Focus test" />);

    const input = screen.getByPlaceholderText('Focus test');
    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  test('should handle onChange events', () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} placeholder="Change test" />);

    const input = screen.getByPlaceholderText('Change test');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('should render with label', () => {
    render(
      <div>
        <label htmlFor="test-input">Test Label</label>
        <Input id="test-input" placeholder="Labeled input" />
      </div>,
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByPlaceholderText('Labeled input');

    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-input');
  });

  test('should handle maxLength attribute', () => {
    render(<Input maxLength={10} placeholder="Max 10 chars" />);

    const input = screen.getByPlaceholderText('Max 10 chars');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  test('should handle minLength attribute', () => {
    render(<Input minLength={3} placeholder="Min 3 chars" />);

    const input = screen.getByPlaceholderText('Min 3 chars');
    expect(input).toHaveAttribute('minLength', '3');
  });

  test('should pass through additional props', () => {
    render(<Input data-testid="custom-input" aria-label="Custom input" placeholder="Props test" />);

    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('aria-label', 'Custom input');
  });

  test('should render without errors', () => {
    expect(() => {
      render(<Input placeholder="Error test" />);
    }).not.toThrow();
  });
});
