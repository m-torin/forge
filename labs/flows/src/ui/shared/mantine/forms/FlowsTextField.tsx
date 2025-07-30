// src/components/FormFields/FlowsTextField.tsx

import React, { memo, forwardRef } from 'react';
import { TextInput, TextInputProps } from '@mantine/core';
import classes from './FlowsTextField.module.scss';

/**
 * Props for FlowsTextField component.
 * Extends Mantine's TextInputProps to inherit all text input properties.
 */
interface FlowsTextFieldProps extends TextInputProps {
  // Extend with any additional custom props if needed
  classNames?: TextInputProps['classNames'];
}

/**
 * FlowsTextField Component: Reusable component for text input with validation and accessibility.
 * Supports forwarding refs to the underlying TextInput component.
 *
 * @param {FlowsTextFieldProps} props - The props for the FlowsTextField component.
 * @param {React.Ref<HTMLInputElement>} ref - The ref forwarded to the TextInput.
 * @returns {JSX.Element} The rendered text field.
 */
export const FlowsTextField = memo(
  forwardRef<HTMLInputElement, FlowsTextFieldProps>(
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
          <TextInput
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
