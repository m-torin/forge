// Export Mantine Alert directly
export { Alert, type AlertProps } from '@mantine/core';

// For compatibility with shadcn/ui compound components
export const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{children}</div>
);
export const AlertDescription = ({ children }: { children: React.ReactNode }) => children;
