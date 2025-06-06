import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { Divider } from '../../../mantine-ciseco/components/Divider';

describe('Divider', () => {
  it('renders horizontal divider by default', () => {
    const { container } = render(<Divider />);
    const divider = container.querySelector('hr');
    expect(divider).toBeInTheDocument();
    expect(divider).toHaveAttribute('role', 'presentation');
  });

  it('renders with soft variant', () => {
    const { container } = render(<Divider soft />);
    const divider = container.querySelector('hr');
    expect(divider).toHaveClass('border-neutral-950/5', 'dark:border-white/5');
  });

  it('renders with default variant', () => {
    const { container } = render(<Divider />);
    const divider = container.querySelector('hr');
    expect(divider).toHaveClass('border-neutral-950/10', 'dark:border-white/10');
  });

  it('renders with custom className', () => {
    const { container } = render(<Divider className="custom-divider" />);
    const divider = container.querySelector('hr');
    expect(divider).toHaveClass('custom-divider');
  });

  it('forwards additional props to hr element', () => {
    const { container } = render(
      <Divider data-testid="test-divider" aria-label="Section divider" />,
    );
    const divider = container.querySelector('hr');
    expect(divider).toHaveAttribute('data-testid', 'test-divider');
    expect(divider).toHaveAttribute('aria-label', 'Section divider');
  });
});
