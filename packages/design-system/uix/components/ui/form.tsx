'use client';

// Export Mantine form utilities
export { useForm } from '@mantine/form';
export type { UseFormInput, UseFormReturnType } from '@mantine/form';

// For compatibility, we'll provide a minimal wrapper
// Most components should use Mantine form components directly
export const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
  <form {...props}>{children}</form>
);

// These are no-op exports for compatibility with existing code
// Components should be updated to use Mantine form components directly
export const FormField = ({ children }: { children: React.ReactNode }) => children;
export const FormItem = ({ children }: { children: React.ReactNode }) => children;
export const FormLabel = ({ children }: { children: React.ReactNode }) => children;
export const FormControl = ({ children }: { children: React.ReactNode }) => children;
export const FormDescription = ({ children }: { children: React.ReactNode }) => children;
export const FormMessage = ({ children }: { children: React.ReactNode }) => children;

// Re-export commonly used Mantine form components
export {
  Checkbox,
  type CheckboxProps,
  FileInput,
  type FileInputProps,
  MultiSelect,
  type MultiSelectProps,
  NumberInput,
  type NumberInputProps,
  PasswordInput,
  type PasswordInputProps,
  Radio,
  type RadioProps,
  Select,
  type SelectProps,
  Switch,
  type SwitchProps,
  Textarea,
  type TextareaProps,
  TextInput,
  type TextInputProps,
} from '@mantine/core';

// Date components from @mantine/dates
export {
  DateInput,
  type DateInputProps,
  DatePicker,
  type DatePickerProps,
  TimeInput,
  type TimeInputProps,
} from '@mantine/dates';

export {
  DatePickerInput,
  type DatePickerInputProps,
  DateTimePicker,
  type DateTimePickerProps,
  MonthPicker,
  type MonthPickerProps,
  YearPicker,
  type YearPickerProps,
} from '@mantine/dates';
