// Export Mantine Carousel
// Compatibility exports
import { Carousel, type CarouselProps, CarouselSlide } from '@mantine/carousel';
import type React from 'react';

export { Carousel, type CarouselProps } from '@mantine/carousel';
export const CarouselContent: React.FC<CarouselProps> = Carousel;
export const CarouselItem: React.ComponentType<React.ComponentProps<typeof CarouselSlide>> = Carousel.Slide;
export const CarouselPrevious: React.FC = () => null;
export const CarouselNext: React.FC = () => null;
