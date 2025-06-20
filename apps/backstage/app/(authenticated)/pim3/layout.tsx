import { type ReactNode } from 'react';

export default function PIMLayout({ children }: { children: ReactNode }) {
  // Just render children - the parent AppShell handles the layout
  // PIM-specific navigation is handled through the parent's dropdown menu
  return <>{children}</>;
}
