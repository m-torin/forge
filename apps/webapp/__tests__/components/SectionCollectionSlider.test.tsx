import SectionCollectionSlider from '@/components/SectionCollectionSlider';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

// Mock the Heading component
vi.mock('@/components/Heading/Heading', () => ({
  default: ({
    children,
    headingDim,
    className,
    hasNextPrev,
    prevBtnDisabled,
    nextBtnDisabled,
    onClickPrev,
    onClickNext,
  }: any) => (
    <div
      data-testid="heading"
      data-heading-dim={headingDim}
      data-heading-class={className}
      data-has-next-prev={hasNextPrev}
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

// Mock the CollectionCard3 component
vi.mock('@/components/CollectionCard3', () => ({
  default: ({ collection }: { collection: any }) => (
    <div data-testid="collection-card" data-collection-id={collection.id}>
      {collection.title}
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

const mockCollections = [
  {
    id: '1',
    title: 'Collection 1',
    handle: 'collection-1',
    description: 'Description 1',
    sortDescription: 'Sort description 1',
    color: 'blue',
    count: 10,
    image: {
      src: '/collection1.jpg',
      width: 400,
      height: 300,
      alt: 'Collection 1',
    },
  },
  {
    id: '2',
    title: 'Collection 2',
    handle: 'collection-2',
    description: 'Description 2',
    sortDescription: 'Sort description 2',
    color: 'red',
    count: 15,
    image: {
      src: '/collection2.jpg',
      width: 400,
      height: 300,
      alt: 'Collection 2',
    },
  },
  {
    id: '3',
    title: 'Collection 3',
    handle: 'collection-3',
    description: 'Description 3',
    sortDescription: 'Sort description 3',
    color: 'green',
    count: 20,
    image: {
      src: '/collection3.jpg',
      width: 400,
      height: 300,
      alt: 'Collection 3',
    },
  },
];

describe('sectionCollectionSlider Component', () => {
  test('renders the component with collections', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const container = screen.getByTestId('heading').closest('div');
    expect(container).toBeInTheDocument();
  });

  test('renders with custom className', () => {
    const customClass = 'custom-collection-slider';
    const { container } = render(
      <SectionCollectionSlider collections={mockCollections} className={customClass} />,
    );

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass(customClass);
  });

  test('renders heading with default text', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const heading = screen.getByTestId('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-heading-dim', 'Good things are waiting for you');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Discover more');
  });

  test('renders heading with custom text', () => {
    const customHeading = 'Custom Heading';
    const customHeadingDim = 'Custom Subheading';
    render(
      <SectionCollectionSlider
        collections={mockCollections}
        heading={customHeading}
        headingDim={customHeadingDim}
      />,
    );

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveAttribute('data-heading-dim', customHeadingDim);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(customHeading);
  });

  test('renders heading with correct classes', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveAttribute(
      'data-heading-class',
      'container mb-12 text-neutral-900 lg:mb-14 dark:text-neutral-50',
    );
  });

  test('renders navigation buttons', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const prevButton = screen.getByTestId('prev-btn');
    const nextButton = screen.getByTestId('next-btn');

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toHaveTextContent('Previous');
    expect(nextButton).toHaveTextContent('Next');
  });

  test('renders collection cards for each collection', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const collectionCards = screen.getAllByTestId('collection-card');
    expect(collectionCards).toHaveLength(3);

    expect(collectionCards[0]).toHaveAttribute('data-collection-id', '1');
    expect(collectionCards[0]).toHaveTextContent('Collection 1');

    expect(collectionCards[1]).toHaveAttribute('data-collection-id', '2');
    expect(collectionCards[1]).toHaveTextContent('Collection 2');

    expect(collectionCards[2]).toHaveAttribute('data-collection-id', '3');
    expect(collectionCards[2]).toHaveTextContent('Collection 3');
  });

  test('renders embla carousel container', () => {
    const { container } = render(<SectionCollectionSlider collections={mockCollections} />);

    const emblaContainer = container.querySelector('.embla');
    expect(emblaContainer).toBeInTheDocument();
    expect(emblaContainer).toHaveClass('embla');
    expect(emblaContainer).toHaveClass('pl-container');
  });

  test('renders embla slides with correct classes', () => {
    const { container } = render(<SectionCollectionSlider collections={mockCollections} />);

    const emblaContainer = container.querySelector('.embla__container');
    expect(emblaContainer).toBeInTheDocument();
    expect(emblaContainer).toHaveClass('-ms-5');
    expect(emblaContainer).toHaveClass('embla__container');
  });

  test('renders slides with correct responsive classes', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const slides = screen
      .getAllByTestId('collection-card')
      .map(card => card.closest('.embla__slide'));
    slides.forEach(slide => {
      expect(slide).toHaveClass(
        'max-w-2xl',
        'embla__slide',
        'basis-11/12',
        'ps-5',
        'sm:basis-2/3',
        'lg:basis-3/7',
        'xl:basis-2/5',
        '2xl:basis-[34%]',
      );
    });
  });

  test('renders with custom embla options', () => {
    const customEmblaOptions = {
      slidesToScroll: 2,
      loop: true,
    };

    render(
      <SectionCollectionSlider collections={mockCollections} emblaOptions={customEmblaOptions} />,
    );

    const container = screen.getByTestId('heading').closest('div');
    expect(container).toBeInTheDocument();
  });

  test('renders with empty collections array', () => {
    render(<SectionCollectionSlider collections={[]} />);

    const container = screen.getByTestId('heading').closest('div');
    expect(container).toBeInTheDocument();

    const collectionCards = screen.queryAllByTestId('collection-card');
    expect(collectionCards).toHaveLength(0);
  });

  test('renders with single collection', () => {
    const singleCollection = [mockCollections[0]];
    render(<SectionCollectionSlider collections={singleCollection} />);

    const collectionCards = screen.getAllByTestId('collection-card');
    expect(collectionCards).toHaveLength(1);
    expect(collectionCards[0]).toHaveAttribute('data-collection-id', '1');
  });

  test('renders without className prop', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const container = screen.getByTestId('heading').closest('div');
    expect(container).toBeInTheDocument();
    // Should not have any custom classes
    expect(container?.className).not.toContain('custom');
  });

  test('renders without headingDim prop (uses default)', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveAttribute('data-heading-dim', 'Good things are waiting for you');
  });

  test('renders without heading prop (uses default)', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Discover more');
  });

  test('renders without emblaOptions prop (uses default)', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const container = screen.getByTestId('heading').closest('div');
    expect(container).toBeInTheDocument();
  });

  test('renders heading with hasNextPrev prop', () => {
    render(<SectionCollectionSlider collections={mockCollections} />);

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveAttribute('data-has-next-prev', 'true');
  });
});
