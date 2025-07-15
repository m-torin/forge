/**
 * Tailwind v4 RSC Card Component
 * Server-side compatible card with Tailwind v4 styling
 */

import type { BaseProps } from '../types';

interface CardProps extends BaseProps {
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  const cardStyles = ['bg-white rounded-lg border border-gray-200 shadow-sm', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardStyles}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends BaseProps {}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  const headerStyles = ['px-6 py-4 border-b border-gray-200', className].filter(Boolean).join(' ');

  return <div className={headerStyles}>{children}</div>;
}

interface CardContentProps extends BaseProps {}

export function CardContent({ children, className = '' }: CardContentProps) {
  const contentStyles = ['px-6 py-4', className].filter(Boolean).join(' ');

  return <div className={contentStyles}>{children}</div>;
}

interface CardFooterProps extends BaseProps {}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  const footerStyles = ['px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg', className]
    .filter(Boolean)
    .join(' ');

  return <div className={footerStyles}>{children}</div>;
}
