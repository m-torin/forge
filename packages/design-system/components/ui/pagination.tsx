// Export Mantine Pagination components
export { Pagination, type PaginationProps } from '@mantine/core';

// For compatibility with shadcn/ui compound components
export const PaginationContent = ({ children }: { children: React.ReactNode }) => children;
export const PaginationItem = ({ children }: { children: React.ReactNode }) => children;
export const PaginationLink = ({ children }: { children: React.ReactNode }) => children;
export const PaginationNext = ({ children }: { children: React.ReactNode }) => children;
export const PaginationPrevious = ({ children }: { children: React.ReactNode }) => children;
export const PaginationEllipsis = () => <span>...</span>;
