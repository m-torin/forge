import clsx from 'clsx';

interface DividerProps {
  className?: string;
  'data-testid'?: string;
}

export const Divider = ({ className, 'data-testid': testId = 'divider' }: DividerProps) => {
  return (
    <div
      className={clsx('border-t border-neutral-200 dark:border-neutral-700', className)}
      data-testid={testId}
    />
  );
};
