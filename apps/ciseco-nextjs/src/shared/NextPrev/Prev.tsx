'use client';
import { type FC } from 'react';

export interface PrevProps {
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
      data-glide-el="controls"
      className={`nc-Prev text-neutral-500 dark:text-neutral-400 ${className}`}
    >
      <button
        data-glide-dir="<"
        onClick={onClickPrev}
        className={`${btnClassName} flex items-center justify-center rounded-full border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-600`}
        title="Prev"
      >
        <svg viewBox="0 0 24 24" className={`${svgSize} rtl:rotate-180`} fill="none">
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M9.57 5.92993L3.5 11.9999L9.57 18.0699"
          />
          <path
            strokeWidth="1.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M20.5 12H3.67004"
          />
        </svg>
      </button>
    </div>
  );
};

export default Prev;
