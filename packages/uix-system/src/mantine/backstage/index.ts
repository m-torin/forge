/**
 * @repo/uix-system/mantine/components/backstage
 *
 * Backstage admin components built with Mantine v8
 */

export { AppLayout } from './AppLayout';
export type { AppLayoutProps } from './AppLayout';
export { BackstageNavigation } from './BackstageNavigation';
export type { BackstageNavigationProps } from './BackstageNavigation';
export { ErrorBoundary } from './ErrorBoundary';
export { GlobalError } from './GlobalError';
export {
  AuthNavigation,
  CmsNavigation,
  NavigationGroup,
  NavigationItem,
  SidebarNavigation,
  WorkflowsNavigation,
} from './navigation';
export type { INavigationGroup, INavigationItem, NavigationProps } from './navigation';
export { NotFound } from './NotFound';

// CMS Components
export { CmsAllTable } from './CmsAllTable';
export type { AdditionalColumn, CmsAllTableProps, CmsTableItem } from './CmsAllTable';
export { CmsBulkEditTable } from './CmsBulkEditTable';
export type { CmsBulkEditTableProps } from './CmsBulkEditTable';
export { CmsListTable } from './CmsListTable';
export type { CmsListTableProps } from './CmsListTable';
export { CmsPageView } from './CmsPageView';
export type { CmsPageViewProps } from './CmsPageView';
