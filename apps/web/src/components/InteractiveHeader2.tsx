import clsx from "clsx";
import { type FC } from "react";

import {
  AvatarDropdown,
  CartBtn,
  HamburgerBtnMenu,
  Logo,
  Navigation,
  SearchBtnPopover,
} from "@repo/design-system/mantine-ciseco";
import { getCollections } from "@repo/design-system/mantine-ciseco/data/data";
import { getNavigation } from "@repo/design-system/mantine-ciseco/data/navigation";

export interface InteractiveHeader2Props {
  cartCount?: number;
  hasBorder?: boolean;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

const InteractiveHeader2: FC<InteractiveHeader2Props> = async ({
  cartCount = 0,
  hasBorder = true,
  onCartClick,
  onMenuClick,
}) => {
  const navigationMenu = await getNavigation();
  const allCollections = await getCollections();

  return (
    <div className="relative z-10 w-full bg-white">
      <div
        className={clsx(
          "relative border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
          hasBorder && "border-b",
          !hasBorder && "has-[.header-popover-full-panel]:border-b",
        )}
      >
        <div className="container flex h-20 justify-between">
          <div className="flex flex-1 items-center lg:hidden">
            <HamburgerBtnMenu onClick={onMenuClick} />
          </div>

          <div className="flex items-center lg:flex-1">
            <Logo />
          </div>

          <div className="mx-4 hidden flex-2 justify-center lg:flex">
            <Navigation
              featuredCollection={allCollections[10]}
              menu={navigationMenu}
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
            <SearchBtnPopover />
            <AvatarDropdown />
            <CartBtn onClick={onCartClick} numberItems={cartCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveHeader2;
