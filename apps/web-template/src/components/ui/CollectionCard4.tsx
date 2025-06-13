import { IconArrowUpRight } from '@tabler/icons-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import type { Collection } from '@/data/types';

interface CollectionCard4Props {
  bgSvgUrl?: string;
  className?: string;
  collection: Collection;
}

const CollectionCard4: FC<CollectionCard4Props> = ({ 
  bgSvgUrl, 
  className, 
  collection 
}) => {
  if (!collection.handle) {
    return null;
  }

  // Get background color from collection metadata or use default
  const bgColor = collection.metafields?.find(m => m.key === 'background_color')?.value || 'bg-slate-100';

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-white p-5 transition-shadow hover:shadow-lg sm:p-8 dark:bg-neutral-900',
        className
      )}
    >
      {bgSvgUrl && (
        <div className="absolute bottom-0 end-0 size-52 sm:size-64 xl:size-72">
          <Image 
            className="object-bottom-right object-contain opacity-60" 
            alt="background decoration" 
            fill 
            src={bgSvgUrl} 
          />
        </div>
      )}

      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between gap-x-2.5">
          {collection.image && (
            <div className={clsx('relative size-20 overflow-hidden rounded-full', bgColor)}>
              <div className="absolute inset-4">
                <Image 
                  className="object-cover" 
                  alt={collection.image.altText || collection.title} 
                  fill 
                  sizes="80px" 
                  src={collection.image.url} 
                />
              </div>
            </div>
          )}
          <IconArrowUpRight 
            size={24} 
            className="text-neutral-500 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110" 
          />
        </div>

        <div className="mt-12">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {collection.description}
          </p>
          <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
            {collection.title}
          </h2>
        </div>

        <p className="mt-10 text-sm text-neutral-500 sm:mt-20 dark:text-neutral-400">
          {collection.products?.length || 0} products
        </p>

        <Link href={`/collections/${collection.handle}`} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default CollectionCard4;