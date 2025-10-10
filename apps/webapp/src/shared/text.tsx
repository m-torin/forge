import clsx from 'clsx';
import { Link } from './link';

interface TextProps extends React.ComponentPropsWithoutRef<'p'> {
  truncate?: boolean;
  responsive?: boolean;
  clamp?: number;
  lineHeight?: string;
}

export function Text({ className, truncate, responsive, clamp, lineHeight, ...props }: TextProps) {
  return (
    <p
      data-slot="text"
      {...props}
      className={clsx(
        className,
        'text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400',
        truncate && 'truncate',
        responsive && 'text-sm sm:text-base md:text-lg',
        clamp && `line-clamp-${clamp}`,
        lineHeight && `leading-${lineHeight}`,
      )}
    />
  );
}

export function TextLink({ className, ...props }: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <Link
      {...props}
      className={clsx(
        className,
        'data-hover:decoration-zinc-950 dark:data-hover:decoration-white text-zinc-950 underline decoration-zinc-950/50 dark:text-white dark:decoration-white/50',
      )}
    />
  );
}

export function Strong({ className, ...props }: React.ComponentPropsWithoutRef<'strong'>) {
  return (
    <strong {...props} className={clsx(className, 'font-medium text-zinc-950 dark:text-white')} />
  );
}

export function Code({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        'rounded-sm border border-zinc-950/10 bg-zinc-950/[2.5%] px-0.5 text-sm font-medium text-zinc-950 sm:text-[0.8125rem] dark:border-white/20 dark:bg-white/5 dark:text-white',
      )}
    />
  );
}
