'use client';
import { type FC } from 'react';

export interface PrevProps extends Record<string, any> {
  btnClassName?: string;
  className?: string;
  onClickPrev?: () => void;
  svgSize?: string;
}

const Prev: FC<PrevProps> = ({
  btnClassName = 'w-10 h-10',
  className = 'relative',
  onClickPrev = () => {},
  svgSize = 'w-5 h-5',
}) => {
  return (
    <div
      className={`nc-Prev text-neutral-500 dark:text-neutral-400 ${className}`}
      data-glide-el="controls"
    >
      <button
        className={`${btnClassName} flex items-center justify-center rounded-full border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-600`}
        data-glide-dir="<"
        title="Prev"
        onClick={onClickPrev}
      >
        <svg className={`${svgSize} rtl:rotate-180`} fill="none" viewBox="0 0 24 24">
          <path
            d="M9.57 5.92993L3.5 11.9999L9.57 18.0699"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth="1.5"
          />
          <path
            d="M20.5 12H3.67004"
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

export default Prev;
