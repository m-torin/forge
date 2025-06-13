'use client';
import { type FC } from 'react';

export interface RadioProps {
  className?: string;
  'data-testid'?: string;
  defaultChecked?: boolean;
  id: string;
  label?: string;
  name: string;
  onChange?: (value: string) => void;
  sizeClassName?: string;
}

const Radio: FC<RadioProps> = ({
  className = '',
  'data-testid': testId = 'radio',
  defaultChecked,
  id,
  label,
  name,
  onChange,
  sizeClassName = 'w-6 h-6',
}) => {
  return (
    <div className={`flex items-center text-sm sm:text-base ${className}`}>
      <input
        className={`focus:ring-action-primary rounded-full border-neutral-400 bg-transparent text-primary-500 hover:border-neutral-700 focus:ring-primary-500 dark:border-neutral-700 dark:checked:bg-primary-500 dark:hover:border-neutral-500 ${sizeClassName}`}
        data-testid={testId}
        defaultChecked={defaultChecked}
        id={id}
        name={name}
        type="radio"
        value={id}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
      {label && (
        <label
          className="block pl-2.5 text-neutral-900 select-none sm:pl-3 dark:text-neutral-100"
          dangerouslySetInnerHTML={{ __html: label }}
          htmlFor={id}
        />
      )}
    </div>
  );
};

export default Radio;
