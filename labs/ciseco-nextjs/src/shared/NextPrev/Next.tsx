'use client'
import { FC } from 'react'

export interface NextProps {
  btnClassName?: string
  className?: string
  svgSize?: string
  onClickNext?: () => void
}

const Next: FC<NextProps> = ({
  className = 'relative',
  onClickNext = () => {},
  btnClassName = 'w-10 h-10',
  svgSize = 'w-5 h-5',
}) => {
  return (
    <div className={`nc-Next text-neutral-500 dark:text-neutral-400 ${className}`} data-glide-el="controls">
      <button
        className={`${btnClassName} flex items-center justify-center rounded-full border-2 border-transparent hover:border-neutral-200 dark:hover:border-neutral-600`}
        onClick={onClickNext}
        title="Next"
        data-glide-dir=">"
      >
        <svg className={`${svgSize} rtl:rotate-180`} viewBox="0 0 24 24" fill="none">
          <path
            d="M14.4301 5.92993L20.5001 11.9999L14.4301 18.0699"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 12H20.33"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default Next
