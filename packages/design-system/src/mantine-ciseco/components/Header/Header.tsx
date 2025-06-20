import clsx from 'clsx';
import { type FC } from 'react';

import { TCollection, TNavigationItem } from '../../data/types';
import Logo from '../shared/Logo/Logo';

import AvatarDropdown from './AvatarDropdown';
import CartBtn from './CartBtn';
import CategoriesDropdown from './CategoriesDropdown';
import CurrLangDropdown from './CurrLangDropdown';
import HamburgerBtnMenu from './HamburgerBtnMenu';
import { MegaMenuPopover } from './MegaMenuPopover';
import SearchBtnPopover from './SearchBtnPopover';

export interface HeaderProps extends Record<string, any> {
  announcementText?: string;
  breadcrumbs?: {
    href: string;
    label: string;
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
    children?: {
      href: string;
      label: string;
    }[];
    label: string;
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
    avatar?: string;
    email: string;
    name: string;
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
  const megamenu: TNavigationItem = {
    children: [],
    id: '1',
    name: 'Templates',
    type: 'mega-menu',
  };
  const dropdownCategories: {
    description: string;
    handle: string;
    icon: string;
    name: string;
  }[] = [];
  const currencies: {
    active?: boolean;
    href: string;
    icon: string;
    id: string;
    name: string;
  }[] = [];
  const languages: { description: string; id: string; locale: string; name: string }[] = [];
  const featuredCollections: TCollection[] = [];

  return (
    <header className="relative z-10" data-testid={testId} role="banner">
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
            {dropdownCategories.length > 0 && (
              <CategoriesDropdown categories={dropdownCategories} className="hidden md:block" />
            )}
          </div>

          <nav
            aria-label="Main navigation"
            className="flex flex-1 items-center justify-end gap-x-2.5 sm:gap-x-5"
            data-testid={`${testId}-navigation`}
          >
            <div className="block lg:hidden">
              <HamburgerBtnMenu aria-label="Toggle menu" onClick={onMenuClick} />
            </div>
            {featuredCollections[0] && megamenu.children && megamenu.children.length > 0 && (
              <MegaMenuPopover featuredCollection={featuredCollections[0]} megamenu={megamenu} />
            )}
            {(currencies.length > 0 || languages.length > 0) && (
              <CurrLangDropdown
                className="hidden md:block"
                currencies={currencies}
                currentLocale={currentLocale}
                languages={languages}
              />
            )}
            <SearchBtnPopover data-testid={`${testId}-search`} />
            <AvatarDropdown data-testid={`${testId}-user-menu`} />
            <CartBtn
              aria-label="Shopping cart"
              data-testid={`${testId}-cart`}
              onClick={onCartClick}
            />
          </nav>
        </div>
      </div>
    </header>
  );
};

export { Header };
export default Header;
