import clsx from 'clsx';

interface DividerProps {
  className?: string;
}

export const Divider = ({ className }: DividerProps) => {
  return <div className={clsx('border-t border-neutral-200 dark:border-neutral-700', className)} />;
};
