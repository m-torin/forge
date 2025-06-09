import React, { type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ children, className = '', rows = 4, ...args }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:focus:ring-primary-600/25 block w-full rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
        {...args}
      >
        {children}
      </textarea>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
