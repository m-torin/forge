import clsx from 'clsx';
import { type FC } from 'react';

import Logo from '../../layout/Logo';
import { type Header2Props } from './types';

import AvatarDropdown from './AvatarDropdown';
import CartBtn from './CartBtn';
import HamburgerBtnMenu from './HamburgerBtnMenu';
import Navigation from './Navigation/Navigation';
import SearchBtnPopover from './SearchBtnPopover';

export type { Header2Props };

const Header2: FC<Header2Props> = ({
  featuredCollection,
  hasBorder = true,
  navigationMenu = [],
}) => {
  return (
    <div className="relative z-10 w-full bg-white">
      <div
        className={clsx(
          'relative border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
          hasBorder && 'border-b',
          !hasBorder && 'has-[.header-popover-full-panel]:border-b',
        )}
      >
        <div className="container flex h-20 justify-between">
          <div className="flex flex-1 items-center lg:hidden">
            <HamburgerBtnMenu />
          </div>

          <div className="flex items-center lg:flex-1">
            <Logo />
          </div>

          <div className="mx-4 hidden flex-2 justify-center lg:flex">
            <Navigation featuredCollection={featuredCollection} menu={navigationMenu} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm: gap-x-5">
            <SearchBtnPopover />
            <AvatarDropdown />
            <CartBtn />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header2;
