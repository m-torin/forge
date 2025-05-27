// For compatibility, re-export Popover sub-components
import { Popover } from '@mantine/core';

('use client');

// Export Mantine Popover components
export { Popover, type PopoverProps } from '@mantine/core';
export const PopoverTrigger = Popover.Target;
export const PopoverContent = Popover.Dropdown;
