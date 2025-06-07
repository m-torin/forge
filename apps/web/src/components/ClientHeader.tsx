"use client";

import clsx from "clsx";
import { type FC } from "react";

import {
  AvatarDropdown,
  CartBtn,
  HamburgerBtnMenu,
  Logo,
  SearchBtnPopover,
} from "@repo/design-system/mantine-ciseco";

export interface ClientHeaderProps {
  cartCount?: number;
  hasBorderBottom?: boolean;
  onCartClick?: () => void;
  onMenuClick?: () => void;
}

const ClientHeader: FC<ClientHeaderProps> = ({
  cartCount = 0,
  hasBorderBottom = true,
  onCartClick,
  onMenuClick,
}) => {
  return (
    <div className="relative z-10 w-full bg-white">
      <div
        className={clsx(
          "relative border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900",
          hasBorderBottom && "border-b",
        )}
      >
        <div className="relative flex h-20 items-center justify-between px-4 lg:px-8">
          <div className="flex flex-1 items-center justify-start">
            <HamburgerBtnMenu onClick={onMenuClick} />
            <Logo className="ml-4 lg:ml-0" />
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center">
            {/* Navigation could be added here if needed */}
          </div>

          <div className="flex flex-1 items-center justify-end space-x-1 lg:space-x-2">
            <SearchBtnPopover />
            <AvatarDropdown />
            <CartBtn onClick={onCartClick} numberItems={cartCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
