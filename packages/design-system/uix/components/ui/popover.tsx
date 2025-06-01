'use client';

// For compatibility
import { Popover } from '@mantine/core';

// Export Mantine Popover directly
export { Popover, type PopoverProps } from '@mantine/core';
export const PopoverTrigger = Popover.Target;
export const PopoverContent = Popover.Dropdown;
