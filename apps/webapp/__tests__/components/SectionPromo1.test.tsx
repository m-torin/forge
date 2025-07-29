import SectionPromo1 from '@/components/SectionPromo1';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the Logo component
vi.mock('@/components/Logo', () => ({
  default: ({ className }: { className?: string }) => (
    <div data-testid="logo" className={className}>
      Logo
    </div>
  ),
}));

// Mock the ButtonPrimary component
vi.mock('@/shared/Button/ButtonPrimary', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="button-primary">
      {children}
    </a>
  ),
}));

// Mock the ButtonSecondary component
vi.mock('@/shared/Button/ButtonSecondary', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} data-testid="button-secondary" className={className}>
      {children}
    </a>
  ),
}));

// Mock the NcImage component
vi.mock('@/shared/NcImage/NcImage', () => ({
  default: ({ src, alt, containerClassName, sizes, className }: any) => (
    <div data-testid="nc-image" className={containerClassName}>
      {}
      <img src={src} alt={alt} sizes={sizes} className={className} />
    </div>
  ),
}));

// Mock the image imports
vi.mock('@/images/promo1.png', () => ({
  default: '/mocked-promo1.png',
}));

vi.mock('@/images/promo1-dark.png', () => ({
  default: '/mocked-promo1-dark.png',
}));

describe('sectionPromo1 Component', () => {
  test('renders the component with default props', () => {
    render(<SectionPromo1 />);

    // Check main container
    const mainContainer = screen.getByTestId('section-promo1');
    expect(mainContainer).toHaveClass(
      'relative',
      'flex',
      'flex-col',
      'items-center',
      'lg:flex-row',
    );
  });

  test('renders with custom className', () => {
    const customClass = 'custom-promo-class';
    render(<SectionPromo1 className={customClass} />);

    const mainContainer = screen.getByTestId('section-promo1');
    expect(mainContainer).toHaveClass(customClass);
  });

  test('renders Logo component', () => {
    render(<SectionPromo1 />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('w-28');
  });

  test('renders main heading', () => {
    render(<SectionPromo1 />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Earn free money');
    expect(heading).toHaveTextContent('with Webapp.');
  });

  test('renders description text', () => {
    render(<SectionPromo1 />);

    const description = screen.getByText('With Webapp you will get freeship & savings combo.');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('mt-6', 'block', 'text-neutral-500', 'dark:text-neutral-400');
  });

  test('renders primary button', () => {
    render(<SectionPromo1 />);

    const primaryButton = screen.getByTestId('button-primary');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', '/collection');
    expect(primaryButton).toHaveTextContent('Savings combo');
  });

  test('renders secondary button', () => {
    render(<SectionPromo1 />);

    const secondaryButton = screen.getByTestId('button-secondary');
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveAttribute('href', '/search');
    expect(secondaryButton).toHaveTextContent('Discover more');
    expect(secondaryButton).toHaveClass('border', 'border-neutral-100', 'dark:border-neutral-700');
  });

  test('renders both images with correct classes', () => {
    render(<SectionPromo1 />);

    const images = screen.getAllByTestId('nc-image');
    expect(images).toHaveLength(2);

    // Check light mode image
    expect(images[0]).toHaveClass('block', 'dark:hidden');

    // Check dark mode image
    expect(images[1]).toHaveClass('hidden', 'dark:block');
  });

  test('renders images with correct sources', () => {
    render(<SectionPromo1 />);

    // Images have empty alt="" so they have role="presentation", not "img"
    const images = screen.getAllByRole('presentation');
    expect(images).toHaveLength(2);

    expect(images[0]).toHaveAttribute('src', '/mocked-promo1.png');
    expect(images[1]).toHaveAttribute('src', '/mocked-promo1-dark.png');
  });

  test('renders images with correct sizes attribute', () => {
    render(<SectionPromo1 />);

    const images = screen.getAllByRole('presentation');
    expect(images[0]).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
    expect(images[1]).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  test('has correct responsive layout classes', () => {
    render(<SectionPromo1 />);

    const mainContainer = screen.getByTestId('section-promo1');
    expect(mainContainer).toHaveClass('lg:flex-row');

    // Check left content area
    const leftContent = mainContainer.querySelector('div.relative.mb-16');
    expect(leftContent).toHaveClass('lg:w-2/5', 'lg:mr-10', 'lg:mb-0');

    // Check right image area
    const rightContent = mainContainer.querySelector('div.relative.max-w-xl');
    expect(rightContent).toHaveClass('lg:max-w-none');
  });

  test('button container has correct spacing classes', () => {
    render(<SectionPromo1 />);

    const buttonContainer = screen.getByTestId('button-primary').closest('div');
    expect(buttonContainer).toHaveClass(
      'mt-6',
      'flex',
      'flex-wrap',
      'gap-2',
      'sm:mt-12',
      'sm:gap-x-5',
    );
  });

  test('renders without className prop', () => {
    render(<SectionPromo1 />);

    const mainContainer = screen.getByTestId('section-promo1');
    expect(mainContainer).toHaveClass(
      'relative',
      'flex',
      'flex-col',
      'items-center',
      'lg:flex-row',
    );
    // Should not have any custom classes
    expect(mainContainer).not.toHaveClass('custom');
  });
});
