'use client';

import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface HamburgerBtnMenuProps extends Record<string, any> {
  'data-testid'?: string;
  onClick?: () => void;
}

const HamburgerBtnMenu = ({
  'data-testid': testId = 'hamburger-menu',
  onClick,
}: HamburgerBtnMenuProps) => {
  return (
    <button
      className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-700"
      data-testid={testId}
      type="button"
      onClick={onClick}
    >
      <span className="sr-only">Open main menu</span>
      <HugeiconsIcon color="currentColor" icon={Menu01Icon} size={24} strokeWidth={1.5} />
    </button>
  );
};

export default HamburgerBtnMenu;
