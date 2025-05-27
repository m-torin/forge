// Use Mantine SegmentedControl as ToggleGroup
export {
  SegmentedControl as ToggleGroup,
  type SegmentedControlProps as ToggleGroupProps,
} from '@mantine/core';

// For compatibility
export const ToggleGroupItem = ({ children, value }: any) => ({ label: children, value });
