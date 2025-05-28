'use client';

// For compatibility, re-export Tabs sub-components
import { Tabs } from '@mantine/core';

// Export Mantine Tabs components
export { Tabs, type TabsProps } from '@mantine/core';
export const TabsList = Tabs.List;
export const TabsTrigger = Tabs.Tab;
export const TabsContent = Tabs.Panel;
