import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Label from '../../../mantine-ciseco/components/Label/Label';

describe('Label', (_: any) => {
  it('renders label with text', (_: any) => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with htmlFor attribute', (_: any) => {
    render(
      <Label htmlFor="test-input" data-testid="test-label">
        Label for input
      </Label>,
    );
    const label = screen.getByTestId('test-label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders with required indicator', (_: any) => {
    render(<Label required>Required Field</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('required-indicator');
  });

  it('renders with different sizes', (_: any) => {
    const { rerender } = render(
      <Label size="xs" data-testid="label">
        XS Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-xs');

    rerender(
      <Label size="sm" data-testid="label">
        SM Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-sm');

    rerender(
      <Label size="sm" data-testid="label">
        MD Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-base');

    rerender(
      <Label size="lg" data-testid="label">
        LG Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-lg');
  });

  it('renders with custom className', (_: any) => {
    render(
      <Label className="custom-label" data-testid="label">
        Custom
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('custom-label');
  });

  it('renders with error state', (_: any) => {
    render(
      <Label error data-testid="label">
        Error Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-red-600');
  });

  it('renders with disabled state', (_: any) => {
    render(
      <Label disabled data-testid="label">
        Disabled Label
      </Label>,
    );
    expect(screen.getByTestId('label')).toHaveClass('text-gray-400');
  });

  it('supports dark mode styling', (_: any) => {
    render(<Label data-testid="label">Dark Mode Label</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-neutral-900', 'dark:text-neutral-200');
  });

  it('has proper accessibility attributes', (_: any) => {
    render(
      <Label htmlFor="test-field" required data-testid="test-label">
        Accessible Label
      </Label>,
    );

    const label = screen.getByTestId('test-label');
    expect(label).toHaveAttribute('for', 'test-field');
  });
});
