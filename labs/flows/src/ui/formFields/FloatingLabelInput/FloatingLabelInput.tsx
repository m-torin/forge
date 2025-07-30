'use client';

import { useState, FC, useEffect } from 'react';
import { TextInput, TextInputProps } from '@mantine/core';
import classes from './FloatingLabelInput.module.scss';

interface FloatingLabelInputProps extends TextInputProps {
  label: string;
  placeholder: string;
  value?: string;
}

export const FloatingLabelInput: FC<FloatingLabelInputProps> = ({
  label,
  placeholder,
  value: initialValue = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const floating = value.trim().length !== 0 || focused || undefined;

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      classNames={classes}
      data-floating={floating}
      labelProps={{ 'data-floating': floating }}
      mt="md"
      autoComplete="nope"
      {...props}
    />
  );
};
