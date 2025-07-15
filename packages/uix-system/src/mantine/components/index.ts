/**
 * @repo/uix-system/mantine/components
 *
 * Generic/DRY Mantine v8 components
 * Domain-specific components are at the mantine root level
 */

// Authentication components
export * from './auth';

// Generic components
export { DataTable } from './DataTable';
export { PageHeader } from './PageHeader';
export { StatsCard } from './StatsCard';

// Type exports
export type { Action, BulkAction, Column, DataTableProps, EmptyState } from './DataTable';
export type { PageHeaderAction, PageHeaderProps } from './PageHeader';
export type { StatsCardProps } from './StatsCard';
