'use client';

import React, { useEffect, useState, useCallback, memo } from 'react';
import { Select, Group, Loader } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { InfoTooltip } from './InfoTooltip';

interface Option {
  value: string;
  label: string;
}

interface AsyncSelectProps {
  label: string;
  placeholder: string;
  fetchOptions: () => Promise<Option[]>;
  formInputProps: any; // Adjust the type based on your form library
  required?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  nothingFound?: string;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = memo(
  ({
    label,
    placeholder,
    fetchOptions,
    formInputProps,
    required = false,
    multiple = false,
    searchable = false,
    nothingFound = 'No options found',
  }) => {
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const loadOptions = useCallback(async () => {
      setLoading(true);
      try {
        const data = await fetchOptions();
        setOptions(data);
      } catch {
        showNotification({
          title: 'Error',
          message: `Failed to load ${label.toLowerCase()}.`,
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    }, [fetchOptions, label]);

    useEffect(() => {
      loadOptions();
    }, [loadOptions]);

    if (loading) {
      return (
        <Group align="center">
          <Loader size="sm" />
          <span>Loading {label.toLowerCase()}...</span>
        </Group>
      );
    }

    return (
      <Select
        label={
          <Group gap="apart">
            <span>{label}</span>
            <InfoTooltip label={`Select ${label.toLowerCase()}`} />
          </Group>
        }
        placeholder={placeholder}
        data={options}
        rightSection={<IconChevronDown size="1rem" />}
        rightSectionWidth={30}
        rightSectionPointerEvents="none"
        required={required}
        multiple={multiple}
        searchable={searchable}
        nothingFound={nothingFound}
        {...formInputProps}
      />
    );
  },
);
