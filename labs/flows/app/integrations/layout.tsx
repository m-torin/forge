import { NavbarSimpleColored } from '#/ui/app/navbar';
import { Portal } from '@mantine/core';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <Portal target="#applayout-sidebar">
        <NavbarSimpleColored />
      </Portal>
    </>
  );
}
