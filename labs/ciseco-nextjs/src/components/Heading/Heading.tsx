import NextPrev from '@/shared/NextPrev/NextPrev'
import clsx from 'clsx'
import React, { HTMLAttributes, ReactNode } from 'react'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  fontClass?: string
  headingDim?: ReactNode | string
  description?: ReactNode | string
  hasNextPrev?: boolean
  isCenter?: boolean
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  onClickNext?: () => void
  onClickPrev?: () => void
  nextBtnDisabled?: boolean
  prevBtnDisabled?: boolean
}

const Heading: React.FC<HeadingProps> = ({
  children,
  description,
  className = 'mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50',
  fontClass = 'text-3xl md:text-4xl font-semibold',
  isCenter = false,
  hasNextPrev = false,
  headingDim,
  level: Level = 'h2',
  onClickNext,
  onClickPrev,
  nextBtnDisabled,
  prevBtnDisabled,
  ...args
}) => {
  return (
    <div className={clsx('relative flex flex-col justify-between sm:flex-row sm:items-end', className)}>
      <div className={clsx(isCenter && 'mx-auto flex w-full flex-col items-center text-center')}>
        <Level className={clsx(isCenter && 'justify-center', fontClass)} {...args}>
          {children}
          {headingDim ? (
            <>
              <span>{'. '}</span>
              <span className="text-neutral-400">{headingDim}</span>
            </>
          ) : null}
        </Level>
        {!!description ? (
          <p className="mt-3 block max-w-xl text-base/normal text-neutral-500 dark:text-neutral-400">{description}</p>
        ) : null}
      </div>
      {hasNextPrev && !isCenter && (
        <div className="mt-4 flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <NextPrev
            onClickNext={onClickNext}
            onClickPrev={onClickPrev}
            nextDisabled={nextBtnDisabled}
            prevDisabled={prevBtnDisabled}
          />
        </div>
      )}
    </div>
  )
}

export default Heading
