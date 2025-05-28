'use client';

// Export Mantine Tooltip components
export { Tooltip, type TooltipProps } from '@mantine/core';

// For compatibility with shadcn/ui compound components
export const TooltipTrigger = ({ children }: { children: React.ReactNode }) => children;
export const TooltipContent = ({ children }: { children: React.ReactNode }) => children;
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => children;
