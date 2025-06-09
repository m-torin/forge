import clsx from 'clsx'
import Image from 'next/image'
import { type FC } from 'react'

import { type TCollection } from '../data/data'

import { Link } from './Link'

interface Props {
  className?: string
  collection: TCollection
  ratioClass?: string
}

const CollectionCard2: FC<Props> = ({ className, collection, ratioClass = 'aspect-square' }) => {
  if (!collection.handle) {
    return null
  }
  return (
    <Link href={`/collections/${collection.handle}` as any} className={clsx(className, 'block')}>
      <div className={clsx('group relative w-full overflow-hidden rounded-2xl', ratioClass, collection.color)}>
        {collection.image && (
          <div className="absolute inset-5 xl:inset-14">
            <Image
              className="rounded-2xl object-cover object-center"
              alt={collection.image?.alt}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              src={collection.image}
            />
          </div>
        )}
        <span className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
          {collection.title}
        </h2>
        <span
          dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
          className="mt-0.5 block text-sm text-neutral-500 sm:mt-1.5 dark:text-neutral-400"
        />
      </div>
    </Link>
  )
}

export default CollectionCard2
