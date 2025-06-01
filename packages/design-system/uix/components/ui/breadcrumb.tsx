// Export Mantine Breadcrumbs as Breadcrumb
import { Breadcrumbs, type BreadcrumbsProps } from '@mantine/core';

import type * as React from 'react';

export const Breadcrumb = Breadcrumbs;
export type BreadcrumbProps = BreadcrumbsProps;

// Compatibility components
export const BreadcrumbList = ({ children }: { children: React.ReactNode }) => children;
export const BreadcrumbItem = ({ children }: { children: React.ReactNode }) => children;
export const BreadcrumbLink = ({
  _href,
  children,
}: {
  children: React.ReactNode;
  _href?: string;
}) => children;
export const BreadcrumbPage = ({ children }: { children: React.ReactNode }) => children;
export const BreadcrumbSeparator = ({ children }: { children: React.ReactNode }) => children;
export const BreadcrumbEllipsis = ({ children }: { children: React.ReactNode }) => children;
