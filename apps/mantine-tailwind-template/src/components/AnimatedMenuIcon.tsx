'use client';

import { IconMenu2, IconX } from '@tabler/icons-react';

interface AnimatedMenuIconProps {
  isOpen: boolean;
  size?: number;
}

export function AnimatedMenuIcon({ isOpen, size = 20 }: AnimatedMenuIconProps) {
  return (
    <div className="transition-transform duration-200">
      {isOpen ? <IconX size={size} /> : <IconMenu2 size={size} />}
    </div>
  );
}
