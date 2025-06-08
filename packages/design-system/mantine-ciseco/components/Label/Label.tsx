import React, { type FC } from 'react';

export interface LabelProps {
  children?: React.ReactNode;
  className?: string;
  'data-testid'?: string;
}

const Label: FC<LabelProps> = ({ children, className = '', 'data-testid': testId }) => {
  return (
    <label
      data-nc-id="Label"
      data-testid={testId}
      className={`nc-Label text-base font-medium text-neutral-900 dark:text-neutral-200 ${className}`}
    >
      {children}
    </label>
  );
};

export default Label;
