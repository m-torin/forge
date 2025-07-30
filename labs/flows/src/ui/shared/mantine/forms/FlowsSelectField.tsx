import React, { memo, forwardRef } from 'react';
import { Select, SelectProps } from '@mantine/core';
import classes from './FlowsSelectField.module.scss';

/**
 * Props for FlowsSelectField component.
 * Extends Mantine's SelectProps to inherit all select input properties.
 * Additionally allows any other arbitrary props including flexible classNames.
 */
interface FlowsSelectFieldProps extends SelectProps {
  classNames?: SelectProps['classNames'];
}

/**
 * FlowsSelectField Component: Reusable component for select input with validation and accessibility.
 * Supports forwarding refs to the underlying Select component.
 *
 * @param {FlowsSelectFieldProps} props - The props for the FlowsSelectField component.
 * @param {React.Ref<HTMLInputElement>} ref - The ref forwarded to the Select component.
 * @returns {JSX.Element} The rendered select field.
 */
export const FlowsSelectField = memo(
  forwardRef<HTMLInputElement, FlowsSelectFieldProps>(
    ({ label, placeholder, error, classNames, ...rest }, ref) => {
      // Ensure classNames is an object before accessing its properties
      const computedClassNames =
        typeof classNames === 'object' && classNames !== null
          ? {
              input: error ? classes.invalid : classNames?.input,
              wrapper: classNames?.wrapper || '',
              label: classNames?.label || '',
              ...classNames,
            }
          : undefined;

      return (
        <div className={classes.fieldContainer}>
          <Select
            ref={ref}
            label={label}
            placeholder={placeholder}
            error={error}
            classNames={computedClassNames}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
            {...rest}
          />
          {error && (
            <span
              id={`${label}-error`}
              role="alert"
              aria-live="assertive"
              className={classes.errorText}
            >
              {error}
            </span>
          )}
        </div>
      );
    },
  ),
);
