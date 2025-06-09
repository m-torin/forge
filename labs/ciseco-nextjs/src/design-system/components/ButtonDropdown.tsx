import { ChevronDownIcon } from '@heroicons/react/24/solid'
import { type FC } from 'react'

import Button, { type ButtonProps } from './shared/Button/Button'

export interface ButtonDropdownProps extends ButtonProps {}

const ButtonDropdown: FC<ButtonDropdownProps> = ({ children, translate, ...args }) => {
  return (
    <Button
      fontSize="text-sm"
      className="border border-neutral-200 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
      sizeClass="px-4 py-2 sm:py-2.5"
      translate="hover:border-neutral-300 w-full justify-between"
      {...args}
    >
      {children}
      <ChevronDownIcon aria-hidden="true" className="-mr-1 ml-2 h-4 w-4 opacity-70" />
    </Button>
  )
}

export default ButtonDropdown
