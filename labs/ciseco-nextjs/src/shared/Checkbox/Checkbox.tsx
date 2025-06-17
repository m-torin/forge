import { Tick01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { FC } from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className'> {
  label?: string
  description?: string
  sizeClassName?: string
  onChange?: (e: boolean) => void
  labelClassName?: string
}

const Checkbox: FC<CheckboxProps> = ({
  description,
  label,
  id,
  name,
  sizeClassName = 'size-6',
  onChange,
  labelClassName,
  ...props
}) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-6 grid-cols-1">
          <input
            className={clsx(
              'col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-primary-600 checked:bg-primary-600 indeterminate:border-primary-600 indeterminate:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto',
              sizeClassName
            )}
            name={name}
            id={id || name + '-checkbox'}
            type="checkbox"
            onChange={(e) => onChange?.(e.target.checked)}
            {...props}
          />

          <HugeiconsIcon
            className="pointer-events-none col-start-1 row-start-1 size-4 self-center justify-self-center text-white opacity-0 group-has-checked:opacity-100"
            icon={Tick01Icon}
            size={16}
            color="#ffffff"
            strokeWidth={3}
          />
        </div>
      </div>
      <div className="text-sm/6">
        <label className={labelClassName} htmlFor={id || name + '-checkbox'}>
          {label}
        </label>
        {description && <p className="text-neutral-400">{description}</p>}
      </div>
    </div>
  )
}

export default Checkbox
