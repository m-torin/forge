/**
 * @repo/uix-system/mantine
 *
 * Mantine v8 design system utilities, constants, types, and components
 */

// Core Mantine utilities (types handled by backstage)
export * from './constants';
export * from './utils';

// Re-export specific non-conflicting components
export { DataTable, StatsCard } from './components';
export type { DataTableProps, PageHeaderAction, StatsCardProps } from './components';

// Backstage components removed - no longer available

// Auth components (convenience export)
export * from './components/auth';
