import React, { TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

// eslint-disable-next-line react/display-name
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', children, rows = 4, ...args }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600/25 ${className}`}
        rows={rows}
        {...args}
      >
        {children}
      </textarea>
    )
  }
)

export default Textarea
