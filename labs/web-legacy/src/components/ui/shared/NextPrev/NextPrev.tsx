'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import React, { type FC } from 'react';

export interface NextPrevProps {
  btnClassName?: string;
  className?: string;
  currentPage?: number;
  nextDisabled?: boolean;
  onClickNext?: () => void;
  onClickPrev?: () => void;
  onlyNext?: boolean;
  onlyPrev?: boolean;
  prevDisabled?: boolean;
  totalPage?: number;
}

const NextPrev: FC<NextPrevProps> = ({
  btnClassName = 'w-10 h-10',
  className = '',
  nextDisabled = false,
  onClickNext = () => {},
  onClickPrev = () => {},
  onlyNext = false,
  onlyPrev = false,
  prevDisabled = false,
}) => {
  const [focus, setFocus] = React.useState<'left' | 'right'>('right');

  return (
    <div
      className={`nc-NextPrev relative flex items-center text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      {!onlyNext && (
        <button
          aria-disabled={prevDisabled}
          aria-label="Prev"
          className={`${btnClassName} ${
            !onlyPrev ? 'me-2' : ''
          } flex items-center justify-center rounded-full border-neutral-200 dark:border-neutral-600 ${
            focus === 'left' ? 'border-2' : ''
          }`}
          disabled={prevDisabled}
          onClick={(e) => {
            e.preventDefault();
            onClickPrev();
          }}
          onMouseEnter={() => setFocus('left')}
        >
          <ArrowLeftIcon className="h-5 w-5 rtl:rotate-180" />
        </button>
      )}
      {!onlyPrev && (
        <button
          aria-disabled={nextDisabled}
          aria-label="Next"
          className={`${btnClassName} flex items-center justify-center rounded-full border-neutral-200 dark:border-neutral-600 ${
            focus === 'right' ? 'border-2' : ''
          }`}
          disabled={nextDisabled}
          onClick={(e) => {
            e.preventDefault();
            onClickNext();
          }}
          onMouseEnter={() => setFocus('right')}
        >
          <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
        </button>
      )}
    </div>
  );
};

export default NextPrev;
