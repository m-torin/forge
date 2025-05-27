// Use Mantine Charts
export * from '@mantine/charts';

// Compatibility exports for shadcn/ui chart config
export const ChartContainer = ({ children, config }: any) => <div>{children}</div>;
export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
