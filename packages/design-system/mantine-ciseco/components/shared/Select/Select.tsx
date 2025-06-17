import { type FC, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  'data-testid'?: string;
  sizeClass?: string;
}

const Select: FC<SelectProps> = ({
  children,
  className = '',
  'data-testid': testId = 'select',
  sizeClass = 'h-11',
  ...args
}) => {
  return (
    <select
      className={`${sizeClass} ${className} block w-full rounded-2xl border border-neutral-200 bg-white px-2.5 text-sm focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600/25`}
      data-testid={testId}
      {...args}
    >
      {children}
    </select>
  );
};

export { Select };
export default Select;
