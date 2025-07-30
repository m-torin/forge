// SecretForm.tsx
'use client';

import React, { memo, FC } from 'react';
import {
  TextInput,
  PasswordInput,
  Select,
  Checkbox,
  Button,
  Group,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { SecretCategory } from '@prisma/client';
import { categoryOptions } from './constants';

export type SecretFormValues = {
  secretName: string;
  secretValue: string;
  category: SecretCategory;
  shouldEncrypt: boolean;
};

interface SecretFormProps {
  form: UseFormReturnType<SecretFormValues>;
  handleSubmit: (values: SecretFormValues) => Promise<void>;
  isLoading: boolean;
}

export const SecretForm: FC<SecretFormProps> = memo(
  ({ form, handleSubmit, isLoading }) => (
    <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group grow>
          <TextInput
            label="Secret Name"
            placeholder="Enter secret name"
            error={form.errors.secretName}
            {...form.getInputProps('secretName')}
            required
          />
          <PasswordInput
            label="Secret"
            placeholder="Enter secret"
            error={form.errors.secretValue}
            {...form.getInputProps('secretValue')}
            required
          />
        </Group>

        <Group mt="md" grow>
          <Select
            label="Category"
            placeholder="Select category"
            data={categoryOptions}
            error={form.errors.category}
            {...form.getInputProps('category')}
            required
          />
          <Checkbox
            label="Encrypt this secret?"
            checked={form.values.shouldEncrypt}
            onChange={(event) =>
              form.setFieldValue('shouldEncrypt', event.currentTarget.checked)
            }
          />

          <Button type="submit" disabled={isLoading}>
            Add Secret
          </Button>
        </Group>
      </form>
  ),
);
