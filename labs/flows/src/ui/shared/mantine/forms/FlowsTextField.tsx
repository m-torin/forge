// src/components/FormFields/FlowsTextField.tsx

import React, { memo, forwardRef } from 'react';
import { TextInput, TextInputProps } from '@mantine/core';
import classes from './FlowsTextField.module.scss';

/**
 * Props for FlowsTextField component.
 * Extends Mantine's TextInputProps to inherit all text input properties.
 */
interface FlowsTextFieldProps extends TextInputProps {
  // Inherits classNames from TextInputProps without redefinition
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
