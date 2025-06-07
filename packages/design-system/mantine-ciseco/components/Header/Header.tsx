import clsx from 'clsx';
import { type FC } from 'react';

import Logo from '../shared/Logo/Logo';

import AvatarDropdown from './AvatarDropdown';
import CartBtn from './CartBtn';
import CategoriesDropdown from './CategoriesDropdown';
import CurrLangDropdown from './CurrLangDropdown';
import HamburgerBtnMenu from './HamburgerBtnMenu';
import MegaMenuPopover from './MegaMenuPopover';
import SearchBtnPopover from './SearchBtnPopover';

export interface HeaderProps {
  announcementText?: string;
  breadcrumbs?: {
    label: string;
    href: string;
  }[];
  cartCount?: number;
  currentLanguage?: string;
  currentLocale?: string;
  hasBorderBottom?: boolean;
  languages?: {
    code: string;
    name: string;
  }[];
  logo?: React.ReactNode;
  megaMenu?: boolean;
  menuItems?: {
    label: string;
    children?: {
      label: string;
      href: string;
    }[];
  }[];
  notificationCount?: number;
  onCartClick?: () => void;
  onMenuClick?: () => void;
  onMenuToggle?: () => void;
  onSearch?: (query: string) => void;
  searchSuggestions?: string[];
  showCart?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  showThemeToggle?: boolean;
  sticky?: boolean;
  testId?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

const Header: FC<HeaderProps> = ({
  currentLocale,
  hasBorderBottom = true,
  onCartClick,
  onMenuClick,
  testId = 'header',
}) => {
  // Mock data for testing - in real implementation these would be props or from context
  const megamenu = [];
  const dropdownCategories = [];
  const currencies = [];
  const languages = [];
  const featuredCollections = [];

  return (
    <header data-testid={testId} role="banner" className="relative z-10">
      <div className="container">
        <div
          className={clsx(
            'flex h-20 justify-between gap-x-2.5 border-neutral-200 dark:border-neutral-700',
            hasBorderBottom && 'border-b',
            !hasBorderBottom && 'has-[.header-popover-full-panel]:border-b',
          )}
        >
          <div className="flex items-center justify-center gap-x-3 sm:gap-x-8">
            <Logo data-testid={`${testId}-logo`} />
            <div className="hidden h-9 border-l border-neutral-200 md:block dark:border-neutral-700" />
            <CategoriesDropdown categories={dropdownCategories} className="hidden md:block" />
          </div>

          <nav
            data-testid={`${testId}-navigation`}
            className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5"
            aria-label="Main navigation"
          >
            <div className="block lg:hidden">
              <HamburgerBtnMenu onClick={onMenuClick} aria-label="Toggle menu" />
            </div>
            <MegaMenuPopover featuredCollection={featuredCollections[0]} megamenu={megamenu} />
            <CurrLangDropdown
              currentLocale={currentLocale}
              className="hidden md:block"
              currencies={currencies}
              languages={languages}
            />
            <SearchBtnPopover data-testid={`${testId}-search`} />
            <AvatarDropdown data-testid={`${testId}-user-menu`} />
            <CartBtn
              data-testid={`${testId}-cart`}
              onClick={onCartClick}
              aria-label="Shopping cart"
            />
          </nav>
        </div>
      </div>
    </header>
  );
};

export { Header };
export default Header;
