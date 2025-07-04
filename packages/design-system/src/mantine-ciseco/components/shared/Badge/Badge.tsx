import Link from 'next/link';
import React, { type FC, type ReactNode } from 'react';

import { type TwMainColor } from '../../../data/types';
import { type Route } from '../../../routers/types';

export interface BadgeProps extends Record<string, any> {
  className?: string;
  color?: TwMainColor;
  'data-testid'?: string;
  href?: Route;
  name: ReactNode;
}

const Badge: FC<BadgeProps> = ({
  className = 'relative',
  color = 'blue',
  'data-testid': testId = 'badge',
  href,
  name,
}) => {
  const getColorClass = (hasHover: any = true) => {
    switch (color) {
      case 'blue':
        return `text-blue-800 bg-blue-100 ${hasHover ? 'hover:bg-blue-800' : ''}`;
      case 'gray':
        return `text-gray-800 bg-gray-100 ${hasHover ? 'hover:bg-gray-800' : ''}`;
      case 'green':
        return `text-green-800 bg-green-100 ${hasHover ? 'hover:bg-green-800' : ''}`;
      case 'indigo':
        return `text-indigo-800 bg-indigo-100 ${hasHover ? 'hover:bg-indigo-800' : ''}`;
      case 'pink':
        return `text-pink-800 bg-pink-100 ${hasHover ? 'hover:bg-pink-800' : ''}`;
      case 'purple':
        return `text-purple-800 bg-purple-100 ${hasHover ? 'hover:bg-purple-800' : ''}`;
      case 'red':
        return `text-red-800 bg-red-100 ${hasHover ? 'hover:bg-red-800' : ''}`;
      case 'yellow':
        return `text-yellow-800 bg-yellow-100 ${hasHover ? 'hover:bg-yellow-800' : ''}`;
      default:
        return `text-pink-800 bg-pink-100 ${hasHover ? 'hover:bg-pink-800' : ''}`;
    }
  };

  const CLASSES = 'nc-Badge inline-flex px-2.5 py-1 rounded-full font-medium text-xs ' + className;
  return href ? (
    <Link
      className={`transition-colors hover:text-white duration-300 ${CLASSES} ${getColorClass()}`}
      data-testid={testId}
      href={href || ''}
    >
      {name}
    </Link>
  ) : (
    <span className={`${CLASSES} ${getColorClass(false)} ${className}`} data-testid={testId}>
      {name}
    </span>
  );
};

export default Badge;
