import React, { type FC } from 'react'

export interface LabelProps {
  children?: React.ReactNode
  className?: string
}

const Label: FC<LabelProps> = ({ children, className = '' }) => {
  return (
    <label
      data-nc-id="Label"
      className={`nc-Label text-base font-medium text-neutral-900 dark:text-neutral-200 ${className}`}
    >
      {children}
    </label>
  )
}

export default Label
