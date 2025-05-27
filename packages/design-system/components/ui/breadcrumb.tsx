// Export Mantine Breadcrumbs as Breadcrumb
import { Breadcrumbs, type BreadcrumbsProps } from '@mantine/core';
import * as React from 'react';

export const Breadcrumb = Breadcrumbs;
export type BreadcrumbProps = BreadcrumbsProps;

// Compatibility components
export const BreadcrumbList = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const BreadcrumbItem = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const BreadcrumbLink = ({ children, ...props }: any) => <a {...props}>{children}</a>;
export const BreadcrumbSeparator = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const BreadcrumbPage = ({ children }: { children: React.ReactNode }) => (
  <span>{children}</span>
);
