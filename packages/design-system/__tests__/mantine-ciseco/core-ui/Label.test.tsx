import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import Label from '../../../mantine-ciseco/components/Label/Label';

describe('Label', () => {
  it('renders label with text', () => {
    render(<Label>Test Label</Label>);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<Label className="custom-label">Custom</Label>);
    expect(screen.getByText('Custom')).toHaveClass('custom-label');
  });

  it('renders with data-nc-id attribute', () => {
    render(<Label>Test</Label>);
    expect(screen.getByText('Test')).toHaveAttribute('data-nc-id', 'Label');
  });
});
