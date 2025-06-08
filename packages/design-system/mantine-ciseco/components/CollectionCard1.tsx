'use client';

import clsx from 'clsx';
import { type FC } from 'react';

import { type TCollection } from '../data/data';
import { useLocalizeHref } from '../hooks/useLocale';

import { Link } from './Link';
import NcImage from './shared/NcImage/NcImage';

interface Props {
  className?: string;
  collection: TCollection;
  'data-testid'?: string;
  size?: 'large' | 'normal';
}

const CollectionCard1: FC<Props> = ({ className = '', collection, 'data-testid': testId = 'collection-card', size = 'normal' }) => {
  const localizeHref = useLocalizeHref();

  if (!collection.handle) {
    return null;
  }
  return (
    <Link
      data-testid={testId}
      href={localizeHref(`/collections/${collection.handle}`) as any}
      className={`flex items-center ${className}`}
    >
      {collection.image?.src && (
        <NcImage
          data-testid="collection-image"
          containerClassName={clsx(
            'relative mr-4 shrink-0 overflow-hidden rounded-lg',
            size === 'large' ? 'size-20' : 'size-12',
          )}
          alt={collection.image.alt}
          fill
          sizes="(max-width: 640px) 100vw, 40vw"
          src={collection.image}
        />
      )}
      <div>
        <h2
          data-testid="collection-title"
          className={clsx(
            'font-semibold nc-card-title text-neutral-900 dark:text-neutral-100',
            size === 'large' ? 'text-lg' : 'text-base',
          )}
        >
          {collection.title}
        </h2>
        <span
          className={`${
            size === 'large' ? 'text-sm' : 'text-xs'
          } mt-[2px] block text-neutral-500 dark:text-neutral-400`}
        >
          {collection.sortDescription}
        </span>
      </div>
    </Link>
  );
};

export default CollectionCard1;
