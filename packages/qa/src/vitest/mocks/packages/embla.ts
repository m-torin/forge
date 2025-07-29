// Embla Carousel libraries mock
import { vi } from 'vitest';

// Embla Carousel React
vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [
    vi.fn(), // emblaRef
    {
      scrollNext: vi.fn(),
      scrollPrev: vi.fn(),
      scrollTo: vi.fn(),
      canScrollNext: vi.fn(() => true),
      canScrollPrev: vi.fn(() => false),
      selectedScrollSnap: vi.fn(() => 0),
      scrollSnapList: vi.fn(() => []),
      on: vi.fn(),
      off: vi.fn(),
      destroy: vi.fn(),
    },
  ]),
}));

// Embla Carousel Autoplay plugin
vi.mock('embla-carousel-autoplay', () => ({
  default: vi.fn(() => ({
    init: vi.fn(),
    destroy: vi.fn(),
    name: 'autoplay',
    play: vi.fn(),
    stop: vi.fn(),
    reset: vi.fn(),
  })),
}));
