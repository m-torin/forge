import { type Route } from 'next';

export interface CustomLink {
  href: Route;
  label: string;
  targetBlank?: boolean;
}

export interface TCollection {
  color?: string;
  count?: number;
  description?: string;
  handle: string;
  id: string;
  image?: TProductImage;
  sortDescription?: string;
  title: string;
}

export interface TCurrency {
  active?: boolean;
  href: string;
  icon: string;
  id: string;
  name: string;
}

export interface TDropdownCategory {
  description: string;
  handle: string;
  icon: string;
  name: string;
}

export interface TLanguage {
  description: string;
  id: string;
  locale: string;
  name: string;
}

export interface TNavigationItem {
  children?: TNavigationItem[];
  href?: Route;
  id: string;
  isNew?: boolean;
  name: string;
  type?: 'dropdown' | 'mega-menu' | 'none';
}

export interface TProductImage {
  alt?: string;
  height: number;
  src: string;
  width: number;
}

// Header-specific props interfaces
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

export interface Header2Props extends Record<string, any> {
  featuredCollection?: TCollection;
  hasBorder?: boolean;
  navigationMenu?: TNavigationItem[];
}

export interface NavigationProps extends Record<string, any> {
  className?: string;
  currentPath?: string;
  'data-testid'?: string;
  featuredCollection?: TCollection;
  items?: {
    badge?:
      | string
      | {
          color: string;
          text: string;
        };
    children?: {
      href: string;
      label: string;
    }[];
    href: string;
    icon?: string;
    label: string;
    megaMenu?: {
      columns: {
        items: {
          href: string;
          label: string;
        }[];
        title: string;
      }[];
    };
    onClick?: () => void;
  }[];
  menu: TNavigationItem[];
  orientation?: 'horizontal' | 'vertical';
  responsive?: boolean;
  styles?: {
    activeItem: string;
    dropdown: string;
    item: string;
  };
}

export interface SidebarNavigationProps extends Record<string, any> {
  data: TNavigationItem[];
}
