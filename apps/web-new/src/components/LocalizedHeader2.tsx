import FixedNavigation from "@/components/FixedNavigation";
import { getLocalizedNavigation } from "@/lib/localized-navigation";
import clsx from "clsx";
import { type FC } from "react";

import AvatarDropdown from "@repo/design-system/ciseco/components/Header/AvatarDropdown";
import CartBtn from "@repo/design-system/ciseco/components/Header/CartBtn";
import HamburgerBtnMenu from "@repo/design-system/ciseco/components/Header/HamburgerBtnMenu";
import SearchBtnPopover from "@repo/design-system/ciseco/components/Header/SearchBtnPopover";
import Logo from "@repo/design-system/ciseco/components/shared/Logo/Logo";
import { getCollections } from "@repo/design-system/ciseco/data/data";

export interface Props {
  hasBorder?: boolean;
  locale?: string;
}

const LocalizedHeader2: FC<Props> = async ({
  hasBorder = true,
  locale = "en",
}) => {
  const navigationMenu = await getLocalizedNavigation(locale);
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
            <HamburgerBtnMenu />
          </div>

          <div className="flex items-center lg:flex-1">
            <Logo />
          </div>

          <div className="mx-4 hidden flex-2 justify-center lg:flex">
            <FixedNavigation
              featuredCollection={allCollections[10]}
              menu={navigationMenu}
            />
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

export default LocalizedHeader2;
