// FilterInput.tsx
'use client';

import React, { memo, ChangeEvent, FunctionComponent } from 'react';
import { TextInput, CloseButton } from '@mantine/core';
import { IconFilter } from '@tabler/icons-react';
import classes from './FlowAside.module.scss';

interface FilterInputProps {
  filterText: string;
  onFilterTextChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearFilterText: () => void;
}

const FilterInputComponent: FunctionComponent<FilterInputProps> = ({
  filterText,
  onFilterTextChange,
  onClearFilterText,
}) => (
  <TextInput
    variant="filled"
    size="md"
    placeholder="Filter Cards"
    aria-label="Filter cards input"
    value={filterText}
    classNames={{
      wrapper: classes.filterWrapper,
      input: classes.filterInput,
    }}
    onChange={onFilterTextChange}
    leftSection={<IconFilter size={18} className={classes.filterIcon} />}
    leftSectionWidth={40}
    rightSectionPointerEvents="all"
    rightSection={
      <CloseButton
        aria-label="Clear filter"
        onClick={onClearFilterText}
        className={`${classes.clearButton} ${filterText ? classes.visible : ''}`}
        size="sm"
        radius="xl"
      />
    }
  />
);

const FilterInput = memo<FilterInputProps>(FilterInputComponent);

export default FilterInput;
