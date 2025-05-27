// For compatibility
import { HoverCard } from '@mantine/core';

('use client');

// Export Mantine HoverCard
export { HoverCard, type HoverCardProps } from '@mantine/core';
export const HoverCardTrigger = HoverCard.Target;
export const HoverCardContent = HoverCard.Dropdown;
