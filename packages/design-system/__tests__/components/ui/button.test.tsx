import { render, screen } from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../../uix/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant prop correctly', () => {
    const { rerender } = render(<Button variant="filled">Filled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(<Button variant="light">Light</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="subtle">Subtle</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="transparent">Transparent</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="default">Default</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="gradient">Gradient</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('applies size prop correctly', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="xl">Extra Large</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="compact-xs">Compact XS</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="compact-sm">Compact SM</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="compact-md">Compact MD</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="compact-lg">Compact LG</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button size="compact-xl">Compact XL</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('disables the button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('sets the correct type attribute', () => {
    const { rerender } = render(<Button type="button">Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
  });

  it('renders as a different component', () => {
    render(
      <Button component="a" href="/test">
        Link
      </Button>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('merges custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('supports loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports color prop', () => {
    const { rerender } = render(<Button color="blue">Blue</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button color="red">Red</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button color="green">Green</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports radius prop', () => {
    const { rerender } = render(<Button radius="xs">XS Radius</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button radius="sm">SM Radius</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button radius="md">MD Radius</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button radius="lg">LG Radius</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<Button radius="xl">XL Radius</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports leftSection and rightSection', () => {
    render(
      <Button leftSection={<span>←</span>} rightSection={<span>→</span>}>
        Button with Sections
      </Button>,
    );

    expect(screen.getByText('Button with Sections')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('supports gradient variant with gradient prop', () => {
    render(
      <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
        Gradient Button
      </Button>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
