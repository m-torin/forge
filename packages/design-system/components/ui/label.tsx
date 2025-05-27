// Export Mantine Text as Label for form labels
import { Text, type TextProps } from '@mantine/core';
import * as React from 'react';

export const Label = React.forwardRef<HTMLLabelElement, TextProps & { htmlFor?: string }>(
  ({ htmlFor, ...props }, ref) => (
    <Text ref={ref} component="label" htmlFor={htmlFor} fw={500} size="sm" {...props} />
  ),
);

Label.displayName = 'Label';

export type LabelProps = TextProps & { htmlFor?: string };
