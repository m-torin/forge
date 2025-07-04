import clsx from 'clsx';
import React, { type HTMLAttributes, type ReactNode } from 'react';

import NextPrev from '../NextPrev/NextPrev';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  'data-testid'?: string;
  description?: ReactNode | string;
  fontClass?: string;
  hasNextPrev?: boolean;
  headingDim?: ReactNode | string;
  isCenter?: boolean;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  nextBtnDisabled?: boolean;
  onClickNext?: () => void;
  onClickPrev?: () => void;
  prevBtnDisabled?: boolean;
}

const Heading: React.FC<HeadingProps> = ({
  children,
  className = 'mb-12 lg:mb-14 text-neutral-900 dark:text-neutral-50',
  'data-testid': testId = 'heading',
  description,
  fontClass = 'text-3xl md:text-4xl font-semibold',
  hasNextPrev = false,
  headingDim,
  isCenter = false,
  level: Level = 'h2',
  nextBtnDisabled,
  onClickNext,
  onClickPrev,
  prevBtnDisabled,
  ...args
}) => {
  return (
    <div
      className={clsx('relative flex flex-col justify-between sm:flex-row sm:items-end', className)}
      data-testid={testId}
    >
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
        {description ? (
          <p className="mt-3 block max-w-xl text-base/normal text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
      </div>
      {hasNextPrev && !isCenter && (
        <div className="mt-4 flex shrink-0 justify-end sm:ms-2 sm:mt-0">
          <NextPrev
            nextDisabled={nextBtnDisabled}
            prevDisabled={prevBtnDisabled}
            onClickNext={onClickNext}
            onClickPrev={onClickPrev}
          />
        </div>
      )}
    </div>
  );
};

export default Heading;
