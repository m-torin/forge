import { cn } from '@/lib/utils';
import type { Experimental_GeneratedImage } from 'ai';
import NextImage from 'next/image';

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({ base64, mediaType, ...props }: ImageProps) => (
  <NextImage
    {...props}
    alt={props.alt || 'Generated image'}
    className={cn('h-auto max-w-full overflow-hidden rounded-md', props.className)}
    src={`data:${mediaType};base64,${base64}`}
    width={500}
    height={300}
  />
);
