import { TCollection } from '@/data/data'
import { ArrowUpRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'

interface CollectionCard4Props {
  className?: string
  bgSvgUrl?: string
  collection: TCollection
}

const CollectionCard4: FC<CollectionCard4Props> = ({ className, bgSvgUrl, collection }) => {
  if (!collection.handle) {
    return null
  }
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl bg-white p-5 transition-shadow hover:nc-shadow-lg sm:p-8 dark:bg-neutral-900',
        className
      )}
    >
      {bgSvgUrl && (
        <div className="absolute end-0 bottom-0 size-52 sm:size-64 xl:size-72">
          <Image src={bgSvgUrl} alt={'bgSVG'} fill className="object-contain object-bottom-right opacity-60" />
        </div>
      )}

      <div className="flex flex-col justify-between">
        <div className="flex items-center justify-between gap-x-2.5">
          {collection.image?.src && (
            <div className={clsx('relative size-20 overflow-hidden rounded-full', collection.color)}>
              <div className="absolute inset-4">
                <Image alt={collection.image?.alt} src={collection.image} fill sizes="80px" className="object-cover" />
              </div>
            </div>
          )}
          <ArrowUpRightIcon className="size-6 text-neutral-500 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110" />
        </div>

        <div className="mt-12">
          <p
            className="text-sm text-neutral-500 dark:text-neutral-400"
            dangerouslySetInnerHTML={{ __html: collection.sortDescription || '' }}
          />
          <h2
            className="mt-2 text-2xl font-semibold sm:text-3xl"
            dangerouslySetInnerHTML={{ __html: collection.title || '' }}
          />
        </div>

        <p className="mt-10 text-sm text-neutral-500 sm:mt-20 dark:text-neutral-400">{collection.count} products</p>

        <Link href={'/collections/' + collection.handle} className="absolute inset-0"></Link>
      </div>
    </div>
  )
}

export default CollectionCard4
