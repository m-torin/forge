import Logo from '@/components/Logo';
import { getCollections } from '@/data/data';
import { getNavigation } from '@/data/navigation';
import clsx from 'clsx';
import { FC } from 'react';
import AvatarDropdown from './AvatarDropdown';
import CartBtn from './CartBtn';
import HamburgerBtnMenu from './HamburgerBtnMenu';
import Navigation from './Navigation/Navigation';
import SearchBtnPopover from './SearchBtnPopover';

export interface Props {
  hasBorder?: boolean;
  'data-testid'?: string;
}

const Header2: FC<Props> = async ({ hasBorder = true, 'data-testid': testId = 'header-2' }) => {
  const navigationMenu = await getNavigation();
  const allCollections = await getCollections();

  return (
    <div className="relative z-10 w-full bg-white" data-testid={testId}>
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

          <div className="flex-2 mx-4 hidden justify-center lg:flex">
            <Navigation menu={navigationMenu} featuredCollection={allCollections[10]} />
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
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
