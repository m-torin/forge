import { cn } from '#/lib/utils';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CustomLinkProps extends React.LinkHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

const CustomLink = ({
  href,
  children,
  className,
  ...rest
}: CustomLinkProps) => {
  const isInternalLink = href.startsWith('/');
  const isAnchorLink = href.startsWith('#');

  if (isInternalLink || isAnchorLink) {
    const { as: _as, onMouseEnter, onMouseLeave, onTouchStart, onTouchEnd, onClick, ...linkProps } = rest;
    return (
      <Link 
        href={href} 
        className={className} 
        {...(onMouseEnter && { onMouseEnter })}
        {...(onMouseLeave && { onMouseLeave })}
        {...(onTouchStart && { onTouchStart })}
        {...(onTouchEnd && { onTouchEnd })}
        {...(onClick && { onClick })}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const { as: _as2, onMouseEnter, onMouseLeave, onTouchStart, onTouchEnd, onClick, ...linkProps } = rest;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1 align-baseline underline underline-offset-4',
        className,
      )}
      {...(onMouseEnter && { onMouseEnter })}
      {...(onMouseLeave && { onMouseLeave })}
      {...(onTouchStart && { onTouchStart })}
      {...(onTouchEnd && { onTouchEnd })}
      {...(onClick && { onClick })}
      {...linkProps}
    >
      <span>{children}</span>
      <ExternalLink className="ml-0.5 inline-block h-4 w-4" />
    </Link>
  );
};

export default CustomLink;
