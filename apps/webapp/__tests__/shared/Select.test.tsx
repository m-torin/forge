import { Select } from '@/shared/select';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock Headless UI Select
vi.mock('@headlessui/react', () => ({
  Select: ({ children, value, onChange, multiple, ...props }: any) => (
    <select
      data-testid="headless-select"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      multiple={multiple}
      {...props}
    >
      {children}
    </select>
  ),
}));

describe('select', () => {
  test('should render select component', () => {
    render(
      <Select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toBeInTheDocument();
  });

  test('should render select button', () => {
    render(
      <Select>
        <option value="">Choose option</option>
        <option value="option1">Option 1</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toBeInTheDocument();
  });

  test('should display placeholder text', () => {
    render(
      <Select>
        <option value="">Choose an option</option>
        <option value="option1">Option 1</option>
      </Select>,
    );

    const placeholder = screen.getByText('Choose an option');
    expect(placeholder).toBeInTheDocument();
  });

  test('should handle option selection', () => {
    const onChange = vi.fn();
    render(
      <Select onChange={onChange}>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    fireEvent.change(select, { target: { value: 'option1' } });

    expect(onChange).toHaveBeenCalledWith('option1');
  });

  test('should display selected value', () => {
    render(
      <Select value="option2">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toHaveValue('option2');
  });

  test('should render options when open', () => {
    render(
      <Select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>,
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
  });

  test('should apply custom className', () => {
    const { container } = render(
      <Select className="custom-select">
        <option value="option1">Option 1</option>
      </Select>,
    );

    const wrapper = container.querySelector('[data-slot="control"]');
    expect(wrapper).toHaveClass('custom-select');
  });

  test('should be disabled when disabled prop is true', () => {
    render(
      <Select disabled>
        <option value="option1">Option 1</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toBeDisabled();
  });

  test('should handle required attribute', () => {
    render(
      <Select required>
        <option value="option1">Option 1</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toBeRequired();
  });

  test('should render with custom option component', () => {
    render(
      <Select>
        <option value="custom1">Custom Option 1</option>
        <option value="custom2">Custom Option 2</option>
      </Select>,
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
  });

  test('should handle keyboard navigation', () => {
    render(
      <Select>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    select.focus();

    expect(select).toHaveFocus();

    fireEvent.keyDown(select, { key: 'ArrowDown' });
    fireEvent.keyDown(select, { key: 'Enter' });

    // Should handle keyboard events without crashing
    expect(select).toBeInTheDocument();
  });

  test('should be accessible with proper ARIA attributes', () => {
    render(
      <Select aria-label="Select an option">
        <option value="option1">Option 1</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toHaveAttribute('aria-label', 'Select an option');
  });

  test('should render different select sizes', () => {
    render(
      <Select className="large">
        <option value="option1">Option 1</option>
      </Select>,
    );

    const wrapper = screen.getByTestId('headless-select').closest('[data-slot="control"]');
    expect(wrapper).toHaveClass('large');
  });

  test('should handle multiple selection', () => {
    render(
      <Select multiple>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </Select>,
    );

    const select = screen.getByTestId('headless-select');
    expect(select).toHaveAttribute('multiple');
  });

  test('should render without errors', () => {
    expect(() => {
      render(
        <Select>
          <option value="option1">Option 1</option>
        </Select>,
      );
    }).not.toThrow();
  });
});
