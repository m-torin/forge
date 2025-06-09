import clsx from 'clsx'
import { type ComponentType, type ElementType, type FC } from 'react'

import { Link } from '../../Link'

export interface ButtonProps {
  [key: string]: any // Cho phép bất kỳ props tùy chỉnh nào
  as?: ElementType | ComponentType<any>
  className?: string
  fontSize?: string
  href?: string
  loading?: boolean
  sizeClass?: string
  targetBlank?: boolean
}

const Button: FC<ButtonProps> = ({
  as,
  children,
  className = 'text-neutral-700 dark:text-neutral-200 disabled:cursor-not-allowed',
  disabled,
  fontSize = 'text-sm sm:text-base font-nomal',
  href,
  loading,
  sizeClass = 'py-3 px-4 sm:py-3.5 sm:px-6',
  targetBlank,
  ...props
}) => {
  const classes = clsx(
    'nc-Button relative inline-flex h-auto cursor-pointer items-center justify-center rounded-full transition-colors',
    fontSize,
    sizeClass,
    className
  )

  let Component = as || 'button'
  if (href) {
    Component = Link
  }

  return (
    <Component
      className={classes}
      disabled={disabled || loading}
      {...props}
      href={href}
      rel={targetBlank ? 'noopener noreferrer' : undefined}
      target={targetBlank ? '_blank' : undefined}
    >
      {loading && (
        <svg
          viewBox="0 0 24 24"
          className="-ms-1 me-3 size-5 animate-spin"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle strokeWidth="3" stroke="currentColor" className="opacity-25" cx="12" cy="12" r="10" />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            fill="currentColor"
          />
        </svg>
      )}
      {children || 'Button'}
    </Component>
  )
}

export default Button
