'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { type FC } from 'react';

import { type TCollection } from '../data/types';
import { useLocalizeHref } from '../hooks/useLocale';

import { Link } from './Link';

interface Props extends Record<string, any> {
  className?: string;
  collection: TCollection;
  ratioClass?: string;
  testId?: string;
}

const CollectionCard2: FC<Props> = ({
  className,
  collection,
  ratioClass = 'aspect-square',
  testId = 'collection-card-2',
}) => {
  const localizeHref = useLocalizeHref();

  if (!collection.handle) {
    return null;
  }
  return (
    <Link
      className={clsx(className, 'block')}
      data-testid={testId}
      href={localizeHref(`/collections/${collection.handle}`) as any}
    >
      <div
        className={clsx(
          'group relative w-full overflow-hidden rounded-2xl',
          ratioClass,
          collection.color,
        )}
        data-testid={`${testId}-image-container`}
      >
        {collection.image && (
          <div className="absolute inset-5 xl:inset-14">
            <Image
              alt={collection.image.alt ?? ''}
              className="rounded-2xl object-cover object-center"
              data-testid={`${testId}-image`}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              src={collection.image.src}
            />
          </div>
        )}
        <span className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-5 flex-1 text-center" data-testid={`${testId}-content`}>
        <h2
          className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100"
          data-testid={`${testId}-title`}
        >
          {collection.title}
        </h2>
        <span
          className="mt-0.5 block text-sm text-neutral-500 sm:mt-1.5 dark:text-neutral-400"
          dangerouslySetInnerHTML={{ __html: collection.sortDescription ?? '' }}
          data-testid={`${testId}-description`}
        />
      </div>
    </Link>
  );
};

export default CollectionCard2;
