import { render, screen } from '../../../test-utils';
import { describe, expect, it } from 'vitest';
import { Badge } from '../../../uix/components/ui/badge';

describe('Badge', () => {
  it('renders correctly', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Badge variant="filled">Filled</Badge>);
    expect(screen.getByText('Filled')).toBeInTheDocument();

    rerender(<Badge variant="light">Light</Badge>);
    expect(screen.getByText('Light')).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toBeInTheDocument();

    rerender(<Badge variant="dot">Dot</Badge>);
    expect(screen.getByText('Dot')).toBeInTheDocument();

    rerender(<Badge variant="gradient">Gradient</Badge>);
    expect(screen.getByText('Gradient')).toBeInTheDocument();
  });

  it('applies different colors', () => {
    const { rerender } = render(<Badge color="blue">Blue</Badge>);
    expect(screen.getByText('Blue')).toBeInTheDocument();

    rerender(<Badge color="red">Red</Badge>);
    expect(screen.getByText('Red')).toBeInTheDocument();

    rerender(<Badge color="green">Green</Badge>);
    expect(screen.getByText('Green')).toBeInTheDocument();

    rerender(<Badge color="yellow">Yellow</Badge>);
    expect(screen.getByText('Yellow')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    const badgeElement = screen.getByText('Badge').parentElement;
    expect(badgeElement).toHaveClass('custom-class');
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Badge size="xs">Extra Small</Badge>);
    expect(screen.getByText('Extra Small')).toBeInTheDocument();

    rerender(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toBeInTheDocument();

    rerender(<Badge size="xl">Extra Large</Badge>);
    expect(screen.getByText('Extra Large')).toBeInTheDocument();
  });

  it('supports different radius options', () => {
    const { rerender } = render(<Badge radius="xs">Extra Small Radius</Badge>);
    expect(screen.getByText('Extra Small Radius')).toBeInTheDocument();

    rerender(<Badge radius="sm">Small Radius</Badge>);
    expect(screen.getByText('Small Radius')).toBeInTheDocument();

    rerender(<Badge radius="md">Medium Radius</Badge>);
    expect(screen.getByText('Medium Radius')).toBeInTheDocument();

    rerender(<Badge radius="lg">Large Radius</Badge>);
    expect(screen.getByText('Large Radius')).toBeInTheDocument();

    rerender(<Badge radius="xl">Extra Large Radius</Badge>);
    expect(screen.getByText('Extra Large Radius')).toBeInTheDocument();
  });

  it('can render as different component', () => {
    render(
      <Badge component="a" href="#">
        Link Badge
      </Badge>,
    );

    const linkElement = screen.getByText('Link Badge').parentElement;
    expect(linkElement?.tagName.toLowerCase()).toBe('a');
    expect(linkElement).toHaveAttribute('href', '#');
  });

  it('supports gradient variant with gradientFrom and gradientTo', () => {
    render(
      <Badge variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
        Gradient Badge
      </Badge>,
    );

    expect(screen.getByText('Gradient Badge')).toBeInTheDocument();
  });

  it('supports fullWidth prop', () => {
    render(<Badge fullWidth>Full Width Badge</Badge>);
    expect(screen.getByText('Full Width Badge')).toBeInTheDocument();
  });

  it('can have left and right sections', () => {
    render(
      <Badge leftSection={<span>←</span>} rightSection={<span>→</span>}>
        Badge with Sections
      </Badge>,
    );

    expect(screen.getByText('Badge with Sections')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });
});
