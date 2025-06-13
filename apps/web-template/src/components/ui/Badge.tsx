import { Badge as MantineBadge } from '@mantine/core';
import Link from 'next/link';
import { type FC, type ReactNode } from 'react';

export type BadgeColor = 'pink' | 'red' | 'gray' | 'green' | 'purple' | 'indigo' | 'yellow' | 'blue';

export interface BadgeProps {
  className?: string;
  color?: BadgeColor;
  href?: string;
  name: ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'filled' | 'outline' | 'dot';
}

const Badge: FC<BadgeProps> = ({ 
  name, 
  className = '', 
  color = 'blue', 
  href,
  size = 'sm',
  variant = 'light'
}) => {
  const getMantineColor = () => {
    switch (color) {
      case 'pink':
        return 'pink';
      case 'red':
        return 'red';
      case 'gray':
        return 'gray';
      case 'green':
        return 'green';
      case 'purple':
        return 'violet';
      case 'indigo':
        return 'indigo';
      case 'yellow':
        return 'yellow';
      case 'blue':
        return 'blue';
      default:
        return 'blue';
    }
  };

  const badge = (
    <MantineBadge
      color={getMantineColor()}
      variant={variant}
      size={size}
      className={className}
    >
      {name}
    </MantineBadge>
  );

  return href ? (
    <Link href={href} className="inline-block">
      {badge}
    </Link>
  ) : (
    badge
  );
};

export default Badge;