'use client';

import React from 'react';
import { Button, Group, Stack, Text, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useFormContext } from '../core';

/**
 * Props for the ArrayField component
 */
export interface ArrayFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The name of the array field in the form
   */
  name: string;

  /**
   * Render function for each array item
   * @param index The index of the item in the array
   * @param remove Function to remove this item from the array
   * @param path The full path to this item (e.g., "users.0")
   */
  renderItem: (index: number, remove: () => void, path: string) => React.ReactNode;

  /**
   * Label for the add button
   * @default "Add Item"
   */
  addButtonLabel?: string;

  /**
   * Custom renderer for the add button
   */
  renderAddButton?: (add: () => void, label: string) => React.ReactNode;

  /**
   * Default values for new items
   */
  defaultItemValues?: any;

  /**
   * Maximum number of items allowed
   */
  maxItems?: number;

  /**
   * Minimum number of items required
   */
  minItems?: number;

  /**
   * Whether to show the add button
   * @default true
   */
  showAddButton?: boolean;

  /**
   * CSS class for the array container
   */
  className?: string;

  /**
   * CSS class for each array item container
   */
  itemClassName?: string;

  /**
   * Whether to use Mantine UI styling
   * @default false
   */
  useMantine?: boolean;

  /**
   * Props for the Mantine Button component
   */
  buttonProps?: Record<string, any>;

  /**
   * Props for the Mantine Stack component
   */
  stackProps?: Record<string, any>;

  /**
   * Props for the item wrapper
   */
  itemWrapperProps?: Record<string, any>;

  /**
   * Content to display when the array is empty
   */
  emptyState?: React.ReactNode;

  /**
   * Whether to show a maximum items message
   * @default true when maxItems is defined
   */
  showMaxItemsMessage?: boolean;
}

/**
 * Component for managing arrays in forms
 *
 * This component provides a way to manage arrays of items in a form,
 * with support for adding, removing, and rendering items.
 *
 * @example
 * ```tsx
 * <ArrayField
 *   name="users"
 *   renderItem={(index, remove, path) => (
 *     <div>
 *       <TextField name={`${path}.name`} label="Name" />
 *       <TextField name={`${path}.email`} label="Email" />
 *       <button type="button" onClick={remove}>Remove</button>
 *     </div>
 *   )}
 *   defaultItemValues={{ name: '', email: '' }}
 * />
 * ```
 */
export function ArrayField<T = any>({
  name,
  renderItem,
  addButtonLabel = "Add Item",
  renderAddButton,
  defaultItemValues = {},
  maxItems,
  minItems = 0,
  showAddButton = true,
  className,
  itemClassName,
  useMantine = false,
  buttonProps = {},
  stackProps = {},
  itemWrapperProps = {},
  emptyState,
  showMaxItemsMessage,
  ...props
}: ArrayFieldProps) {
  const form = useFormContext<T>();

  // Get the current array value
  const arrayValue = React.useMemo(() => {
    const values = form.getValues();
    return getNestedValue(values, name) || [];
  }, [form, name]);

  // Add a new item to the array
  const addItem = React.useCallback(() => {
    // Check if we've reached the maximum number of items
    if (maxItems !== undefined && arrayValue.length >= maxItems) {
      return;
    }

    form.insertListItem(name, { ...defaultItemValues });
  }, [form, name, arrayValue.length, maxItems, defaultItemValues]);

  // Remove an item from the array
  const removeItem = React.useCallback((index: number) => {
    // Check if we've reached the minimum number of items
    if (arrayValue.length <= minItems) {
      return;
    }

    form.removeListItem(name, index);
  }, [form, name, arrayValue.length, minItems]);

  // Default add button renderer (with or without Mantine)
  const defaultRenderAddButton = () => {
    if (useMantine) {
      return (
        <Button
          leftIcon={<IconPlus size="1rem" />}
          variant="outline"
          onClick={addItem}
          disabled={maxItems !== undefined && arrayValue.length >= maxItems}
          {...buttonProps}
        >
          {addButtonLabel}
        </Button>
      );
    }

    return (
      <button
        type="button"
        onClick={addItem}
        className="array-field-add-button"
        disabled={maxItems !== undefined && arrayValue.length >= maxItems}
      >
        {addButtonLabel}
      </button>
    );
  };

  // Render item with or without Mantine styling
  const renderArrayItem = (index: number, path: string) => {
    const removeHandler = () => removeItem(index);

    if (useMantine) {
      return (
        <div {...itemWrapperProps}>
          <Group position="apart" align="flex-start" noWrap>
            <div style={{ flexGrow: 1 }}>
              {renderItem(index, removeHandler, path)}
            </div>
            <ActionIcon
              color="red"
              variant="subtle"
              onClick={removeHandler}
              title="Remove item"
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Group>
        </div>
      );
    }

    return (
      <div className={`array-field-item ${itemClassName || ''}`}>
        {renderItem(index, removeHandler, path)}
      </div>
    );
  };

  // Determine if we should show the max items message
  const shouldShowMaxItemsMessage =
    showMaxItemsMessage !== undefined
      ? showMaxItemsMessage
      : (maxItems !== undefined && useMantine);

  // Render the component with or without Mantine styling
  const content = (
    <>
      {arrayValue.length === 0 && emptyState ? (
        <div>{emptyState}</div>
      ) : (
        arrayValue.map((_, index) => {
          const itemPath = `${name}.${index}`;
          return (
            <div key={index}>
              {renderArrayItem(index, itemPath)}
            </div>
          );
        })
      )}

      {showAddButton && (
        <div className={useMantine ? undefined : "array-field-actions"}>
          {renderAddButton ? renderAddButton(addItem, addButtonLabel) : defaultRenderAddButton()}
        </div>
      )}

      {shouldShowMaxItemsMessage && maxItems !== undefined && (
        <Text size="sm" color="dimmed">
          {maxItems} items maximum
        </Text>
      )}
    </>
  );

  // Wrap in Stack if using Mantine, otherwise in a div
  if (useMantine) {
    return (
      <Stack spacing="md" {...stackProps} {...props}>
        {content}
      </Stack>
    );
  }

  return (
    <div className={`array-field ${className || ''}`} {...props}>
      {content}
    </div>
  );
}

/**
 * Props for a sortable array field
 */
export interface SortableArrayFieldProps extends Omit<ArrayFieldProps, 'renderItem'> {
  /**
   * Render function for each array item
   * @param index The index of the item in the array
   * @param remove Function to remove this item from the array
   * @param path The full path to this item (e.g., "users.0")
   * @param dragHandleProps Props for the drag handle
   */
  renderItem: (
    index: number,
    remove: () => void,
    path: string,
    dragHandleProps?: Record<string, any>
  ) => React.ReactNode;

  /**
   * Props for the drag handle
   */
  dragHandleProps?: Record<string, any>;
}

/**
 * A component for rendering sortable arrays of form fields
 * This is a placeholder for future implementation with drag-and-drop sorting
 */
export function SortableArrayField(props: SortableArrayFieldProps) {
  // For now, just use the regular ArrayField
  // In the future, this could be enhanced with drag-and-drop sorting
  const { dragHandleProps, ...rest } = props;

  return (
    <ArrayField
      {...rest}
      renderItem={(index, remove, path) =>
        props.renderItem(index, remove, path, dragHandleProps)
      }
    />
  );
}

/**
 * Props for the NestedField component
 */
export interface NestedFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The base path for nested fields
   */
  name: string;

  /**
   * The nested fields to render
   */
  children: React.ReactNode;

  /**
   * CSS class for the nested field container
   */
  className?: string;
}

/**
 * Context for nested fields
 */
export const NestedFieldContext = React.createContext<{ basePath: string }>({ basePath: '' });

/**
 * Component for managing nested fields in forms
 *
 * This component provides a context for nested fields, allowing them
 * to be rendered with a base path.
 *
 * @example
 * ```tsx
 * <NestedField name="address">
 *   <TextField name="street" label="Street" />
 *   <TextField name="city" label="City" />
 *   <TextField name="state" label="State" />
 *   <TextField name="zip" label="ZIP" />
 * </NestedField>
 * ```
 *
 * This will render fields with names like "address.street", "address.city", etc.
 */
export function NestedField({
  name,
  children,
  className,
  ...props
}: NestedFieldProps) {
  // Get the parent context if it exists
  const parentContext = React.useContext(NestedFieldContext);

  // Create the full path by combining the parent path with this path
  const fullPath = parentContext.basePath
    ? `${parentContext.basePath}.${name}`
    : name;

  return (
    <div className={`nested-field ${className || ''}`} {...props}>
      <NestedFieldContext.Provider value={{ basePath: fullPath }}>
        {children}
      </NestedFieldContext.Provider>
    </div>
  );
}

/**
 * Hook for getting the current nested field path
 */
export function useNestedFieldPath(fieldName: string): string {
  const { basePath } = React.useContext(NestedFieldContext);
  return basePath ? `${basePath}.${fieldName}` : fieldName;
}

/**
 * Helper function to get a nested value from an object
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

/**
 * Backward compatibility: Export DynamicArrayField as an alias for ArrayField with Mantine styling
 */
export function DynamicArrayField<T = any>({
  name,
  renderItem,
  addButtonLabel = 'Add item',
  buttonProps = {},
  itemWrapperProps = {},
  emptyState,
  maxItems,
  minItems,
  ...rest
}: Omit<ArrayFieldProps, 'renderItem'> & {
  renderItem: (index: number, remove: () => void) => React.ReactNode;
}) {
  // Adapt the renderItem function to match ArrayField's signature
  const adaptedRenderItem = (index: number, remove: () => void, path: string) =>
    renderItem(index, remove);

  return (
    <ArrayField
      name={name}
      renderItem={adaptedRenderItem}
      addButtonLabel={addButtonLabel}
      defaultItemValues={{}}
      maxItems={maxItems}
      minItems={minItems}
      useMantine={true}
      buttonProps={buttonProps}
      itemWrapperProps={itemWrapperProps}
      emptyState={emptyState}
      showMaxItemsMessage={true}
      {...rest}
    />
  );
}
