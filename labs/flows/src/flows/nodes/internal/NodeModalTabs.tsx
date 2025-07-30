'use client';

import { useState, useCallback, type ReactNode, useEffect } from 'react';
import { Tabs, Button, Stack, rem, Text, Center, Box } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export interface TabItem {
  id: string;
  [key: string]: any;
}

interface TabsManagerProps<T extends TabItem> {
  initialItems?: T[];
  onItemsChange?: (items: T[]) => void;
  renderTabLabel: (item: T) => ReactNode;
  renderTabPanel: (
    item: T,
    index: number,
    updateItem: (updatedItem: T) => void,
  ) => ReactNode;
  buttonLabel?: string;
  addButtonComponent?: ReactNode;
  removeButtonComponent?: ReactNode;
  newItemTemplate: (id: string) => T;
  defaultTab?: string;
  zeroStateTitle?: string;
  zeroStateDescription?: string;
  zeroStateComponent?: ReactNode;
}

export const TabsManager = <T extends TabItem>({
  initialItems = [],
  onItemsChange,
  renderTabLabel,
  renderTabPanel,
  buttonLabel = 'Item',
  addButtonComponent,
  removeButtonComponent,
  newItemTemplate,
  defaultTab,
  zeroStateTitle,
  zeroStateDescription,
  zeroStateComponent,
}: TabsManagerProps<T>) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [activeTab, setActiveTab] = useState<string>(() => {
    // Always return a string value for activeTab
    if (items.length > 0) {
      return items[0].id;
    }
    if (defaultTab) {
      return defaultTab;
    }
    // Return a placeholder value when no tabs exist
    return 'no-tabs';
  });

  // Update active tab when items change
  useEffect(() => {
    if (items.length > 0) {
      // If current active tab doesn't exist in items, switch to first tab
      if (!items.some((item) => item.id === activeTab)) {
        setActiveTab(items[0].id);
      }
    } else {
      // If no items, set to default tab or placeholder
      setActiveTab(defaultTab || 'no-tabs');
    }
  }, [items, activeTab, defaultTab]);

  const updateItems = useCallback(
    (newItems: T[]) => {
      setItems(newItems);
      onItemsChange?.(newItems);
    },
    [onItemsChange],
  );

  const addItem = useCallback(() => {
    const newItem = newItemTemplate(`${buttonLabel}-${Date.now()}`);
    updateItems([...items, newItem]);
    setActiveTab(newItem.id);
  }, [items, buttonLabel, newItemTemplate, updateItems]);

  const removeItem = useCallback(
    (index: number) => {
      const itemToRemove = items[index];
      const newItems = items.filter((_, i) => i !== index);
      updateItems(newItems);

      // Update active tab after removal
      if (itemToRemove.id === activeTab) {
        if (index > 0 && newItems.length > 0) {
          setActiveTab(newItems[index - 1].id);
        } else if (newItems.length > 0) {
          setActiveTab(newItems[0].id);
        } else {
          setActiveTab(defaultTab || 'no-tabs');
        }
      }
    },
    [items, activeTab, updateItems, defaultTab],
  );

  const updateItem = useCallback(
    (index: number, updatedItem: T) => {
      const newItems = [...items];
      newItems[index] = updatedItem;
      updateItems(newItems);
    },
    [items, updateItems],
  );

  const handleTabChange = useCallback(
    (value: string | null) => {
      // Ensure we always set a string value
      if (value && items.some((item) => item.id === value)) {
        setActiveTab(value);
      }
    },
    [items],
  );

  // Zero state rendering
  if (items.length === 0) {
    if (zeroStateComponent) {
      return zeroStateComponent;
    }

    return (
      <Box>
        <Center>
          <Stack align="center" gap="md" py="xl">
            {zeroStateTitle && (
              <Text size="lg" fw={500}>
                {zeroStateTitle}
              </Text>
            )}
            {zeroStateDescription && (
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                {zeroStateDescription}
              </Text>
            )}
            {addButtonComponent ?? (
              <Button
                variant="light"
                color="indigo"
                leftSection={<IconPlus size={16} />}
                onClick={addItem}
              >
                Add {buttonLabel}
              </Button>
            )}
          </Stack>
        </Center>
      </Box>
    );
  }

  return (
    <Tabs orientation="vertical" value={activeTab} onChange={handleTabChange}>
      <Tabs.List>
        {items.map((item) => (
          <Tabs.Tab key={item.id} value={item.id}>
            {renderTabLabel(item)}
          </Tabs.Tab>
        ))}
        {addButtonComponent ?? (
          <Button
            variant="light"
            color="indigo"
            leftSection={<IconPlus size={16} />}
            onClick={addItem}
            mt="sm"
            mx="md"
          >
            Add {buttonLabel}
          </Button>
        )}
      </Tabs.List>

      {items.map((item, index) => (
        <Tabs.Panel key={item.id} value={item.id} ml={rem(15)}>
          <Stack gap="md">
            {renderTabPanel(item, index, (updatedItem: T) =>
              updateItem(index, updatedItem),
            )}
            {removeButtonComponent ?? (
              <Button
                variant="subtle"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={() => removeItem(index)}
              >
                Remove {buttonLabel}
              </Button>
            )}
          </Stack>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};
