import clsx from 'clsx';

export function Divider({
  className,
  soft = false,
  ...props
}: { soft?: boolean } & React.ComponentPropsWithoutRef<'hr'>) {
  return (
    <hr
      role="presentation"
      {...props}
      className={clsx(
        className,
        'w-full border-t',
        soft && 'border-neutral-950/5 dark:border-white/5',
        !soft && 'border-neutral-950/10 dark:border-white/10',
      )}
    />
  );
}
