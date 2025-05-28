'use client';

// Export Mantine Select components
export { Select, type SelectProps } from '@mantine/core';

// For compatibility with shadcn/ui compound components
export const SelectTrigger = ({ _props, children }: any) => <div>{children}</div>;
export const SelectValue = ({ _props, children }: any) => <span>{children}</span>;
export const SelectContent = ({ _props, children }: any) => <div>{children}</div>;
export const SelectItem = ({ _props, children }: any) => <div>{children}</div>;
