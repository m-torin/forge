import Link from 'next/link';
import { type ButtonHTMLAttributes } from 'react';
import { type Route } from 'next';

type ButtonPrimaryProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: Route<string>;
  sizeClass?: string;
  targetBlank?: boolean;
  fontSize?: string;
};

export default function ButtonPrimary({ className = '', href, sizeClass = '', targetBlank, fontSize = '', ...args }: ButtonPrimaryProps) {
  const classes = `ttnc-ButtonPrimary disabled:bg-opacity-70 bg-primary-6000 hover:bg-primary-700 text-neutral-50 bg-primary-6000 ${sizeClass} ${fontSize} ${className}`;

  if (href) {
    return (
      <Link 
        href={href}
        className={classes}
        target={targetBlank ? '_blank' : undefined}
        rel={targetBlank ? 'noopener noreferrer' : undefined}
      >
        {args.children}
      </Link>
    );
  }

  return <button className={classes} {...args} />;
}
