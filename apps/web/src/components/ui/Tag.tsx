'use client';

import { UnstyledButton } from '@mantine/core';
import Link from 'next/link';
import { type FC } from 'react';

export interface TagProps {
  children?: React.ReactNode;
  className?: string;
  count?: number;
  hideCount?: boolean;
  href?: string;
  onClick?: () => void;
}

const Tag: FC<TagProps> = ({
  hideCount = false,
  children,
  className = '',
  count = 22,
  href = '/blog',
  onClick,
}) => {
  const content = (
    <>
      {children}
      {!hideCount && <span className="text-xs font-normal opacity-75 ml-1">({count})</span>}
    </>
  );

  const baseStyles = `
    inline-block rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm text-neutral-600 
    hover:border-neutral-200 transition-colors dark:border-neutral-700 dark:bg-neutral-700 
    dark:text-neutral-400 dark:hover:border-neutral-600 ${className}
  `;

  if (onClick) {
    return (
      <UnstyledButton onClick={onClick} className={baseStyles}>
        {content}
      </UnstyledButton>
    );
  }

  return (
    <Link href={href} className={baseStyles}>
      {content}
    </Link>
  );
};

export default Tag;
