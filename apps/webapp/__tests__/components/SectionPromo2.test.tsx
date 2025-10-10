import SectionPromo2 from '@/components/SectionPromo2';
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

// Mock the Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className, sizes }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="next-image"
      data-fill={fill}
      sizes={sizes}
    />
  ),
}));

// Mock the image imports
vi.mock('@/images/Moon.svg', () => ({
  default: '/mocked-moon.svg',
}));

vi.mock('@/images/promo2.png', () => ({
  default: '/mocked-promo2.png',
}));

describe('sectionPromo2 Component', () => {
  test('renders the component with default props', () => {
    render(<SectionPromo2 />);

    // The outermost container
    const containers = screen.getAllByRole('generic');
    // The main content container is likely the second one
    const mainContainer = containers.find(
      div => div.className.includes('relative') && div.className.includes('flex'),
    );
    expect(mainContainer).toBeTruthy();
    expect(mainContainer).toHaveClass(
      'relative',
      'flex',
      'flex-col',
      'rounded-2xl',
      'bg-yellow-50',
    );
  });

  test('renders with custom className prop', () => {
    const customClass = 'custom-section';
    render(<SectionPromo2 className={customClass} />);
    const outerContainer = screen.getByTestId('section-promo2');
    expect(outerContainer).toHaveClass(customClass);
  });

  test('renders main content container with correct classes', () => {
    render(<SectionPromo2 />);

    // The outer div has xl:pt-10 2xl:pt-24, the inner div has all the promo styles
    const outerContainer = screen.getByTestId('section-promo2');
    const contentContainer = outerContainer.firstElementChild as HTMLElement;
    expect(contentContainer).toHaveClass(
      'relative',
      'flex',
      'flex-col',
      'rounded-2xl',
      'bg-yellow-50',
      'p-4',
      'pb-0',
      'sm:rounded-[40px]',
      'sm:p-5',
      'sm:pb-0',
      'lg:flex-row',
      'lg:justify-end',
      'lg:p-14',
      'xl:px-20',
      'xl:py-24',
      '2xl:py-32',
      'dark:bg-neutral-800',
    );
  });

  test('renders background image', () => {
    render(<SectionPromo2 />);

    const backgroundImage = screen.getAllByTestId('next-image')[0];
    expect(backgroundImage).toBeInTheDocument();
    expect(backgroundImage).toHaveClass('object-contain', 'dark:opacity-5');

    // Since our mock renders img directly, backgroundImage IS the img element
    expect(backgroundImage).toHaveAttribute('src', '/mocked-moon.svg');
    expect(backgroundImage).toHaveAttribute('alt', 'backgroundLineSvg');
    expect(backgroundImage).toHaveAttribute('data-fill', 'true');
  });

  test('renders Logo component', () => {
    render(<SectionPromo2 />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('w-28');
  });

  test('renders main heading', () => {
    render(<SectionPromo2 />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Special offer');
    expect(heading).toHaveTextContent('in kids products');
  });

  test('renders description text', () => {
    render(<SectionPromo2 />);

    const description = screen.getByText(
      'Fashion is a form of self-expression and autonomy at a particular period and place.',
    );
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('mt-6', 'block', 'text-neutral-500', 'dark:text-neutral-400');
  });

  test('renders primary button', () => {
    render(<SectionPromo2 />);

    const primaryButton = screen.getByTestId('button-primary');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveAttribute('href', '/search');
    expect(primaryButton).toHaveTextContent('Discover more');
  });

  test('renders main product image', () => {
    render(<SectionPromo2 />);

    const images = screen.getAllByTestId('next-image');
    expect(images).toHaveLength(2); // background + main image

    const mainImage = images[1];
    expect(mainImage).toBeInTheDocument();

    // Since our mock renders img directly, mainImage IS the img element
    expect(mainImage).toHaveAttribute('src', '/mocked-promo2.png');
    expect(mainImage).toHaveAttribute('alt', 'section promo 2');
    expect(mainImage).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  test('has correct responsive layout classes', () => {
    render(<SectionPromo2 />);
    const containers = screen.getAllByRole('generic');
    const mainContainer = containers.find(
      div => div.className.includes('relative') && div.className.includes('flex'),
    );
    expect(mainContainer).toBeTruthy();
    expect(mainContainer).toHaveClass('lg:flex-row', 'lg:justify-end');

    // Check text content area
    const textArea = screen.getByRole('heading', { level: 2 }).closest('div');
    expect(textArea).toHaveClass('lg:w-[45%]');

    // Check image area
    const imageArea = screen.getAllByTestId('next-image')[1].closest('div');
    expect(imageArea).toHaveClass(
      'lg:absolute',
      'lg:bottom-0',
      'lg:left-0',
      'lg:max-w-[calc(55%-40px)]',
    );
  });

  test('button container has correct spacing classes', () => {
    render(<SectionPromo2 />);

    const buttonContainer = screen.getByTestId('button-primary').closest('div');
    expect(buttonContainer).toHaveClass('mt-6', 'flex', 'space-x-2', 'sm:mt-12', 'sm:space-x-5');
  });

  test('image container has correct responsive classes', () => {
    render(<SectionPromo2 />);

    const images = screen.getAllByTestId('next-image');
    const mainImageContainer = images[1].closest('div');
    expect(mainImageContainer).toHaveClass(
      'relative',
      'mt-10',
      'block',
      'max-w-xl',
      'lg:absolute',
      'lg:bottom-0',
      'lg:left-0',
      'lg:mt-0',
      'lg:max-w-[calc(55%-40px)]',
    );
  });

  test('background image container has correct positioning', () => {
    render(<SectionPromo2 />);

    const images = screen.getAllByTestId('next-image');
    const backgroundContainer = images[0].closest('div');
    expect(backgroundContainer).toHaveClass('absolute', 'inset-5');
  });

  test('renders without className prop', () => {
    render(<SectionPromo2 />);
    const containers = screen.getAllByRole('generic');
    const mainContainer = containers.find(
      div => div.className.includes('relative') && div.className.includes('flex'),
    );
    expect(mainContainer).toBeTruthy();
    // Should not have any custom classes
  });

  test('has correct dark mode support', () => {
    render(<SectionPromo2 />);

    const images = screen.getAllByTestId('next-image');
    const backgroundImage = images[0]; // First image is the background
    const contentContainer = backgroundImage.closest('div[class*="relative flex flex-col"]');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer).toHaveClass('dark:bg-neutral-800');

    const description = screen.getByText(
      'Fashion is a form of self-expression and autonomy at a particular period and place.',
    );
    expect(description).toHaveClass('dark:text-neutral-400');

    expect(backgroundImage).toHaveClass('dark:opacity-5');
  });
});
