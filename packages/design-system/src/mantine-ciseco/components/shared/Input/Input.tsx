import React, { type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  'data-testid'?: string;
  fontClass?: string;
  rounded?: string;
  sizeClass?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      children: _children,
      className = '',
      'data-testid': testId = 'input-field',
      fontClass = 'text-sm font-normal',
      rounded = 'rounded-full',
      sizeClass = 'h-11 px-4 py-3',
      type = 'text',
      ...args
    },
    ref,
  ) => {
    return (
      <input
        className={`block w-full border border-neutral-200 bg-white focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 disabled:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-primary-600/25 dark:disabled:bg-neutral-800 ${rounded} ${fontClass} ${sizeClass} ${className}`}
        data-testid={testId}
        ref={ref}
        type={type}
        {...args}
      />
    );
  },
);

export { Input };
export default Input;
