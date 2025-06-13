import { IconArrowRight } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { Collection } from '@/data/types';

interface CollectionCard6Props {
  bgSvgUrl?: string;
  className?: string;
  collection: Collection;
}

const CollectionCard6: FC<CollectionCard6Props> = ({ 
  bgSvgUrl, 
  className = '', 
  collection 
}) => {
  if (!collection.handle) {
    return null;
  }

  // Get background color from collection metadata or use default
  const bgColor = collection.metafields?.find(m => m.key === 'background_color')?.value || 'bg-slate-100';

  return (
    <div
      className={`group relative aspect-square w-full overflow-hidden rounded-3xl bg-white transition-shadow hover:shadow-lg dark:bg-neutral-900 ${className}`}
    >
      <div>
        <div className="absolute inset-0 opacity-10">
          {bgSvgUrl && (
            <Image alt="background decoration" fill src={bgSvgUrl} />
          )}
        </div>

        <div className="absolute inset-5 flex flex-col items-center justify-between">
          <div className="flex items-center justify-center">
            {collection.image && (
              <div className={`size-20 rounded-full relative overflow-hidden z-0 ${bgColor}`}>
                <Image
                  alt={collection.image.altText || collection.title}
                  fill
                  src={collection.image.url}
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="text-center">
            <span className="mb-1 block text-sm text-neutral-500 dark:text-neutral-400">
              {collection.description}
            </span>
            <h2 className="text-lg font-semibold sm:text-xl">{collection.title}</h2>
          </div>

          <Link
            href={`/collections/${collection.handle}`}
            className="group-hover:text-primary-500 flex items-center text-sm font-medium transition-colors"
          >
            <span>See Collection</span>
            <IconArrowRight className="ml-2.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard6;