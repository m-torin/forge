import { type FC, type SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string
  sizeClass?: string
}

const Select: FC<SelectProps> = ({ children, className = '', sizeClass = 'h-11', ...args }) => {
  return (
    <select
      className={`${sizeClass} ${className} focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:focus:ring-primary-600/25 block w-full rounded-2xl border border-neutral-200 bg-white px-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900`}
      {...args}
    >
      {children}
    </select>
  )
}

export default Select
