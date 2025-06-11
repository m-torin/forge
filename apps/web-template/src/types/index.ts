// Placeholder types for AppLayout
export interface TCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
}

export interface TNavigationItem {
  id: string;
  name: string;
  href: string;
  children?: TNavigationItem[];
}