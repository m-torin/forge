import { FC } from 'react'

export interface RadioProps {
  className?: string
  name: string
  id: string
  onChange?: (value: string) => void
  defaultChecked?: boolean
  sizeClassName?: string
  label?: string
}

const Radio: FC<RadioProps> = ({
  className = '',
  name,
  id,
  onChange,
  label,
  sizeClassName = 'w-6 h-6',
  defaultChecked,
}) => {
  return (
    <div className={`flex items-center text-sm sm:text-base ${className}`}>
      <input
        id={id}
        name={name}
        type="radio"
        className={`focus:ring-action-primary rounded-full border-neutral-400 bg-transparent text-primary-500 hover:border-neutral-700 focus:ring-primary-500 dark:border-neutral-700 dark:checked:bg-primary-500 dark:hover:border-neutral-500 ${sizeClassName}`}
        onChange={(e) => onChange && onChange(e.target.value)}
        defaultChecked={defaultChecked}
        value={id}
      />
      {label && (
        <label
          htmlFor={id}
          className="block pl-2.5 text-neutral-900 select-none sm:pl-3 dark:text-neutral-100"
          dangerouslySetInnerHTML={{ __html: label }}
        ></label>
      )}
    </div>
  )
}

export default Radio
