'use client';

import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useCallback, useState, useTransition } from 'react';

export interface CrudOperations<T> {
  create: (data: Partial<T>) => Promise<T>;
  read?: (id: string) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list?: () => Promise<T[]>;
  duplicate?: (id: string) => Promise<T>;
}

export interface CrudState<T> {
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  data: T[];
}

export interface UseModelCrudOptions<T> {
  operations: CrudOperations<T>;
  onSuccess?: {
    create?: (item: T) => void;
    update?: (item: T) => void;
    delete?: (id: string) => void;
    duplicate?: (item: T) => void;
  };
  onError?: {
    create?: (error: Error) => void;
    update?: (error: Error) => void;
    delete?: (error: Error) => void;
    duplicate?: (error: Error) => void;
  };
  notifications?: {
    create?: { success?: string; error?: string };
    update?: { success?: string; error?: string };
    delete?: { success?: string; error?: string };
    duplicate?: { success?: string; error?: string };
  };
  optimisticUpdates?: boolean;
}

export function useModelCrud<T extends { id: string }>({
  operations,
  onSuccess,
  onError,
  notifications: notificationConfig,
  optimisticUpdates = true,
}: UseModelCrudOptions<T>) {
  const [state, setState] = useState<CrudState<T>>({
    loading: false,
    saving: false,
    deleting: false,
    error: null,
    data: [],
  });

  const [isPending, startTransition] = useTransition();

  const showNotification = useCallback(
    (type: 'success' | 'error', operation: keyof CrudOperations<T>, message?: string) => {
      const config = notificationConfig?.[operation as keyof typeof notificationConfig];
      const defaultMessages = {
        create: { success: 'Item created successfully', error: 'Failed to create item' },
        read: { success: 'Item loaded successfully', error: 'Failed to load item' },
        update: { success: 'Item updated successfully', error: 'Failed to update item' },
        delete: { success: 'Item deleted successfully', error: 'Failed to delete item' },
        list: { success: 'Items loaded successfully', error: 'Failed to load items' },
        duplicate: { success: 'Item duplicated successfully', error: 'Failed to duplicate item' },
      } as const;

      const finalMessage = message || config?.[type] || defaultMessages[operation]?.[type];

      if (finalMessage) {
        notifications.show({
          title: type === 'success' ? 'Success' : 'Error',
          message: finalMessage,
          color: type === 'success' ? 'green' : 'red',
          icon: type === 'success' ? <IconCheck size={16} /> : <IconX size={16} />,
          autoClose: type === 'success' ? 3000 : 5000,
        });
      }
    },
    [notificationConfig],
  );

  const updateState = useCallback((updates: Partial<CrudState<T>>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const loadData = useCallback(async () => {
    if (!operations.list) return;

    updateState({ loading: true, error: null });
    try {
      const data = await operations.list();
      updateState({ data, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      updateState({ error: errorMessage, loading: false });
    }
  }, [operations, updateState]);

  const createItem = useCallback(
    async (data: Partial<T>) => {
      updateState({ saving: true, error: null });
      try {
        const newItem = await operations.create(data);

        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            data: [...prev.data, newItem],
            saving: false,
          }));
        } else {
          updateState({ saving: false });
        }

        showNotification('success', 'create');
        onSuccess?.create?.(newItem);
        return newItem;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
        updateState({ error: errorMessage, saving: false });
        showNotification('error', 'create', errorMessage);
        onError?.create?.(error as Error);
        throw error;
      }
    },
    [operations, optimisticUpdates, updateState, showNotification, onSuccess, onError],
  );

  const updateItem = useCallback(
    async (id: string, data: Partial<T>) => {
      updateState({ saving: true, error: null });

      // Store original data for potential rollback
      let originalData: T[] | null = null;

      if (optimisticUpdates) {
        setState((prev) => {
          originalData = [...prev.data];
          return {
            ...prev,
            data: prev.data.map((item) => (item.id === id ? { ...item, ...data } : item)),
          };
        });
      }

      try {
        const updatedItem = await operations.update(id, data);

        setState((prev) => ({
          ...prev,
          data: prev.data.map((item) => (item.id === id ? updatedItem : item)),
          saving: false,
        }));

        showNotification('success', 'update');
        onSuccess?.update?.(updatedItem);
        return updatedItem;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update item';

        // Revert optimistic update
        if (optimisticUpdates && originalData) {
          setState((prev) => ({
            ...prev,
            data: originalData!,
            error: errorMessage,
            saving: false,
          }));
        } else {
          updateState({ error: errorMessage, saving: false });
        }

        showNotification('error', 'update', errorMessage);
        onError?.update?.(error as Error);
        throw error;
      }
    },
    [operations, optimisticUpdates, updateState, showNotification, onSuccess, onError],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      updateState({ deleting: true, error: null });

      // Store original data for potential rollback
      let originalData: T[] | null = null;

      if (optimisticUpdates) {
        setState((prev) => {
          originalData = [...prev.data];
          return {
            ...prev,
            data: prev.data.filter((item) => item.id !== id),
          };
        });
      }

      try {
        await operations.delete(id);

        if (!optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            data: prev.data.filter((item) => item.id !== id),
          }));
        }

        updateState({ deleting: false });
        showNotification('success', 'delete');
        onSuccess?.delete?.(id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';

        // Revert optimistic delete
        if (optimisticUpdates && originalData) {
          setState((prev) => ({
            ...prev,
            data: originalData!,
            error: errorMessage,
            deleting: false,
          }));
        } else {
          updateState({ error: errorMessage, deleting: false });
        }

        showNotification('error', 'delete', errorMessage);
        onError?.delete?.(error as Error);
        throw error;
      }
    },
    [operations, optimisticUpdates, updateState, showNotification, onSuccess, onError],
  );

  const duplicateItem = useCallback(
    async (id: string) => {
      if (!operations.duplicate) {
        throw new Error('Duplicate operation not supported');
      }

      updateState({ saving: true, error: null });
      try {
        const duplicatedItem = await operations.duplicate(id);

        if (optimisticUpdates) {
          setState((prev) => ({
            ...prev,
            data: [...prev.data, duplicatedItem],
            saving: false,
          }));
        } else {
          updateState({ saving: false });
        }

        showNotification('success', 'duplicate');
        onSuccess?.duplicate?.(duplicatedItem);
        return duplicatedItem;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate item';
        updateState({ error: errorMessage, saving: false });
        showNotification('error', 'duplicate', errorMessage);
        onError?.duplicate?.(error as Error);
        throw error;
      }
    },
    [operations, optimisticUpdates, updateState, showNotification, onSuccess, onError],
  );

  const refresh = useCallback(() => {
    startTransition(() => {
      loadData();
    });
  }, [loadData]);

  return {
    // State
    ...state,
    isPending,

    // Actions
    loadData,
    createItem,
    updateItem,
    deleteItem,
    duplicateItem,
    refresh,

    // Utilities
    clearError: () => updateState({ error: null }),
    setState: updateState,
  };
}
