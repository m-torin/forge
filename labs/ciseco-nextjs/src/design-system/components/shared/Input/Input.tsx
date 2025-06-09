import React, { type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  fontClass?: string
  rounded?: string
  sizeClass?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      children,
      className = '',
      fontClass = 'text-sm font-normal',
      rounded = 'rounded-full',
      sizeClass = 'h-11 px-4 py-3',
      ...args
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        className={`focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:focus:ring-primary-600/25 block w-full border border-neutral-200 bg-white disabled:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:disabled:bg-neutral-800 ${rounded} ${fontClass} ${sizeClass} ${className}`}
        type={type}
        {...args}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
