'use client';

import { useState, useCallback, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconX,
  IconLoader,
  IconArrowBack,
} from '@tabler/icons-react';

interface OptimisticState<T> {
  data: T;
  status: 'idle' | 'pending' | 'success' | 'error';
  error?: Error;
  originalData?: T;
}

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  operation: 'create' | 'update' | 'delete';
  timestamp: number;
  rollbackData?: T;
}

interface UseOptimisticOperationsOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData?: T) => void;
  enableRollback?: boolean;
  maxRetries?: number;
}

export function useOptimisticOperations<T extends { id?: string | number }>(
  initialData: T[],
  options: UseOptimisticOperationsOptions<T[]> = {}
) {
  const [data, setData] = useState<T[]>(initialData);
  const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate<T>>>(new Map());
  const [state, setState] = useState<OptimisticState<T[]>>({
    data: initialData,
    status: 'idle',
  });
  
  const retryCountRef = useRef<Map<string, number>>(new Map());
  const { maxRetries = 3, enableRollback = true } = options;

  const generateUpdateId = () => `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const applyOptimisticUpdate = useCallback((
    operation: 'create' | 'update' | 'delete',
    item: T,
    rollbackData?: T
  ) => {
    const updateId = generateUpdateId();
    
    const update: OptimisticUpdate<T> = {
      id: updateId,
      data: item,
      operation,
      timestamp: Date.now(),
      rollbackData,
    };

    // Apply optimistic update to UI immediately
    setData(currentData => {
      let newData = [...currentData];
      
      switch (operation) {
        case 'create':
          newData.push(item);
          break;
        case 'update':
          const updateIndex = newData.findIndex(d => d.id === item.id);
          if (updateIndex !== -1) {
            newData[updateIndex] = { ...newData[updateIndex], ...item };
          }
          break;
        case 'delete':
          newData = newData.filter(d => d.id !== item.id);
          break;
      }
      
      return newData;
    });

    // Track pending update
    setPendingUpdates(prev => new Map(prev).set(updateId, update));

    // Show optimistic feedback
    notifications.show({
      id: updateId,
      title: 'Processing...',
      message: `${operation.charAt(0).toUpperCase() + operation.slice(1)} operation in progress`,
      loading: true,
      autoClose: false,
    });

    return updateId;
  }, []);

  const confirmOptimisticUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });

    retryCountRef.current.delete(updateId);

    // Update success notification
    notifications.update({
      id: updateId,
      title: 'Success',
      message: 'Operation completed successfully',
      icon: <IconCheck size={16} />,
      loading: false,
      autoClose: 3000,
      color: 'green',
    });

    options.onSuccess?.(data);
  }, [data, options]);

  const rollbackOptimisticUpdate = useCallback((updateId: string, error?: Error) => {
    const update = pendingUpdates.get(updateId);
    if (!update) return;

    if (enableRollback) {
      // Rollback the UI change
      setData(currentData => {
        let newData = [...currentData];
        
        switch (update.operation) {
          case 'create':
            // Remove the optimistically added item
            newData = newData.filter(d => d.id !== update.data.id);
            break;
          case 'update':
            // Restore original data
            if (update.rollbackData) {
              const rollbackIndex = newData.findIndex(d => d.id === update.data.id);
              if (rollbackIndex !== -1) {
                newData[rollbackIndex] = update.rollbackData;
              }
            }
            break;
          case 'delete':
            // Re-add the deleted item
            if (update.rollbackData) {
              newData.push(update.rollbackData);
            }
            break;
        }
        
        return newData;
      });
    }

    // Remove from pending updates
    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });

    // Show error notification with retry option
    const retryCount = retryCountRef.current.get(updateId) || 0;
    const canRetry = retryCount < maxRetries;

    notifications.update({
      id: updateId,
      title: 'Operation Failed',
      message: error?.message || 'An error occurred',
      icon: <IconX size={16} />,
      loading: false,
      autoClose: false,
      color: 'red',
      withCloseButton: true,
      onClick: canRetry ? () => retryOptimisticUpdate(updateId) : undefined,
    });

    options.onError?.(error || new Error('Operation failed'), update.rollbackData ? [update.rollbackData] : undefined);
  }, [pendingUpdates, enableRollback, maxRetries, options]);

  const retryOptimisticUpdate = useCallback(async (updateId: string) => {
    const update = pendingUpdates.get(updateId);
    if (!update) return;

    const currentRetryCount = retryCountRef.current.get(updateId) || 0;
    if (currentRetryCount >= maxRetries) {
      notifications.show({
        title: 'Max Retries Reached',
        message: 'Operation failed after maximum retry attempts',
        color: 'red',
      });
      return;
    }

    // Update retry count
    retryCountRef.current.set(updateId, currentRetryCount + 1);

    // Show retry notification
    notifications.update({
      id: updateId,
      title: 'Retrying...',
      message: `Retry attempt ${currentRetryCount + 1} of ${maxRetries}`,
      loading: true,
      autoClose: false,
    });

    // Re-apply the optimistic update
    const newUpdateId = applyOptimisticUpdate(update.operation, update.data, update.rollbackData);
    
    // Transfer retry count to new update
    retryCountRef.current.set(newUpdateId, currentRetryCount + 1);
    retryCountRef.current.delete(updateId);
  }, [pendingUpdates, maxRetries, applyOptimisticUpdate]);

  const optimisticCreate = useCallback(async (
    item: Omit<T, 'id'> & { id?: string | number },
    serverOperation: (item: T) => Promise<T>
  ) => {
    // Generate temporary ID for optimistic update
    const tempItem = { ...item, id: item.id || `temp-${Date.now()}` } as T;
    const updateId = applyOptimisticUpdate('create', tempItem);

    try {
      const result = await serverOperation(tempItem);
      
      // Update the data with the real server response
      setData(currentData => 
        currentData.map(d => d.id === tempItem.id ? result : d)
      );
      
      confirmOptimisticUpdate(updateId);
      return result;
    } catch (error) {
      rollbackOptimisticUpdate(updateId, error as Error);
      throw error;
    }
  }, [applyOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate]);

  const optimisticUpdate = useCallback(async (
    item: T,
    serverOperation: (item: T) => Promise<T>
  ) => {
    // Store original data for rollback
    const originalItem = data.find(d => d.id === item.id);
    const updateId = applyOptimisticUpdate('update', item, originalItem);

    try {
      const result = await serverOperation(item);
      
      // Update with server response
      setData(currentData => 
        currentData.map(d => d.id === item.id ? result : d)
      );
      
      confirmOptimisticUpdate(updateId);
      return result;
    } catch (error) {
      rollbackOptimisticUpdate(updateId, error as Error);
      throw error;
    }
  }, [data, applyOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate]);

  const optimisticDelete = useCallback(async (
    itemId: string | number,
    serverOperation: (id: string | number) => Promise<void>
  ) => {
    // Find item to delete for rollback
    const itemToDelete = data.find(d => d.id === itemId);
    if (!itemToDelete) return;

    const updateId = applyOptimisticUpdate('delete', itemToDelete, itemToDelete);

    try {
      await serverOperation(itemId);
      confirmOptimisticUpdate(updateId);
    } catch (error) {
      rollbackOptimisticUpdate(updateId, error as Error);
      throw error;
    }
  }, [data, applyOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate]);

  const optimisticBulkUpdate = useCallback(async (
    items: T[],
    serverOperation: (items: T[]) => Promise<T[]>
  ) => {
    // Store original data for rollback
    const originalData = [...data];
    const updateIds: string[] = [];

    // Apply all optimistic updates
    items.forEach(item => {
      const originalItem = data.find(d => d.id === item.id);
      const updateId = applyOptimisticUpdate('update', item, originalItem);
      updateIds.push(updateId);
    });

    try {
      const results = await serverOperation(items);
      
      // Update with server responses
      setData(currentData => {
        let newData = [...currentData];
        results.forEach(result => {
          const index = newData.findIndex(d => d.id === result.id);
          if (index !== -1) {
            newData[index] = result;
          }
        });
        return newData;
      });
      
      // Confirm all updates
      updateIds.forEach(updateId => confirmOptimisticUpdate(updateId));
      
      return results;
    } catch (error) {
      // Rollback all updates
      updateIds.forEach(updateId => rollbackOptimisticUpdate(updateId, error as Error));
      throw error;
    }
  }, [data, applyOptimisticUpdate, confirmOptimisticUpdate, rollbackOptimisticUpdate]);

  const rollbackAll = useCallback(() => {
    const updateIds = Array.from(pendingUpdates.keys());
    updateIds.forEach(updateId => {
      rollbackOptimisticUpdate(updateId, new Error('Manual rollback'));
    });

    notifications.show({
      title: 'Operations Rolled Back',
      message: 'All pending operations have been cancelled',
      icon: <IconArrowBack size={16} />,
      color: 'blue',
    });
  }, [pendingUpdates, rollbackOptimisticUpdate]);

  const getPendingCount = useCallback(() => {
    return pendingUpdates.size;
  }, [pendingUpdates]);

  const hasPendingOperations = useCallback(() => {
    return pendingUpdates.size > 0;
  }, [pendingUpdates]);

  return {
    data,
    state,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    optimisticBulkUpdate,
    rollbackAll,
    getPendingCount,
    hasPendingOperations,
    pendingUpdates: Array.from(pendingUpdates.values()),
  };
}

// Higher-order component for wrapping forms with optimistic operations
export function withOptimisticOperations<T extends { id?: string | number }>(
  Component: React.ComponentType<any>,
  initialData: T[]
) {
  return function OptimisticWrapper(props: any) {
    const optimistic = useOptimisticOperations(initialData);
    
    return (
      <Component 
        {...props} 
        optimistic={optimistic}
      />
    );
  };
}