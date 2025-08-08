'use client';

import { useFocusTrap } from '@mantine/hooks';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
}

export function FocusTrap({ children, isActive }: FocusTrapProps) {
  const focusTrapRef = useFocusTrap(isActive);

  return <div ref={focusTrapRef}>{children}</div>;
}
