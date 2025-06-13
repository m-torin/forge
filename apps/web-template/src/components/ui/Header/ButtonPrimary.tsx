import Link from 'next/link';
import { type ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonPrimaryProps {
  className?: string;
  href?: string;
  targetBlank?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const ButtonPrimary = ({ className, href, targetBlank, children, onClick }: ButtonPrimaryProps) => {
  const baseClasses = clsx(
    'inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700',
    className,
  );

  if (href) {
    if (href.startsWith('http')) {
      return (
        <a
          className={baseClasses}
          href={href}
          rel={targetBlank ? 'noopener noreferrer' : undefined}
          target={targetBlank ? '_blank' : undefined}
        >
          {children}
        </a>
      );
    }

    return (
      <Link className={baseClasses} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default ButtonPrimary;
