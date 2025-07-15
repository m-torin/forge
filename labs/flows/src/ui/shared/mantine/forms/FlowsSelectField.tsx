import React, { memo, forwardRef } from 'react';
import { Select, SelectProps } from '@mantine/core';
import classes from './FlowsSelectField.module.scss';

/**
 * Props for FlowsSelectField component.
 * Extends Mantine's SelectProps to inherit all select input properties.
 */
interface FlowsSelectFieldProps extends SelectProps {
  // Inherits classNames from SelectProps without redefinition
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
      // Handle classNames which can be an object or function
      const computedClassNames = classNames && typeof classNames === 'object' ? {
        input: error ? classes.invalid : (classNames.input ?? ''),
        wrapper: classNames.wrapper ?? '',
        label: classNames.label ?? '',
        ...classNames,
      } : {
        input: error ? classes.invalid : '',
        wrapper: '',
        label: '',
      };

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
