import { TCollection } from '@/data/data'
import clsx from 'clsx'
import Image from 'next/image'
import { FC } from 'react'
import { Link } from './Link'

interface Props {
  className?: string
  ratioClass?: string
  collection: TCollection
}

const CollectionCard2: FC<Props> = ({ className, ratioClass = 'aspect-square', collection }) => {
  if (!collection.handle) {
    return null
  }
  return (
    <Link href={'/collections/' + collection.handle} className={clsx(className, 'block')}>
      <div className={clsx('group relative w-full overflow-hidden rounded-2xl', ratioClass, collection.color)}>
        {collection.image && (
          <div className="absolute inset-5 xl:inset-14">
            <Image
              alt={collection.image?.alt}
              src={collection.image}
              className="rounded-2xl object-cover object-center"
              sizes="(max-width: 640px) 100vw, 40vw"
              fill
            />
          </div>
        )}
        <span className="absolute inset-0 rounded-2xl bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></span>
      </div>
      <div className="mt-5 flex-1 text-center">
        <h2 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-neutral-100">
          {collection.title}
        </h2>
        <span
          className="mt-0.5 block text-sm text-neutral-500 sm:mt-1.5 dark:text-neutral-400"
          dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
        ></span>
      </div>
    </Link>
  )
}

export default CollectionCard2
