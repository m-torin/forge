// For compatibility, re-export Accordion sub-components
import { Accordion } from '@mantine/core';

('use client');

// Export Mantine Accordion components
export { Accordion, type AccordionProps } from '@mantine/core';
export const AccordionItem = Accordion.Item;
export const AccordionTrigger = Accordion.Control;
export const AccordionContent = Accordion.Panel;
