import { Link } from '@/components/Link'
import clsx from 'clsx'
import { ComponentType, ElementType, FC } from 'react'

export interface ButtonProps {
  sizeClass?: string
  fontSize?: string
  loading?: boolean
  targetBlank?: boolean
  href?: string
  as?: ElementType | ComponentType<any>
  className?: string
  [key: string]: any // Cho phép bất kỳ props tùy chỉnh nào
}

const Button: FC<ButtonProps> = ({
  className = 'text-neutral-700 dark:text-neutral-200 disabled:cursor-not-allowed',
  sizeClass = 'py-3 px-4 sm:py-3.5 sm:px-6',
  fontSize = 'text-sm sm:text-base font-nomal',
  children,
  loading,
  href,
  as,
  targetBlank,
  disabled,
  ...props
}) => {
  const classes = clsx(
    'nc-Button relative inline-flex h-auto cursor-pointer items-center justify-center rounded-full transition-colors',
    fontSize,
    sizeClass,
    className
  )

  let Component = as || 'button'
  if (!!href) {
    Component = Link
  }

  return (
    <Component
      disabled={disabled || loading}
      className={classes}
      {...props}
      href={href}
      target={targetBlank ? '_blank' : undefined}
      rel={targetBlank ? 'noopener noreferrer' : undefined}
    >
      {loading && (
        <svg
          className="-ms-1 me-3 size-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children || 'Button'}
    </Component>
  )
}

export default Button
