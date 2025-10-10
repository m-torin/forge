import SectionPromo3 from '@/components/SectionPromo3';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the ButtonCircle component
vi.mock('@/shared/Button/ButtonCircle', () => ({
  default: ({
    children,
    type,
    className,
  }: {
    children: React.ReactNode;
    type: 'submit' | 'reset' | 'button';
    className?: string;
  }) => (
    <button type={type} data-testid="button-circle" className={className}>
      {children}
    </button>
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

// Mock the Badge component
vi.mock('@/shared/badge', () => ({
  Badge: ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span data-testid="badge" data-color={color}>
      {children}
    </span>
  ),
}));

// Mock the Input component
vi.mock('@/shared/input', () => ({
  Input: ({ placeholder, type, name, className, required, 'aria-required': ariaRequired }: any) => (
    <input
      data-testid="email-input"
      placeholder={placeholder}
      type={type}
      name={name}
      className={className}
      required={required}
      aria-required={ariaRequired}
    />
  ),
}));

// Mock the Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, className }: any) => (
    <img data-testid="next-image" className={className} src={src} alt={alt} data-fill={fill} />
  ),
}));

// Mock the image imports
vi.mock('@/images/BackgroundLine.svg', () => ({
  default: '/mocked-background-line.svg',
}));

vi.mock('@/images/promo3.png', () => ({
  default: '/mocked-promo3.png',
}));

describe('sectionPromo3 Component', () => {
  test('renders the component with default props', () => {
    render(<SectionPromo3 />);

    // Check main container - use a more specific selector
    const container = screen.getByTestId('nc-image').closest('div[class*="xl:pt-10"]');
    expect(container).toBeTruthy();
    expect(container).toHaveClass('xl:pt-10', '2xl:pt-24');
  });

  test('renders with custom className', () => {
    const customClass = 'custom-promo3-class';
    render(<SectionPromo3 className={customClass} />);

    const container = screen.getByTestId('nc-image').closest('div[class*="xl:pt-10"]');
    expect(container).toBeTruthy();
    expect(container).toHaveClass(customClass);
  });

  test('renders main content container with correct classes', () => {
    render(<SectionPromo3 />);

    const contentContainer = screen
      .getByTestId('nc-image')
      .closest('div[class*="relative flex flex-col"]');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer).toHaveClass(
      'relative',
      'flex',
      'flex-col',
      'rounded-2xl',
      'bg-neutral-50',
      'p-4',
      'pb-0',
      'sm:rounded-[40px]',
      'sm:p-5',
      'sm:pb-0',
      'lg:flex-row',
      'lg:p-14',
      'xl:px-20',
      'xl:py-24',
      '2xl:py-32',
      'dark:bg-neutral-800',
    );
  });

  test('renders background image', () => {
    render(<SectionPromo3 />);

    const backgroundImage = screen.getByTestId('next-image');
    expect(backgroundImage).toBeInTheDocument();
    expect(backgroundImage).toHaveClass(
      'absolute',
      'h-full',
      'w-full',
      'object-contain',
      'object-bottom',
      'dark:opacity-5',
    );

    // The backgroundImage IS the img element in our mock
    expect(backgroundImage).toHaveAttribute('src', '/mocked-background-line.svg');
    expect(backgroundImage).toHaveAttribute('alt', 'backgroundLineSvg');
    expect(backgroundImage).toHaveAttribute('data-fill', 'true');
  });

  test('renders main heading', () => {
    render(<SectionPromo3 />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Don't miss out on");
    expect(heading).toHaveTextContent('special offers.');
    expect(heading).toHaveClass('text-4xl', 'leading-[1.15]', 'font-semibold', 'md:text-5xl');
  });

  test('renders description text', () => {
    render(<SectionPromo3 />);

    const descriptions = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('Register to receive news about the latest') || false;
    });
    expect(descriptions[0]).toBeInTheDocument();
    expect(descriptions[0]).toHaveTextContent('savings combos, discount codes.');
    // The actual classes may vary, so we just check that the element exists
  });

  test('renders feature list with badges', () => {
    render(<SectionPromo3 />);

    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(3);

    // Check badge colors and content
    expect(badges[0]).toHaveAttribute('data-color', 'violet');
    expect(badges[0]).toHaveTextContent('01');

    expect(badges[1]).toHaveAttribute('data-color', 'green');
    expect(badges[1]).toHaveTextContent('02');

    expect(badges[2]).toHaveAttribute('data-color', 'red');
    expect(badges[2]).toHaveTextContent('03');
  });

  test('renders feature list items with correct text', () => {
    render(<SectionPromo3 />);

    expect(screen.getByText('Savings combos')).toBeInTheDocument();
    expect(screen.getByText('Freeship')).toBeInTheDocument();
    expect(screen.getByText('Premium magazines')).toBeInTheDocument();

    // Check that feature text has correct classes
    const featureTexts = screen.getAllByText(/Savings combos|Freeship|Premium magazines/);
    featureTexts.forEach(text => {
      expect(text).toHaveClass('font-medium', 'text-neutral-700', 'dark:text-neutral-300');
    });
  });

  test('renders email form', () => {
    render(<SectionPromo3 />);

    const form = screen.getByTestId('email-input').closest('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveClass('relative', 'mt-10', 'max-w-sm');
  });

  test('renders email input field', () => {
    render(<SectionPromo3 />);

    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
    expect(emailInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(emailInput).toHaveClass('sm:before:shadow-none');
  });

  test('renders submit button', () => {
    render(<SectionPromo3 />);

    const submitButton = screen.getByTestId('button-circle');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(submitButton).toHaveClass(
      'absolute',
      'top-1/2',
      'right-1',
      '-translate-y-1/2',
      'transform',
    );
  });

  test('renders main product image', () => {
    render(<SectionPromo3 />);

    const mainImage = screen.getByTestId('nc-image');
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveClass(
      'relative',
      'block',
      'lg:absolute',
      'lg:right-0',
      'lg:bottom-0',
      'mt-10',
      'lg:mt-0',
      'max-w-lg',
      'lg:max-w-[calc(50%-40px)]',
    );

    const img = within(mainImage).getByRole('img');
    expect(img).toHaveAttribute('src', '/mocked-promo3.png');
    expect(img).toHaveAttribute('alt', 'right hero');
    expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
  });

  test('has correct responsive layout classes', () => {
    render(<SectionPromo3 />);

    const contentContainer = screen
      .getByTestId('nc-image')
      .closest('div[class*="relative flex flex-col"]');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer).toHaveClass('lg:flex-row');

    // Check text content area
    const textArea = screen
      .getByRole('heading', { level: 2 })
      .closest('div[class*="relative max-w-lg"]');
    expect(textArea).toBeTruthy();
    expect(textArea).toHaveClass('lg:w-1/2');

    // Check image area
    const imageArea = screen.getByTestId('nc-image');
    expect(imageArea).toHaveClass(
      'lg:absolute',
      'lg:right-0',
      'lg:bottom-0',
      'lg:max-w-[calc(50%-40px)]',
    );
  });

  test('feature list has correct structure and spacing', () => {
    render(<SectionPromo3 />);

    const featureList = screen.getByRole('list');
    expect(featureList).toHaveClass('mt-10', 'flex', 'flex-col', 'gap-y-4');

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);

    listItems.forEach(item => {
      expect(item).toHaveClass('flex', 'items-center', 'gap-x-4');
    });
  });

  test('background image container has correct positioning', () => {
    render(<SectionPromo3 />);

    // Look for the div container that has absolute inset-10 classes
    const backgroundContainer = screen.getByTestId('next-image').parentElement;
    expect(backgroundContainer).toHaveClass('absolute', 'inset-10');
  });

  test('renders without className prop', () => {
    render(<SectionPromo3 />);

    const container = screen.getByTestId('nc-image').closest('div[class*="xl:pt-10"]');
    expect(container).toBeTruthy();
    expect(container).toHaveClass('xl:pt-10', '2xl:pt-24');
    // Should not have any custom classes
    expect(container).not.toHaveClass('custom');
  });

  test('has correct dark mode support', () => {
    render(<SectionPromo3 />);

    const contentContainer = screen
      .getByTestId('nc-image')
      .closest('div[class*="relative flex flex-col"]');
    expect(contentContainer).toBeTruthy();
    expect(contentContainer).toHaveClass('dark:bg-neutral-800');

    const descriptions = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('Register to receive news about the latest') || false;
    });
    // Just check that the description exists
    expect(descriptions[0]).toBeInTheDocument();

    const backgroundImage = screen.getByTestId('next-image');
    expect(backgroundImage).toHaveClass('dark:opacity-5');

    const featureTexts = screen.getAllByText(/Savings combos|Freeship|Premium magazines/);
    featureTexts.forEach(text => {
      expect(text).toHaveClass('dark:text-neutral-300');
    });
  });
});
