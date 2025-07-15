// TagGroupForm.tsx
'use client';

import React from 'react';
import { ColorInput, DEFAULT_THEME, Button, TextInput } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import { TagGroupFormProps } from './types';

export const TagGroupForm: React.FC<TagGroupFormProps> = ({
  form,
  onSubmit,
  isPending,
}) => {
  const swatches = Object.keys(DEFAULT_THEME.colors).map(
    (colorName) => DEFAULT_THEME.colors[colorName as MantineColor][4],
  );

  const swatchColorToNameMap: Record<string, MantineColor> = {};
  Object.keys(DEFAULT_THEME.colors).forEach((colorName) => {
    const colorCode = DEFAULT_THEME.colors[colorName as MantineColor][4];
    swatchColorToNameMap[colorCode] = colorName as MantineColor;
  });

  const colorValue = form.values.color
    ? DEFAULT_THEME.colors[form.values.color][4]
    : undefined;

  return (
    <form onSubmit={onSubmit}>
      <TextInput
        label="Name"
        placeholder="Enter group name"
        {...form.getInputProps('name')}
        required
        mb="sm"
      />
      <ColorInput
        label="Select Tag Color"
        placeholder="Click color swatch"
        closeOnColorSwatchClick
        swatches={swatches}
        swatchesPerRow={7}
        value={colorValue ?? ''}
        onChange={(colorCode) => {
          const colorName = swatchColorToNameMap[colorCode];
          if (colorName) {
            form.setFieldValue('color', colorName);
          }
        }}
        error={form.errors.color}
        required
        mb="sm"
      />
      <Button type="submit" mt="sm" loading={isPending}>
        Submit
      </Button>
    </form>
  );
};
