import SectionSliderLargeProduct from '@/components/SectionSliderLargeProduct';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the Heading component
vi.mock('@/components/Heading/Heading', () => ({
  default: ({
    children,
    headingDim,
    prevBtnDisabled,
    nextBtnDisabled,
    onClickPrev,
    onClickNext,
  }: any) => (
    <div
      data-testid="heading"
      data-heading-dim={headingDim}
      data-prev-disabled={prevBtnDisabled}
      data-next-disabled={nextBtnDisabled}
    >
      <button data-testid="prev-btn" onClick={onClickPrev}>
        Previous
      </button>
      <h2>{children}</h2>
      <button data-testid="next-btn" onClick={onClickNext}>
        Next
      </button>
    </div>
  ),
}));

// Mock the ProductCardLarge component
vi.mock('@/components/ProductCardLarge', () => ({
  default: ({ product }: { product: any }) => (
    <div data-testid="product-card-large" data-product-id={product.id}>
      {product.title}
    </div>
  ),
}));

// Mock the useCarouselArrowButtons hook
vi.mock('@/hooks/use-carousel-arrow-buttons', () => ({
  useCarouselArrowButtons: () => ({
    prevBtnDisabled: false,
    nextBtnDisabled: false,
    onPrevButtonClick: vi.fn(),
    onNextButtonClick: vi.fn(),
  }),
}));

// Mock the useEmblaCarousel hook
vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), { on: vi.fn(), off: vi.fn() }],
}));

// Mock the HugeiconsIcon component
vi.mock('@hugeicons/react', () => ({
  HugeiconsIcon: ({ icon, size, color, className, strokeWidth }: any) => (
    <div
      data-testid="hugeicons-icon"
      data-size={size}
      data-color={color}
      className={className}
      data-stroke-width={strokeWidth}
    >
      Icon
    </div>
  ),
}));

// Mock the ArrowUpRight01Icon
vi.mock('@hugeicons/core-free-icons', () => ({
  ArrowUpRight01Icon: 'ArrowUpRight01Icon',
}));

const mockProducts = [
  {
    id: '1',
    title: 'Product 1',
    price: 99.99,
    image: '/product1.jpg',
  },
  {
    id: '2',
    title: 'Product 2',
    price: 149.99,
    image: '/product2.jpg',
  },
  {
    id: '3',
    title: 'Product 3',
    price: 199.99,
    image: '/product3.jpg',
  },
];

describe('sectionSliderLargeProduct Component', () => {
  test('renders the component with default props', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const container = screen.getByTestId('heading').closest('.nc-SectionSliderLargeProduct');
    expect(container).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    const customClass = 'custom-slider-class';
    render(<SectionSliderLargeProduct products={mockProducts} className={customClass} />);

    const container = screen.getByTestId('heading').closest('.nc-SectionSliderLargeProduct');
    expect(container).toHaveClass(customClass);
  });

  test('renders heading with default text', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const heading = screen.getByTestId('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-heading-dim', 'Featured of the week');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Chosen by experts');
  });

  test('renders heading with custom text', () => {
    const customHeading = 'Custom Heading';
    const customHeadingDim = 'Custom Subheading';
    render(
      <SectionSliderLargeProduct
        products={mockProducts}
        heading={customHeading}
        headingDim={customHeadingDim}
      />,
    );

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveAttribute('data-heading-dim', customHeadingDim);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(customHeading);
  });

  test('renders navigation buttons', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const prevButton = screen.getByTestId('prev-btn');
    const nextButton = screen.getByTestId('next-btn');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toHaveTextContent('Previous');
    expect(nextButton).toHaveTextContent('Next');
  });

  test('renders product cards for each product', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const productCards = screen.getAllByTestId('product-card-large');
    expect(productCards).toHaveLength(3);

    expect(productCards[0]).toHaveAttribute('data-product-id', '1');
    expect(productCards[0]).toHaveTextContent('Product 1');

    expect(productCards[1]).toHaveAttribute('data-product-id', '2');
    expect(productCards[1]).toHaveTextContent('Product 2');

    expect(productCards[2]).toHaveAttribute('data-product-id', '3');
    expect(productCards[2]).toHaveTextContent('Product 3');
  });

  test('renders embla carousel container', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const emblaContainer = screen.getByTestId('embla-container');
    expect(emblaContainer).toBeInTheDocument();
  });

  test('renders embla slides with correct classes', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const emblaContainer = screen.getByTestId('embla-slides');
    expect(emblaContainer).toBeInTheDocument();
    expect(emblaContainer).toHaveClass('-ms-5', 'embla__container', 'sm:-ms-8');
  });

  test('renders "More items" link', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const moreItemsLink = screen.getByRole('link', { name: /more items/i });
    expect(moreItemsLink).toBeInTheDocument();
    expect(moreItemsLink).toHaveAttribute('href', '/collections/all');
  });

  test('renders "More items" content', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    expect(screen.getByText('More items')).toBeInTheDocument();
    expect(screen.getByText('Show me more')).toBeInTheDocument();
  });

  test('renders arrow icon in "More items" section', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const arrowIcon = screen.getAllByTestId('hugeicons-icon')[0]; // First icon is in the "More items" section
    expect(arrowIcon).toBeInTheDocument();
    expect(arrowIcon).toHaveAttribute('data-size', '24');
    expect(arrowIcon).toHaveAttribute('data-stroke-width', '1.5');
    expect(arrowIcon).toHaveClass('absolute', 'left-full', 'ms-2', 'group-hover:scale-110');
  });

  test('renders slides with correct responsive classes', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const slides = screen
      .getAllByTestId('product-card-large')
      .map(card => card.closest('[class*="embla__slide"]'));
    slides.forEach(slide => {
      expect(slide).toHaveClass(
        'embla__slide',
        'basis-full',
        'ps-5',
        'sm:basis-2/3',
        'sm:ps-8',
        'lg:basis-1/2',
        'xl:basis-2/5',
        '2xl:basis-1/3',
      );
    });
  });

  test('renders "More items" slide with correct classes', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const moreItemsSlide = screen.getByRole('link', { name: /more items/i });
    expect(moreItemsSlide).toHaveClass(
      'group',
      'relative',
      'block',
      'embla__slide',
      'basis-full',
      'ps-5',
      'sm:basis-2/3',
      'sm:ps-8',
      'lg:basis-1/2',
      'xl:basis-2/5',
      '2xl:basis-1/3',
    );
  });

  test('renders "More items" content container with correct positioning', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const moreItemsLink = screen.getByRole('link', { name: /more items/i });
    const contentContainer = within(moreItemsLink).getByTestId('more-items-content');
    expect(contentContainer).toHaveClass(
      'absolute',
      'inset-x-10',
      'inset-y-6',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
    );
  });

  test('renders with custom embla options', () => {
    const customEmblaOptions = {
      slidesToScroll: 2,
      loop: true,
    };

    render(<SectionSliderLargeProduct products={mockProducts} emblaOptions={customEmblaOptions} />);

    const container = screen.getByTestId('heading').closest('.nc-SectionSliderLargeProduct');
    expect(container).toBeInTheDocument();
  });

  test('renders with empty products array', () => {
    render(<SectionSliderLargeProduct products={[]} />);

    const container = screen.getByTestId('heading').closest('.nc-SectionSliderLargeProduct');
    expect(container).toBeInTheDocument();

    const productCards = screen.queryAllByTestId('product-card-large');
    expect(productCards).toHaveLength(0);

    // Should still render the "More items" link
    expect(screen.getByRole('link', { name: /more items/i })).toBeInTheDocument();
  });

  test('renders with single product', () => {
    const singleProduct = [mockProducts[0]];
    render(<SectionSliderLargeProduct products={singleProduct} />);

    const productCards = screen.getAllByTestId('product-card-large');
    expect(productCards).toHaveLength(1);
    expect(productCards[0]).toHaveAttribute('data-product-id', '1');
  });

  test('renders "More items" background with correct classes', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const moreItemsLink = screen.getByRole('link', { name: /more items/i });
    const background = within(moreItemsLink).getByTestId('more-items-background');
    expect(background).toHaveClass('h-[410px]', 'relative', 'overflow-hidden', 'rounded-2xl');
  });

  test('should render with custom icon', () => {
    render(<SectionSliderLargeProduct products={mockProducts} />);

    const section = screen.getByTestId('embla-container');
    expect(section).toBeInTheDocument();
  });
});
