import { type StaticImageData } from 'next/image';

export interface ListingGalleryImage {
  id: number;
  url: StaticImageData | string;
}
