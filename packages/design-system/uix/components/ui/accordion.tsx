'use client';

// For compatibility, re-export Accordion sub-components
import {
  Accordion,
  type AccordionControlProps,
  type AccordionItemProps,
  type AccordionPanelProps,
} from '@mantine/core';

import type React from 'react';

// Export Mantine Accordion components
export { Accordion, type AccordionProps } from '@mantine/core';

// Re-export with explicit types
export const AccordionItem: React.FC<AccordionItemProps> = Accordion.Item;
export const AccordionTrigger: React.FC<AccordionControlProps> = Accordion.Control;
export const AccordionContent: React.FC<AccordionPanelProps> = Accordion.Panel;
