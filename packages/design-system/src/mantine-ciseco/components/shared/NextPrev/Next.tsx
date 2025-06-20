'use client';
import { type FC } from 'react';

export interface NextProps extends Record<string, any> {
  btnClassName?: string;
  className?: string;
  onClickNext?: () => void;
  svgSize?: string;
}

const Next: FC<NextProps> = ({
  btnClassName = 'w-10 h-10',
  className = 'relative',
  onClickNext = () => {},
  svgSize = 'w-5 h-5',
}) => {
  return (
    <div
      className={`nc-Next text-neutral-500 dark:text-neutral-400 ${className}`}
      data-glide-el="controls"
    >
      <button
        className={`${btnClassName} flex items-center justify-center rounded-full border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-600`}
        data-glide-dir=">"
        title="Next"
        onClick={onClickNext}
      >
        <svg className={`${svgSize} rtl:rotate-180`} fill="none" viewBox="0 0 24 24">
          <path
            d="M14.4301 5.92993L20.5001 11.9999L14.4301 18.0699"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="1.5"
          />
          <path
            d="M3.5 12H20.33"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </div>
  );
};

export default Next;
