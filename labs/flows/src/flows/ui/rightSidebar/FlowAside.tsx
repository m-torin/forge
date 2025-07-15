// FlowAside.tsx

'use client';

import { useState, useMemo, useCallback, ChangeEvent } from 'react';
import { Accordion, Box } from '@mantine/core';
import { useDebouncedState } from '@mantine/hooks';
import FilterInput from './FilterInput';
import SidebarItem from './SidebarItem';
import classes from './FlowAside.module.scss';
import { GroupData, groups } from '#/flows/nodes';

export const FlowAside: React.FC = () => {
  const [filterText, setFilterText] = useState('');
  const [debouncedFilterText, setDebouncedFilterText] = useDebouncedState(
    '',
    200,
  );

  const handleFilterTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.currentTarget;
      setFilterText(value);
      setDebouncedFilterText(value);
    },
    [setDebouncedFilterText],
  );

  const clearFilterText = useCallback(() => {
    setFilterText('');
    setDebouncedFilterText('');
  }, [setDebouncedFilterText]);

  const defaultValues = useMemo(
    () => groups.map((group) => group.label.toLowerCase().replace(/\s+/g, '')),
    [],
  );

  // **Modify filteredGroups to exclude 'default' node**
  const filteredGroups = useMemo(() => {
    if (!debouncedFilterText) {
      // Exclude 'default' node by filtering out any group that has 'default' type
      return groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => item.onDragStartType !== 'default',
          ),
        }))
        .filter((group) => group.items.length > 0);
    }

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.onDragStartType !== 'default' && // Exclude 'default' node
            item.label
              .toLowerCase()
              .includes(debouncedFilterText.toLowerCase()),
        ),
      }))
      .filter((group) => group.items.length > 0); // Remove groups with no items
  }, [debouncedFilterText]);

  const renderItem = useCallback(
    (group: GroupData) => {
      const disabled = !group.items.some((item) =>
        item.label.toLowerCase().includes(debouncedFilterText.toLowerCase()),
      );
      return (
        <SidebarItem
          key={group.label}
          group={group}
          filterText={debouncedFilterText}
          disabled={disabled}
        />
      );
    },
    [debouncedFilterText],
  );

  return (
    <Box className={classes.aside}>
      <FilterInput
        filterText={filterText}
        onFilterTextChange={handleFilterTextChange}
        onClearFilterText={clearFilterText}
      />
      <div className={classes.accordionContent}>
        <Accordion
          classNames={classes}
          radius={0}
          multiple
          variant="filled"
          defaultValue={defaultValues}
        >
          {filteredGroups.map(renderItem)}
        </Accordion>
      </div>
    </Box>
  );
};
