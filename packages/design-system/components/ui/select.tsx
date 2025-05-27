'use client';

// Export Mantine Select components
export { Select, type SelectProps } from '@mantine/core';

// For compatibility with shadcn/ui compound components
export const SelectTrigger = ({ children, ...props }: any) => children;
export const SelectContent = ({ children, ...props }: any) => children;
export const SelectItem = ({ children, value, ...props }: any) => ({ label: children, value });
export const SelectValue = ({ ...props }: any) => null;
