// Use Mantine Charts
export * from '@mantine/charts';

// Compatibility exports for shadcn/ui chart config
export const ChartContainer = ({ _config, children }: any) => <div>{children}</div>;
export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
export type ChartConfig = Record<string, any>;
