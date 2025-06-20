'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { type FC } from 'react';

import { type TCollection } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import NcImage from './shared/NcImage/NcImage';

interface CollectionCard6Props extends Record<string, any> {
  bgSvgUrl?: string;
  className?: string;
  collection: TCollection;
  'data-testid'?: string;
}

const CollectionCard6: FC<CollectionCard6Props> = ({
  bgSvgUrl,
  className = '',
  collection,
  'data-testid': testId = 'collection-card-6',
}) => {
  const localizeHref = useLocalizeHref();

  if (!collection.handle) {
    return null;
  }

  return (
    <div
      className={`group aspect-square relative w-full overflow-hidden rounded-3xl bg-white transition-shadow hover:nc-shadow-lg dark:bg-neutral-900 ${className}`}
      data-testid={testId}
    >
      <div>
        <div className="absolute inset-0 opacity-10">
          {bgSvgUrl && <Image alt="svgbg" fill src={bgSvgUrl} />}
        </div>

        <div className="absolute inset-5 flex flex-col items-center justify-between">
          <div className="flex items-center justify-center">
            {collection.image?.src && (
              <NcImage
                alt={collection.image.alt}
                containerClassName={`size-20 rounded-full relative overflow-hidden z-0 ${collection.color}`}
                fill
                src={collection.image}
              />
            )}
          </div>

          <div className="text-center">
            <span className="mb-1 block text-sm text-neutral-500 dark:text-neutral-400">
              {collection.sortDescription}
            </span>
            <h2 className="text-lg font-semibold sm:text-xl">{collection.title}</h2>
          </div>

          <Link
            className="flex items-center text-sm font-medium transition-colors group-hover:text-primary-500"
            href={localizeHref(`/collections/${collection.handle}`)}
          >
            <span>See Collection</span>
            <ArrowRightIcon className="ml-2.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard6;
