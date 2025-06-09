'use client';

import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface HamburgerBtnMenuProps {
  'data-testid'?: string;
  onClick?: () => void;
}

const HamburgerBtnMenu = ({
  'data-testid': testId = 'hamburger-menu',
  onClick,
}: HamburgerBtnMenuProps) => {
  return (
    <button
      data-testid={testId}
      onClick={onClick}
      className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-700"
      type="button"
    >
      <span className="sr-only">Open main menu</span>
      <HugeiconsIcon strokeWidth={1.5} color="currentColor" icon={Menu01Icon} size={24} />
    </button>
  );
};

export default HamburgerBtnMenu;
