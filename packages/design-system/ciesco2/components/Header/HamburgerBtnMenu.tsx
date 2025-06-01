
'use client';


import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';


import { useAside } from '../aside';

const HamburgerBtnMenu = () => {
  const { open: openAside } = useAside();

  return (
    <button
      onClick={() => openAside('sidebar-navigation')}
      className="-m-2.5 flex cursor-pointer items-center justify-center rounded-full p-2.5 hover:bg-neutral-100 focus-visible:outline-0 dark:hover:bg-neutral-700"
      type="button"
    >
      <span className="sr-only">Open main menu</span>
      <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.5} color="currentColor" size={24} />
    </button>
  );
};

export default HamburgerBtnMenu;
