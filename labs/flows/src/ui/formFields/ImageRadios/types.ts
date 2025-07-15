import { IconProps } from '@tabler/icons-react';

export interface RadioItem {
  value: string;
  label: string;
  icon: React.ComponentType<IconProps>;
  helperText?: string;
}