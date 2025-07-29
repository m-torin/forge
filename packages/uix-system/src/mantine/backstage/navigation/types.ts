export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  badge?: string | number;
  'data-testid'?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  collapsed?: boolean;
  'data-testid'?: string;
}

export interface NavigationProps {
  items?: NavigationItem[];
  groups?: NavigationGroup[];
  className?: string;
  'data-testid'?: string;
}
