import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test-utils';
import Home from '@/app/page';
import { ColorSchemesSwitcher } from '@/components/color-schemes-switcher';

// Mock Mantine components as needed
vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...(actual as any),
  };
});

// Mock the next/image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="next-image"
    />
  ),
}));

// Mock the ColorSchemesSwitcher component
vi.mock('@/components/color-schemes-switcher', () => ({
  ColorSchemesSwitcher: vi.fn(() => (
    <div data-testid="color-schemes-switcher">Color Schemes Switcher</div>
  )),
}));

describe.skip('Home Page', () => {
  it('renders the welcome message', () => {
    render(<Home />);

    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getByText('Mantine')).toBeInTheDocument();
    expect(screen.getByText('TailwindCSS')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Home />);

    expect(
      screen.getByText(
        /This starter Next.js project includes a minimal setup/i,
      ),
    ).toBeInTheDocument();
  });

  it('renders the Next.js logo', () => {
    render(<Home />);

    const logo = screen.getByTestId('next-image');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://nextjs.org/icons/next.svg');
    expect(logo).toHaveAttribute('alt', 'logo');
  });

  it('renders the ColorSchemesSwitcher component', () => {
    render(<Home />);

    expect(ColorSchemesSwitcher).toHaveBeenCalled();
    expect(screen.getByTestId('color-schemes-switcher')).toBeInTheDocument();
  });

  it('renders the AppShell component with correct structure', () => {
    const { container } = render(<Home />);

    // Check for AppShell structure
    // We can't directly test for the AppShell component, but we can check for its structure
    const appShell = container.firstChild;
    expect(appShell).toBeInTheDocument();

    // Check for header
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // Check for main content
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
  });

  it('renders the title with gradient text', () => {
    render(<Home />);

    // Check for gradient text spans
    const mantineText = screen.getByText('Mantine');
    expect(mantineText).toBeInTheDocument();
    expect(mantineText.tagName).toBe('SPAN');

    const tailwindText = screen.getByText('TailwindCSS');
    expect(tailwindText).toBeInTheDocument();
    expect(tailwindText.tagName).toBe('SPAN');

    // Check that they have gradient classes or props
    // Since we're using Mantine's variant="gradient", we can check for the component prop
    expect(mantineText).toHaveAttribute('component', 'span');
    expect(tailwindText).toHaveAttribute('component', 'span');
  });

  it('renders the ColorSchemesSwitcher in a centered container', () => {
    const { container } = render(<Home />);

    const colorSchemesContainer = screen.getByTestId(
      'color-schemes-switcher',
    ).parentElement;
    expect(colorSchemesContainer).toBeInTheDocument();
    expect(colorSchemesContainer).toHaveClass('flex');
    expect(colorSchemesContainer).toHaveClass('justify-center');
  });
});
