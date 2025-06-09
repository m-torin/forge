import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Label } from '../../../mantine-ciseco';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="test-input">Label for input</Label>);
    const label = screen.getByText('Label for input');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('renders with required indicator', () => {
    render(<Label required>Required Field</Label>);
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('required-indicator');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Label size="xs">XS Label</Label>);
    expect(screen.getByText('XS Label')).toHaveClass('text-xs');

    rerender(<Label size="sm">SM Label</Label>);
    expect(screen.getByText('SM Label')).toHaveClass('text-sm');

    rerender(<Label size="md">MD Label</Label>);
    expect(screen.getByText('MD Label')).toHaveClass('text-base');

    rerender(<Label size="lg">LG Label</Label>);
    expect(screen.getByText('LG Label')).toHaveClass('text-lg');
  });

  it('renders with custom className', () => {
    render(<Label className="custom-label">Custom</Label>);
    expect(screen.getByText('Custom')).toHaveClass('custom-label');
  });

  it('renders with error state', () => {
    render(<Label error>Error Label</Label>);
    expect(screen.getByText('Error Label')).toHaveClass('text-red-600');
  });

  it('renders with disabled state', () => {
    render(<Label disabled>Disabled Label</Label>);
    expect(screen.getByText('Disabled Label')).toHaveClass('text-gray-400');
  });

  it('renders with description', () => {
    render(<Label description="This field is important">Field Label</Label>);
    expect(screen.getByText('This field is important')).toBeInTheDocument();
    expect(screen.getByText('This field is important')).toHaveClass('label-description');
  });

  it('renders with icon', () => {
    const TestIcon = () => <span data-testid="label-icon">🏷️</span>;
    render(<Label icon={<TestIcon />}>Label with Icon</Label>);
    expect(screen.getByTestId('label-icon')).toBeInTheDocument();
  });

  it('renders with tooltip', async () => {
    render(<Label tooltip="Additional information about this field">Tooltip Label</Label>);

    const label = screen.getByText('Tooltip Label');
    fireEvent.mouseEnter(label);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent(
        'Additional information about this field',
      );
    });
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();
    render(<Label onClick={mockOnClick}>Clickable Label</Label>);

    const label = screen.getByText('Clickable Label');
    fireEvent.click(label);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it('renders with weight variations', () => {
    const { rerender } = render(<Label weight="normal">Normal</Label>);
    expect(screen.getByText('Normal')).toHaveClass('font-normal');

    rerender(<Label weight="medium">Medium</Label>);
    expect(screen.getByText('Medium')).toHaveClass('font-medium');

    rerender(<Label weight="semibold">Semibold</Label>);
    expect(screen.getByText('Semibold')).toHaveClass('font-semibold');

    rerender(<Label weight="bold">Bold</Label>);
    expect(screen.getByText('Bold')).toHaveClass('font-bold');
  });

  it('supports dark mode styling', () => {
    render(<Label>Dark Mode Label</Label>);
    const label = screen.getByText('Dark Mode Label');
    expect(label).toHaveClass('text-gray-700', 'dark:text-gray-200');
  });

  it('renders with inline styling', () => {
    render(<Label inline>Inline Label</Label>);
    expect(screen.getByText('Inline Label')).toHaveClass('inline-block');
  });

  it('renders with custom color', () => {
    render(<Label color="blue">Blue Label</Label>);
    expect(screen.getByText('Blue Label')).toHaveClass('text-blue-600');
  });

  it('has proper accessibility attributes', () => {
    render(
      <Label htmlFor="test-field" required id="test-label">
        Accessible Label
      </Label>,
    );

    const label = screen.getByText('Accessible Label');
    expect(label).toHaveAttribute('for', 'test-field');
    expect(label).toHaveAttribute('id', 'test-label');
  });

  it('renders with helper text', () => {
    render(
      <Label helperText="Format: ABC123" helperIcon="ℹ️">
        Input Label
      </Label>,
    );

    expect(screen.getByText('Format: ABC123')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('handles responsive sizing', () => {
    render(<Label size={{ base: 'sm', md: 'md', lg: 'lg' }}>Responsive Label</Label>);

    const label = screen.getByText('Responsive Label');
    expect(label).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
  });

  it('renders with custom styles', () => {
    render(
      <Label
        style={{
          color: 'purple',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Styled Label
      </Label>,
    );

    const label = screen.getByText('Styled Label');
    expect(label).toHaveStyle({
      color: 'purple',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    });
  });
});
