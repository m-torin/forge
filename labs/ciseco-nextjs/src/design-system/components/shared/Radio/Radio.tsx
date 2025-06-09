import { type FC } from 'react'

export interface RadioProps {
  className?: string
  defaultChecked?: boolean
  id: string
  label?: string
  name: string
  onChange?: (value: string) => void
  sizeClassName?: string
}

const Radio: FC<RadioProps> = ({
  id,
  name,
  className = '',
  defaultChecked,
  label,
  onChange,
  sizeClassName = 'w-6 h-6',
}) => {
  return (
    <div className={`flex items-center text-sm sm:text-base ${className}`}>
      <input
        id={id}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`focus:ring-action-primary text-primary-500 focus:ring-primary-500 dark:checked:bg-primary-500 rounded-full border-neutral-400 bg-transparent hover:border-neutral-700 dark:border-neutral-700 dark:hover:border-neutral-500 ${sizeClassName}`}
        defaultChecked={defaultChecked}
        name={name}
        type="radio"
        value={id}
      />
      {label && (
        <label
          dangerouslySetInnerHTML={{ __html: label }}
          htmlFor={id}
          className="block select-none pl-2.5 text-neutral-900 sm:pl-3 dark:text-neutral-100"
        />
      )}
    </div>
  )
}

export default Radio
