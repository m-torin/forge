// TagForm.tsx
'use client';

import React from 'react';
import { TextInput, Button, Select } from '@mantine/core';
import { TagFormProps } from './types';

export const TagForm: React.FC<TagFormProps> = ({
  form,
  onSubmit,
  tagGroups,
  isPending,
}) => {
  const tagGroupOptions = tagGroups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  return (
    <form onSubmit={onSubmit}>
      <TextInput
        label="Tag Name"
        placeholder="Enter tag name"
        {...form.getInputProps('name')}
        required
        mb="sm"
      />
      <Select
        label="Tag Group"
        placeholder="Select a tag group (Optional)"
        data={tagGroupOptions}
        {...form.getInputProps('tagGroupId')}
        mb="sm"
        disabled={tagGroups.length === 0}
        nothingFoundMessage="No tag groups available"
      />
      <Button type="submit" mt="sm" loading={isPending}>
        Submit
      </Button>
    </form>
  );
};
