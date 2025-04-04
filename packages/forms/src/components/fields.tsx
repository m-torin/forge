'use client';

import React from 'react';
import {
  TextInput, TextInputProps,
  PasswordInput, PasswordInputProps,
  Textarea, TextareaProps,
  Select, SelectProps,
  MultiSelect, MultiSelectProps,
  Checkbox, CheckboxProps,
  Switch, SwitchProps,
  Radio, RadioGroupProps
} from '@mantine/core';
import { useFormContext } from '../core';

/**
 * Props for the Field component
 */
export interface FieldProps<T extends Record<string, any>> {
  /**
   * Field name (path to the field in the form values)
   */
  name: string;

  /**
   * Mantine component to render
   * Defaults to TextInput if not provided
   */
  component?: React.ComponentType<any>;

  /**
   * Field label
   * Will be overridden by registry config if present
   */
  label?: string;

  /**
   * Field description
   * Will be overridden by registry config if present
   */
  description?: string;

  /**
   * Whether the field is required
   * Will be overridden by registry config if present
   */
  required?: boolean;

  /**
   * Whether to disable the field
   */
  disabled?: boolean;

  /**
   * Additional props to pass to the component
   */
  [key: string]: any;
}

/**
 * Generic Field component that serves as a foundation for all field components
 * This component:
 * 1. Checks if the field should be visible based on registry relationships
 * 2. Gets field configuration from the registry
 * 3. Gets input props from Mantine's form
 * 4. Renders the specified component with all props merged in the correct order
 */
export function Field<T extends Record<string, any>>({
  name,
  component: Component = TextInput,
  label,
  description,
  required,
  disabled,
  ...props
}: FieldProps<T>) {
  // Get form from context
  const form = useFormContext<T>();

  // Check if field should be visible
  const visibleFields = form.getVisibleFields();
  if (!visibleFields.includes(name)) {
    return null;
  }

  // Get field configuration from registry
  const field = form.registry.getField(name);

  // Get input props from Mantine's form
  const inputProps = form.getInputProps(name);

  // Merge field configuration with props
  const fieldLabel = label ?? field?.label;
  const fieldDescription = description ?? field?.description;
  const fieldRequired = required ?? field?.required;

  // Render the component with all props merged in the correct order
  return (
    <Component
      label={fieldLabel}
      description={fieldDescription}
      required={fieldRequired}
      disabled={disabled}
      {...inputProps} // Mantine form props (value, onChange, error)
      {...props} // Custom props
    />
  );
}

/**
 * Text field types supported by TextField component
 */
export type TextFieldType = 'text' | 'password' | 'email' | 'url' | 'tel' | 'search' | 'textarea';

/**
 * Props for TextField component
 */
export interface TextFieldProps extends Omit<FieldProps<any>, 'component'> {
  /**
   * Type of text field
   */
  type?: TextFieldType;

  /**
   * Number of rows for textarea
   */
  rows?: number;

  /**
   * Whether to auto-grow textarea
   */
  autosize?: boolean;

  /**
   * Minimum rows for autosize textarea
   */
  minRows?: number;

  /**
   * Maximum rows for autosize textarea
   */
  maxRows?: number;
}

/**
 * TextField component that renders different types of text inputs
 * This component uses the Field component with the appropriate Mantine input component
 */
export function TextField({
  name,
  type,
  rows = 4,
  autosize = false,
  minRows,
  maxRows,
  ...rest
}: TextFieldProps) {
  const form = useFormContext();

  // Get field type from registry if not provided
  const field = form.registry.getField(name);
  const fieldType = type || field?.type || 'text';

  // Determine which component to use based on field type
  let Component: React.ComponentType<any>;
  let additionalProps = {};

  switch (fieldType) {
    case 'password':
      Component = PasswordInput;
      break;

    case 'textarea':
      Component = Textarea;
      additionalProps = {
        rows,
        autosize,
        minRows,
        maxRows
      };
      break;

    case 'email':
    case 'url':
    case 'tel':
    case 'search':
    case 'text':
    default:
      Component = TextInput;
      if (fieldType !== 'text') {
        additionalProps = { type: fieldType };
      }
      break;
  }

  // Use Field with the determined component
  return (
    <Field
      name={name}
      component={Component}
      {...additionalProps}
      {...rest}
    />
  );
}

/**
 * Checkbox field types supported by CheckboxField component
 */
export type CheckboxFieldType = 'checkbox' | 'switch';

/**
 * Props for CheckboxField component
 */
export interface CheckboxFieldProps extends Omit<FieldProps<any>, 'component'> {
  /**
   * Type of checkbox field
   */
  type?: CheckboxFieldType;

  /**
   * Label position
   */
  labelPosition?: 'right' | 'left';
}

/**
 * CheckboxField component that renders a checkbox or switch
 * This component uses the Field component with custom handling for boolean values
 */
export function CheckboxField({
  name,
  type = 'checkbox',
  labelPosition = 'right',
  ...rest
}: CheckboxFieldProps) {
  const form = useFormContext();

  // Get field type from registry if not provided
  const field = form.registry.getField(name);
  const fieldType = type || field?.type || 'checkbox';

  // Create a custom wrapper component that handles boolean values correctly
  const CheckboxWrapper = (props: any) => {
    const { value, onChange, ...otherProps } = props;

    // Convert value to checked prop
    const checked = Boolean(value);

    // Create onChange handler that converts event to boolean value
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.currentTarget.checked);
    };

    const Component = fieldType === 'switch' ? Switch : Checkbox;

    return (
      <Component
        checked={checked}
        onChange={handleChange}
        labelPosition={labelPosition}
        {...otherProps}
      />
    );
  };

  // Use Field with custom component
  return (
    <Field
      name={name}
      component={CheckboxWrapper}
      {...rest}
    />
  );
}

/**
 * Props for SelectField component
 */
export interface SelectFieldProps extends Omit<FieldProps<any>, 'component'> {
  /**
   * Whether to allow multiple selections
   */
  multiple?: boolean;

  /**
   * Data for select options
   */
  data: (string | { value: string; label: string; group?: string; disabled?: boolean })[];

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Whether to clear the search value when an option is selected
   */
  clearSearchOnSelect?: boolean;

  /**
   * Whether to clear the selection when the escape key is pressed
   */
  clearSearchOnEscape?: boolean;

  /**
   * Whether to allow deselecting options by clicking on the selected option
   */
  clearable?: boolean;

  /**
   * Whether to allow searching
   */
  searchable?: boolean;

  /**
   * Maximum height of the dropdown in pixels
   */
  maxDropdownHeight?: number;
}

/**
 * SelectField component that renders a select dropdown
 * This component uses the Field component with either Select or MultiSelect
 */
export function SelectField({
  name,
  multiple = false,
  data,
  placeholder,
  clearSearchOnSelect,
  clearSearchOnEscape,
  clearable,
  searchable,
  maxDropdownHeight,
  ...rest
}: SelectFieldProps) {
  // Determine which component to use based on multiple flag
  const Component = multiple ? MultiSelect : Select;

  // Common props for both Select and MultiSelect
  const selectProps = {
    data,
    placeholder,
    clearSearchOnSelect,
    clearSearchOnEscape,
    clearable,
    searchable,
    maxDropdownHeight
  };

  // Use Field with the determined component
  return (
    <Field
      name={name}
      component={Component}
      {...selectProps}
      {...rest}
    />
  );
}

/**
 * Props for RadioField component
 */
export interface RadioFieldProps extends Omit<FieldProps<any>, 'component'> {
  /**
   * Data for radio options
   */
  data: (string | { value: string; label: string; disabled?: boolean })[];

  /**
   * Orientation of the radio group
   */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * RadioField component that renders a radio group
 * This component uses the Field component with Radio.Group
 */
export function RadioField({
  name,
  data,
  orientation = 'vertical',
  ...rest
}: RadioFieldProps) {
  // Use Field with Radio.Group
  return (
    <Field
      name={name}
      component={Radio.Group}
      orientation={orientation}
      {...rest}
    >
      {data.map((item) => {
        const value = typeof item === 'string' ? item : item.value;
        const label = typeof item === 'string' ? item : item.label;
        const disabled = typeof item === 'string' ? false : item.disabled;

        return (
          <Radio key={value} value={value} label={label} disabled={disabled} />
        );
      })}
    </Field>
  );
}
