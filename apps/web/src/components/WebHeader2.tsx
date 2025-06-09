import { getCollections, getNavigation } from "@/lib/data-service";
import clsx from "clsx";

import {
  AvatarDropdown,
  Logo,
  Navigation,
  SearchBtnPopover,
} from "@repo/design-system/mantine-ciseco";

import ContextualCartBtn from "./ContextualCartBtn";
import ContextualHamburgerBtn from "./ContextualHamburgerBtn";

export interface WebHeader2Props {
  hasBorder?: boolean;
}

export default async function WebHeader2({
  hasBorder = true,
}: WebHeader2Props) {
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
            <ContextualHamburgerBtn />
          </div>

          <div className="flex items-center lg:flex-1">
            <Logo />
          </div>

          <div className="mx-4 hidden flex-2 justify-center lg:flex">
            <Navigation
              featuredCollection={allCollections?.[10]}
              menu={navigationMenu}
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5">
            <SearchBtnPopover />
            <AvatarDropdown />
            <ContextualCartBtn />
          </div>
        </div>
      </div>
    </div>
  );
}
