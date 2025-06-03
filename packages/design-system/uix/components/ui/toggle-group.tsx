// Use Mantine SegmentedControl as ToggleGroup
export {
  SegmentedControl as ToggleGroup,
  type SegmentedControlProps as ToggleGroupProps,
} from '@mantine/core';

// For compatibility - a proper React component
export const ToggleGroupItem = ({
  children,
  value,
  ...props
}: {
  children?: React.ReactNode;
  value?: string;
  [key: string]: any;
}) => (
  <span {...props} data-value={value}>
    {children}
  </span>
);
