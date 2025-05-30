import Button, { type ButtonProps } from '@/shared/Button/Button';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import React, { type FC } from 'react';

export interface ButtonDropdownProps extends ButtonProps {}

const ButtonDropdown: FC<ButtonDropdownProps> = ({ children, translate, ...args }) => {
  return (
    <Button
      fontSize="text-sm"
      className="text-neutral-700 border border-neutral-200 dark:text-neutral-200 dark:border-neutral-700"
      sizeClass="px-4 py-2 sm:py-2.5"
      translate="hover:border-neutral-300 w-full justify-between"
      {...args}
    >
      {children}
      <ChevronDownIcon aria-hidden="true" className="w-4 h-4 ml-2 -mr-1 opacity-70" />
    </Button>
  );
};

export default ButtonDropdown;
